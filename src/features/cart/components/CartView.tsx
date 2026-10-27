"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cartSubtotal, useCart } from "../store";
import { useHydrated } from "../useHydrated";
import { CartLineItem } from "./CartLineItem";

export function CartView() {
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-64 animate-pulse rounded-card bg-primary-light" />;
  if (lines.length === 0)
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <ShoppingBag className="h-14 w-14 text-primary/30" />
        <p className="text-muted">السلة فارغة</p>
        <Link href="/categories" className="btn-primary">ابدئي التسوق</Link>
      </div>
    );
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="card divide-y divide-primary/5 px-5">
        {lines.map((line) => <CartLineItem key={line.key} line={line} />)}
      </ul>
      <aside className="card h-fit space-y-4 p-5">
        <div className="flex justify-between font-bold">
          <span>المجموع</span>
          <span className="text-primary">{formatPrice(cartSubtotal(lines))}</span>
        </div>
        <p className="text-xs text-muted">رسوم التوصيل والخصومات تُحسب في الخطوة التالية.</p>
        <Link href="/checkout" className="btn-primary w-full">إتمام الطلب</Link>
        <Link href="/categories" className="btn-ghost w-full">متابعة التسوق</Link>
      </aside>
    </div>
  );
}
