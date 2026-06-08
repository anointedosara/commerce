"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface CartContextValue {
  /** Total quantity across all cart lines. */
  count: number;
  /** Re-fetch the cart from the server (source of truth). */
  refresh: () => Promise<void>;
  /** Optimistically adjust the count before the server confirms. */
  bump: (delta: number) => void;
}

const CartContext = createContext<CartContextValue>({
  count: 0,
  refresh: async () => {},
  bump: () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        setCount(0); // 401 (logged out) or error → empty
        return;
      }
      const data = await res.json();
      const items: { qty: number }[] = data.cart?.items ?? [];
      setCount(items.reduce((sum, i) => sum + (i.qty ?? 0), 0));
    } catch {
      /* network hiccup — keep the last known count */
    }
  }, []);

  const bump = useCallback((delta: number) => {
    setCount((c) => Math.max(0, c + delta));
  }, []);

  // Refresh on load and whenever the route changes (keeps the badge in sync
  // after cart edits, checkout clearing the cart, login/logout, etc.).
  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  return (
    <CartContext.Provider value={{ count, refresh, bump }}>
      {children}
    </CartContext.Provider>
  );
}
