"use client";

import { cartCount, useCart } from "../store";
import { useHydrated } from "../useHydrated";

export function CartBadge({ className = "" }: { className?: string }) {
  const count = useCart((s) => cartCount(s.lines));
  const hydrated = useHydrated();
  if (!hydrated || count === 0) return null;
  return (
    <span
      aria-label={`${count} منتجات في السلة`}
      className={`absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ${className}`}
    >
      {count}
    </span>
  );
}
