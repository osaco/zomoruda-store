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
        <ShoppingBag className="h-14 w-14 text-primary/30" aria-hidden="true" />
        <p className="font-heading text-lg font-bold">سلتك فارغة</p>
        <p className="text-sm text-muted">أضيفي منتجات للسلة ثم أتمّي الطلب.</p>
        <Link href="/categories" className="btn-primary">ابدئي التسوق</Link>
      </div>
    );

  const subtotal = cartSubtotal(lines);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* قائمة المنتجات */}
      <ul className="card divide-y divide-primary/5 px-5" aria-label="منتجات السلة">
        {lines.map((line) => (
          <CartLineItem key={line.key} line={line} />
        ))}
      </ul>

      {/* ملخص السلة */}
      <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-24" aria-label="ملخص السلة">
        <h2 className="font-heading text-lg font-bold">ملخص السلة</h2>

        {/* تفاصيل مختصرة */}
        <ul className="space-y-1.5 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-2 text-muted">
              <span className="line-clamp-1">{l.nameAr} × {l.quantity}</span>
              <span className="shrink-0">
                {formatPrice(
                  (l.unitPrice + l.options.reduce((d, o) => d + o.priceDelta, 0)) * l.quantity,
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-primary/10 pt-3 space-y-1">
          <div className="flex justify-between font-bold text-base">
            <span>المجموع</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-muted">رسوم التوصيل والخصومات تُحسب في الخطوة التالية.</p>
        </div>

        <Link href="/checkout" className="btn-primary w-full">
          إتمام الطلب
        </Link>
        <Link href="/categories" className="btn-ghost w-full">
          متابعة التسوق
        </Link>
      </aside>
    </div>
  );
}
