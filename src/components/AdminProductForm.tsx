"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AdminProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const payload = {
      title: String(f.get("title") ?? ""),
      description: String(f.get("description") ?? ""),
      price: Math.round(Number(f.get("price")) * 100), // dollars -> cents
      stock: Number(f.get("stock") ?? 0),
      images: f.get("image") ? [String(f.get("image"))] : [],
    };
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create product");
      setSaving(false);
      return;
    }
    (e.target as HTMLFormElement).reset();
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ New product</Button>;
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="title" label="Title" placeholder="Wireless Headphones" required />
        <Input name="price" type="number" step="0.01" min="0" label="Price (USD)" placeholder="249.99" required />
        <Input name="stock" type="number" min="0" label="Stock" placeholder="50" defaultValue={0} />
        <Input name="image" label="Image URL" placeholder="https://…" />
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create product"}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
