import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { serialize } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { AdminOrderStatus } from "@/components/AdminOrderStatus";

export const dynamic = "force-dynamic";

interface AdminOrder {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { title: string; qty: number }[];
  userId?: { name?: string; email?: string } | null;
}

export default async function AdminOrdersPage() {
  await connectDB();
  const orders = serialize<AdminOrder[]>(
    await Order.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: "userId", model: User, select: "name email" })
      .lean(),
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Orders</h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left text-muted dark:bg-white/5">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-border align-top">
                <td className="px-4 py-3">
                  <p className="font-mono text-foreground">#{o._id.slice(-8)}</p>
                  <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">{o.userId?.name ?? "—"}</p>
                  <p className="text-xs text-muted">{o.userId?.email}</p>
                </td>
                <td className="px-4 py-3 text-muted">{o.items.reduce((n, i) => n + i.qty, 0)} item(s)</td>
                <td className="px-4 py-3 font-medium text-foreground">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <AdminOrderStatus orderId={o._id} status={o.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
