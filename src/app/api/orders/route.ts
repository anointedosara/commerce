import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { getSession } from "@/lib/auth";
import { ok, fail, serialize } from "@/lib/api";

// GET /api/orders  -> current user's orders
export async function GET() {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  await connectDB();
  const orders = await Order.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();
  return ok({ orders: serialize(orders) });
}

// POST /api/orders  -> checkout: turn the cart into an order
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const body = (await request.json().catch(() => ({}))) as {
    shippingAddress?: { line1?: string; city?: string; zip?: string; country?: string };
  };

  await connectDB();
  const cart = await Cart.findOne({ userId: session.userId }).populate({
    path: "items.productId",
    model: Product,
    select: "title price",
  });

  if (!cart || cart.items.length === 0) return fail("Your cart is empty", 400);

  const items = cart.items.map((i) => {
    // productId is populated here
    const p = i.productId as unknown as { _id: unknown; title: string; price: number };
    return { productId: p._id, title: p.title, qty: i.qty, price: p.price };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 500; // free shipping over $50
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const order = await Order.create({
    userId: session.userId,
    items,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress: body.shippingAddress,
    status: "paid", // demo: assume payment succeeded
  });

  // Clear the cart
  cart.items = [] as unknown as typeof cart.items;
  await cart.save();

  return ok({ order: serialize(order.toObject()) }, { status: 201 });
}
