"use client";

import dynamic from "next/dynamic";
import { useCart } from "@/features/cart/store";

/**
 * Defers the cart drawer until the shopper actually opens it.
 *
 * The drawer renders nothing unless `isOpen` is true, so its code (and the
 * cart line-item tree) is dead weight during first paint. Loading it lazily
 * keeps it off the home page's critical path; the store subscription stays
 * eager, which is what keeps the header's item count live.
 *
 * `ssr: false` is intentional: there is nothing to render on the server, and
 * this avoids shipping the panel markup in the initial HTML.
 */
const CartDrawerPanel = dynamic(
  () => import("@/features/cart/components/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);

export function DeferredCartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  if (!isOpen) return null;
  return <CartDrawerPanel />;
}
