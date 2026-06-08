import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Types } from "mongoose";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { serialize } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { OrderLite } from "@/types";

export const dynamic = "force-dynamic";

interface OrderFull extends OrderLite {
  shippingAddress?: { line1?: string; city?: string; zip?: string; country?: string };
  currency?: string;
}

const STEPS = ["pending", "paid", "shipped", "delivered"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await Order.findOne({ _id: id, userId: session.userId }).lean();
  if (!doc) notFound();
  const order = serialize<OrderFull>(doc);

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">← Back to orders</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">Order #{order._id.slice(-8)}</h1>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium capitalize text-brand-700 dark:bg-white/5 dark:text-brand-100">
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">Placed {new Date(order.createdAt).toLocaleString()}</p>

      {/* Status timeline */}
      {order.status !== "cancelled" && (
        <div className="mt-6 flex items-center">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${i <= currentStep ? "bg-brand-600 text-white" : "bg-border text-muted"}`}>
                  {i + 1}
                </div>
                <span className="mt-1 text-xs capitalize text-muted">{step}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? "bg-brand-600" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Items</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-2">
                <span className="text-muted">{i.qty}× {i.title}</span>
                <span className="text-foreground">{formatPrice(i.price * i.qty, order.currency)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Shipping to</h2>
          {order.shippingAddress?.line1 ? (
            <address className="text-sm not-italic text-muted">
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.zip}<br />
              {order.shippingAddress.country}
            </address>
          ) : (
            <p className="text-sm text-muted">No address on file.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal, order.currency)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping, order.currency)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{formatPrice(order.tax, order.currency)}</dd></div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt><dd>{formatPrice(order.total, order.currency)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
