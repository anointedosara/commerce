"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/CartProvider";

export function AddToCart({ productId, inStock }: { productId: string; inStock: boolean }) {
  const router = useRouter();
  const { bump, refresh } = useCart();
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "added" | "auth">("idle");

  async function add() {
    setStatus("loading");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty }),
    });
    if (res.status === 401) {
      setStatus("auth");
      router.push("/login?next=/cart");
      return;
    }
    if (res.ok) {
      bump(qty); // optimistic badge update
      refresh(); // reconcile with server
      setStatus("added");
    } else {
      setStatus("idle");
    }
  }

  if (!inStock) {
    return <Button disabled variant="outline">Out of stock</Button>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-10 w-10 text-lg text-muted hover:text-foreground"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="h-10 w-10 text-lg text-muted hover:text-foreground"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <Button onClick={add} disabled={status === "loading"}>
        {status === "loading" ? "Adding…" : status === "added" ? "Added ✓" : "Add to cart"}
      </Button>
    </div>
  );
}
