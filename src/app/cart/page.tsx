"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { CartItem, ProductLite } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      router.push("/login?next=/cart");
      return;
    }
    const data = await res.json();
    setItems(data.cart?.items ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/login?next=/cart");
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

  async function setQty(productId: string, qty: number) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty }),
    });
    load();
  }

  const product = (i: CartItem) => i.productId as ProductLite;
  const subtotal = items.reduce((sum, i) => sum + product(i).price * i.qty, 0);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-muted">Loading your cart…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Your cart</h1>

      {items.length === 0 ? (
        <Card className="text-center">
          <p className="mb-4 text-muted">Your cart is empty.</p>
          <Link href="/products"><Button>Browse products</Button></Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-3">
            {items.map((i) => {
              const p = product(i);
              return (
                <li key={p._id} className="flex items-center gap-4 rounded-xl border border-border p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 text-2xl dark:bg-white/5">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.title} className="h-full w-full rounded-lg object-cover" />
                    ) : "🛍️"}
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${p.slug}`} className="font-medium text-foreground hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-sm text-muted">{formatPrice(p.price, p.currency)}</p>
                  </div>
                  <div className="flex items-center rounded-lg border border-border">
                    <button onClick={() => setQty(p._id, i.qty - 1)} className="h-9 w-9 text-muted hover:text-foreground" aria-label="Decrease">−</button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button onClick={() => setQty(p._id, i.qty + 1)} className="h-9 w-9 text-muted hover:text-foreground" aria-label="Increase">+</button>
                  </div>
                  <button onClick={() => setQty(p._id, 0)} className="text-sm text-red-500 hover:underline">Remove</button>
                </li>
              );
            })}
          </ul>

          <Card>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="text-base font-semibold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping & tax calculated at checkout.</p>
            <Link href="/checkout" className="mt-4 block">
              <Button size="lg" className="w-full">Proceed to checkout</Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
