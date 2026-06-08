import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { getSession } from "@/lib/auth";
import { ok, fail, serialize } from "@/lib/api";

async function loadCart(userId: string) {
  const cart = await Cart.findOne({ userId })
    .populate({ path: "items.productId", model: Product, select: "title slug images price currency stock" })
    .lean();
  return cart;
}

// GET /api/cart
export async function GET() {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);
  await connectDB();
  const cart = await loadCart(session.userId);
  return ok({ cart: serialize(cart) ?? { items: [] } });
}

const addSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).default(1),
});

// POST /api/cart  -> add (or increment) an item
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("productId and qty are required", 422);
  const { productId, qty } = parsed.data;

  await connectDB();
  const product = await Product.findById(productId).select("price").lean();
  if (!product) return fail("Product not found", 404);

  const cart = (await Cart.findOne({ userId: session.userId })) ?? new Cart({ userId: session.userId, items: [] });
  const existing = cart.items.find((i) => i.productId.toString() === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId: product._id, qty, priceAtAdd: product.price });
  }
  await cart.save();

  return ok({ cart: serialize(await loadCart(session.userId)) }, { status: 201 });
}

const patchSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(0), // 0 removes
});

// PATCH /api/cart  -> set quantity (qty 0 removes the line)
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("productId and qty are required", 422);
  const { productId, qty } = parsed.data;

  await connectDB();
  const cart = await Cart.findOne({ userId: session.userId });
  if (!cart) return fail("Cart not found", 404);

  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) return fail("Item not in cart", 404);

  if (qty === 0) {
    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId,
    ) as unknown as typeof cart.items;
  } else {
    item.qty = qty;
  }
  await cart.save();

  return ok({ cart: serialize(await loadCart(session.userId)) });
}

// DELETE /api/cart?productId=...  -> remove a line (or clear all if omitted)
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  await connectDB();
  const cart = await Cart.findOne({ userId: session.userId });
  if (!cart) return ok({ cart: { items: [] } });

  const productId = new URL(request.url).searchParams.get("productId");
  cart.items = (
    productId ? cart.items.filter((i) => i.productId.toString() !== productId) : []
  ) as unknown as typeof cart.items;
  await cart.save();

  return ok({ cart: serialize(await loadCart(session.userId)) });
}
