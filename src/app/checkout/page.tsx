"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { CartItem, ProductLite } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      const data = await res.json();
      if (!active) return;
      setItems(data.cart?.items ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const product = (i: CartItem) => i.productId as ProductLite;
  const subtotal = items.reduce((sum, i) => sum + product(i).price * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPlacing(true);
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingAddress: f }),
    });
    if (res.ok) {
      router.push("/dashboard?ordered=1");
      router.refresh();
    } else {
      setPlacing(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-muted">Loading checkout…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="text-center">
          <p className="mb-4 text-muted">Your cart is empty — nothing to check out.</p>
          <Link href="/products"><Button>Browse products</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Shipping form */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Shipping address</h2>
          <form id="checkout-form" onSubmit={placeOrder} className="flex flex-col gap-4">
            <Input name="line1" label="Street address" placeholder="123 Main St" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="city" label="City" placeholder="New York" required />
              <Input name="zip" label="ZIP / Postal code" placeholder="10001" required />
            </div>
            <Input name="country" label="Country" placeholder="United States" required />

            <h2 className="mt-4 text-lg font-semibold text-foreground">Payment</h2>
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
              💳 This is a demo store — no real payment is taken. Clicking “Place order”
              will create a paid order instantly.
            </div>
          </form>
        </Card>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Order summary</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {items.map((i) => {
                const p = product(i);
                return (
                  <li key={p._id} className="flex justify-between gap-2">
                    <span className="text-muted">{i.qty}× {p.title}</span>
                    <span className="text-foreground">{formatPrice(p.price * i.qty, p.currency)}</span>
                  </li>
                );
              })}
            </ul>
            <hr className="my-4 border-border" />
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{formatPrice(tax)}</dd></div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt><dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <Button form="checkout-form" type="submit" size="lg" className="mt-5 w-full" disabled={placing}>
              {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
            </Button>
            <Link href="/cart" className="mt-3 block text-center text-sm text-muted hover:text-foreground">
              ← Back to cart
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
