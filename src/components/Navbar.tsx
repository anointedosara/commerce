import { getSession } from "@/lib/auth";
import { NavMenu, type NavSession } from "@/components/NavMenu";

export async function Navbar() {
  const session = await getSession();
  const navSession: NavSession | null = session
    ? { name: session.name, role: session.role }
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <NavMenu session={navSession} />
    </header>
  );
}
