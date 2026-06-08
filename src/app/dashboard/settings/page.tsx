import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/settings");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">← Back to dashboard</Link>
      <h1 className="mt-2 mb-8 text-3xl font-bold text-foreground">Account settings</h1>
      <SettingsForm name={session.name} email={session.email} />
    </div>
  );
}
