"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center text-green-600 dark:text-green-400">
        ✅ Thanks for reaching out! We&apos;ll get back to you soon.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Name" placeholder="Jane Doe" required />
        <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
      </div>
      <Input name="subject" label="Subject" placeholder="How can we help?" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium">Message</label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          placeholder="Tell us more…"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
