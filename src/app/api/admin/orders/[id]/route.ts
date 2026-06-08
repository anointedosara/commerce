import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getSession } from "@/lib/auth";
import { ok, fail, serialize } from "@/lib/api";

const schema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

// PATCH /api/admin/orders/:id -> update order status (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);
  if (session.role !== "admin") return fail("Admin access required", 403);

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Invalid status", 422);

  await connectDB();
  const order = await Order.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true }).lean();
  if (!order) return fail("Order not found", 404);

  return ok({ order: serialize(order) });
}
