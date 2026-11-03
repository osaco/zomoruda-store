"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart, cartCount } from "@/features/cart/store";
import { useHydrated } from "@/features/cart/useHydrated";

export function AtelierHeader() {
  const openCart = useCart((state) => state.open);
  const count = useCart((state) => cartCount(state.lines));
  const hydrated = useHydrated();

  return (
    <header className="atelier-nav">
      <div className="atelier-wrap atelier-nav-inner">
        <Link className="atelier-brand" href="/" aria-label="زُمُرّدة — الرئيسية">
          <span>زُمُرّدة</span><i aria-hidden="true">.</i>
        </Link>

        <nav className="atelier-nav-links" aria-label="التنقل الرئيسي">
          <Link href="/search">COLLECTION</Link>
          <a href="#craft">THE ATELIER</a>
          <a href="#measurements">DETAILS</a>
        </nav>

        <div className="atelier-nav-actions">
          <Link className="atelier-nav-shop" href="/search">SHOP</Link>
          <button
            className="atelier-cart-button"
            data-testid="cart-button"
            type="button"
            onClick={openCart}
            aria-label={hydrated && count > 0 ? `السلة، ${count} منتجات` : "السلة، فارغة"}
          >
            <ShoppingBag aria-hidden="true" size={17} strokeWidth={1.6} />
            <span className="atelier-cart-count" aria-hidden="true">{hydrated ? count : 0}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
