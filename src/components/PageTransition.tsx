"use client";

import { usePathname } from "next/navigation";

/**
 * Fades page content in on every route change. Keying on the pathname
 * remounts the subtree so the entry animation re-runs each navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
