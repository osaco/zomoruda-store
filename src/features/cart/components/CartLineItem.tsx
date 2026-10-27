"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart, type CartLine } from "../store";

export function CartLineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const unit = line.unitPrice + line.options.reduce((d, o) => d + o.priceDelta, 0);

  return (
    <li className="flex gap-3 py-4">
      <Link href={`/product/${line.slug}`} className="shrink-0">
        <Image
          src={line.imageUrl ?? "/placeholder.png"}
          alt={line.nameAr}
          width={compact ? 64 : 88}
          height={compact ? 64 : 88}
          className="rounded-image bg-primary-light object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${line.slug}`} className="line-clamp-2 text-sm font-bold text-ink hover:text-primary">
            {line.nameAr}
          </Link>
          <button
            type="button"
            onClick={() => remove(line.key)}
            aria-label={`حذف ${line.nameAr}`}
            className="rounded-full p-1 text-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {line.options.length > 0 && (
          <p className="text-xs text-muted">{line.options.map((o) => `${o.nameAr}: ${o.valueAr}`).join(" • ")}</p>
        )}
        {line.customName && <p className="text-xs text-muted">الاسم: {line.customName}</p>}
        {line.cardMessage && <p className="line-clamp-1 text-xs text-muted">الكرت: {line.cardMessage}</p>}
        {line.photoPath && <p className="text-xs text-success">✓ تم رفع الصورة</p>}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-primary/15">
            <button type="button" aria-label="زيادة الكمية" onClick={() => setQuantity(line.key, line.quantity + 1)} className="p-1.5 text-primary">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-6 text-center text-sm font-bold" aria-live="polite">{line.quantity}</span>
            <button type="button" aria-label="إنقاص الكمية" onClick={() => setQuantity(line.key, line.quantity - 1)} className="p-1.5 text-primary">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm font-bold text-primary">{formatPrice(unit * line.quantity)}</span>
        </div>
      </div>
    </li>
  );
}
