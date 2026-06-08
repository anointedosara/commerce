"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/LogoutButton";
import { useCart } from "@/components/CartProvider";
import { cn } from "@/lib/utils";

export interface NavSession {
  name: string;
  role: string;
}

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function CartLink({ onClick }: { onClick?: () => void }) {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      onClick={onClick}
      className="relative inline-flex items-center text-sm text-muted transition-colors hover:text-foreground"
    >
      Cart
      {count > 0 && (
        <span
          key={count}
          aria-label={`${count} items in cart`}
          className="animate-pop ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function NavMenu({ session }: { session: NavSession | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the dropdown whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while the dropdown is open.
  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  return (
    <>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-bold text-foreground">
          <span className="text-brand-600">◆</span> Commerce
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm text-muted sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
          {session && (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
          {session?.role === "admin" && (
            <Link href="/admin" className="font-medium text-brand-600 transition-colors hover:text-brand-700">
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <CartLink />

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 sm:flex">
            {session ? (
              <>
                <span className="text-sm text-muted">Hi, {session.name.split(" ")[0]}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-brand-50 sm:hidden dark:hover:bg-white/5"
          >
            <span className="relative block h-4 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-all duration-300",
                  open ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown — animates open AND closed via max-height + opacity. */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background/95 backdrop-blur transition-all duration-300 ease-out sm:hidden",
          open ? "max-h-[28rem] opacity-100" : "max-h-0 border-t-0 opacity-0",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-brand-50 dark:hover:bg-white/5",
                open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
              )}
            >
              {l.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${60 + LINKS.length * 40}ms` : "0ms" }}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-brand-50 dark:hover:bg-white/5",
                open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
              )}
            >
              Dashboard
            </Link>
          )}
          {session?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${60 + (LINKS.length + 1) * 40}ms` : "0ms" }}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600 transition-all duration-300 hover:bg-brand-50 dark:hover:bg-white/5",
                open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
              )}
            >
              Admin
            </Link>
          )}

          <div
            className={cn(
              "mt-2 flex items-center gap-2 border-t border-border pt-3 transition-all duration-300",
              open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
            )}
            style={{ transitionDelay: open ? "260ms" : "0ms" }}
          >
            {session ? (
              <>
                <span className="text-sm text-muted">Hi, {session.name.split(" ")[0]}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Log in</Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
