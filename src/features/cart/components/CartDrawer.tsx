"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBag, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cartSubtotal, useCart } from "../store";
import { useHydrated } from "../useHydrated";
import { CartLineItem } from "./CartLineItem";

export function CartDrawer() {
  const { lines, isOpen, close } = useCart();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!hydrated || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="سلة المشتريات">
      <button type="button" aria-label="إغلاق" onClick={close} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <aside className="absolute inset-y-0 start-0 flex w-full max-w-sm flex-col bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <h2 className="font-heading text-lg font-bold">سلة المشتريات</h2>
          <button type="button" onClick={close} aria-label="إغلاق السلة" className="rounded-full p-2 hover:bg-primary-light">
            <X className="h-5 w-5" />
          </button>
        </header>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="h-12 w-12 text-primary/30" />
            <p className="text-sm text-muted">السلة فارغة</p>
            <Link href="/categories" onClick={close} className="btn-secondary">تصفّحي المنتجات</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-primary/5 overflow-y-auto px-5">
              {lines.map((line) => (
                <CartLineItem key={line.key} line={line} compact />
              ))}
            </ul>
            <footer className="space-y-3 border-t border-primary/10 p-5">
              <div className="flex justify-between text-sm font-bold">
                <span>المجموع</span>
                <span className="text-primary">{formatPrice(cartSubtotal(lines))}</span>
              </div>
              <Link href="/checkout" onClick={close} className="btn-primary w-full">إتمام الطلب</Link>
              <Link href="/cart" onClick={close} className="btn-ghost w-full">عرض السلة</Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
