import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { Message } from "@/models/Message";
import { serialize } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { OrderLite } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await connectDB();

  const [orderCount, productCount, userCount, messageCount, paidOrders, recent] = await Promise.all([
    Order.countDocuments({}),
    Product.countDocuments({}),
    User.countDocuments({}),
    Message.countDocuments({ handled: false }),
    Order.find({ status: { $ne: "cancelled" } }).select("total").lean(),
    Order.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const revenue = paidOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const recentOrders = serialize<OrderLite[]>(recent);

  const stats = [
    { label: "Revenue", value: formatPrice(revenue) },
    { label: "Orders", value: String(orderCount) },
    { label: "Products", value: String(productCount) },
    { label: "Customers", value: String(userCount) },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      {messageCount > 0 && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
          📨 You have {messageCount} unhandled contact message{messageCount > 1 ? "s" : ""}.
        </div>
      )}

      <h2 className="mt-10 mb-4 text-xl font-bold text-foreground">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {recentOrders.map((o) => (
            <Card key={o._id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-mono text-sm text-muted">#{o._id.slice(-8)}</p>
                <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs capitalize text-muted">{o.status}</span>
                <span className="font-semibold text-foreground">{formatPrice(o.total)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Link href="/admin/orders" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
        View all orders →
      </Link>
    </div>
  );
}
