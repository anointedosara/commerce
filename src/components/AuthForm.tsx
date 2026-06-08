"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-foreground">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mb-6 text-sm text-muted">
        {isLogin ? "Log in to continue shopping." : "Sign up to start shopping."}
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <Input name="name" label="Full name" placeholder="Jane Doe" required autoComplete="name" />
        )}
        <Input name="email" type="email" label="Email" placeholder="you@example.com" required autoComplete="email" />
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? (
          <>Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:underline">Sign up</Link>
          </>
        ) : (
          <>Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">Log in</Link>
          </>
        )}
      </p>
    </Card>
  );
}
