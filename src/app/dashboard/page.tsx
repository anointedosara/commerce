import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { serialize } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { OrderLite } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ordered?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const { ordered } = await searchParams;

  await connectDB();
  const orders = serialize(
    await Order.find({ userId: session.userId }).sort({ createdAt: -1 }).lean(),
  ) as OrderLite[];

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted">{session.email}</p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm">Account settings</Button>
        </Link>
      </div>

      {ordered && (
        <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400">
          🎉 Your order was placed successfully!
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Total orders</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{orders.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Total spent</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{formatPrice(totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Account type</p>
          <p className="mt-1 text-3xl font-bold capitalize text-foreground">{session.role}</p>
        </Card>
      </div>

      {/* Orders */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-foreground">Order history</h2>
      {orders.length === 0 ? (
        <Card className="text-center">
          <p className="mb-4 text-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/products"><Button>Start shopping</Button></Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link key={o._id} href={`/dashboard/orders/${o._id}`} className="block">
            <Card className="flex flex-col gap-3 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm text-muted">#{o._id.slice(-8)}</p>
                <p className="text-sm text-foreground">
                  {o.items.length} item{o.items.length > 1 ? "s" : ""} ·{" "}
                  {new Date(o.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted">
                  {o.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium capitalize text-brand-700 dark:bg-white/5 dark:text-brand-100">
                  {o.status}
                </span>
                <span className="text-lg font-semibold text-foreground">{formatPrice(o.total)}</span>
              </div>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
