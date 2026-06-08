"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const payload = Object.fromEntries(
      [...new FormData(e.currentTarget).entries()].filter(([, v]) => v !== ""),
    );
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ type: "err", text: data.error ?? "Update failed" });
    } else {
      setMsg({ type: "ok", text: "Settings saved." });
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <Input name="name" label="Full name" defaultValue={name} />
        <Input label="Email" value={email} disabled />

        <hr className="my-2 border-border" />
        <h2 className="text-lg font-semibold text-foreground">Change password</h2>
        <Input name="currentPassword" type="password" label="Current password" placeholder="••••••••" autoComplete="current-password" />
        <Input name="newPassword" type="password" label="New password" placeholder="At least 6 characters" autoComplete="new-password" />

        {msg && (
          <p className={msg.type === "ok" ? "text-sm text-green-600 dark:text-green-400" : "text-sm text-red-500"}>
            {msg.text}
          </p>
        )}

        <Button type="submit" disabled={saving} className="self-start">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
