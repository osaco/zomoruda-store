"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Minus, Plus, Share2, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/db";
import { AVAILABILITY_LABELS_AR } from "@/types/enums";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { discountPercent, formatPrice } from "@/lib/format";
import { env } from "@/lib/env";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart } from "@/features/cart/store";
import { CARD_MESSAGE_MAX } from "@/features/checkout/schemas";
import { productWhatsappMessage } from "@/features/orders/lib/whatsapp-message";
import { PhotoUploadField } from "./PhotoUploadField";

export function ProductPurchasePanel({ product, ordersPaused }: { product: Product; ordersPaused: boolean }) {
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.filter((o) => o.isRequired && o.values[0]).map((o) => [o.nameAr, o.values[0].valueAr])),
  );
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState("");
  const [cardMessage, setCardMessage] = useState("");
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const chosen = useMemo(
    () =>
      product.options.flatMap((o) => {
        const v = o.values.find((x) => x.valueAr === selected[o.nameAr]);
        return v ? [{ nameAr: o.nameAr, valueAr: v.valueAr, priceDelta: v.priceDelta }] : [];
      }),
    [product.options, selected],
  );
  const unitPrice = product.price + chosen.reduce((d, o) => d + o.priceDelta, 0);
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.availability === "out_of_stock";
  const disabled = soldOut || ordersPaused;

  const share = async () => {
    const url = `${env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`;
    if (navigator.share) await navigator.share({ title: product.nameAr, url }).catch(() => {});
    else {
      await navigator.clipboard.writeText(url);
      setShared(true);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {product.isNew && <Badge variant="new">جديد</Badge>}
          {off && <Badge variant="sale">خصم {off}%</Badge>}
          <Badge variant={soldOut ? "danger" : product.availability === "made_to_order" ? "gold" : "success"}>
            {AVAILABILITY_LABELS_AR[product.availability]}
          </Badge>
        </div>
        <h1 className="font-heading text-2xl font-bold leading-snug text-ink md:text-3xl">{product.nameAr}</h1>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-primary" aria-live="polite">{formatPrice(unitPrice)}</span>
          {off && <span className="text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>}
        </div>
      </div>

      <p className="text-sm leading-7 text-ink/80">{product.descriptionAr}</p>

      {product.options.map((option) => (
        <fieldset key={option.id}>
          <legend className="mb-2 text-sm font-bold">{option.nameAr}</legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const active = selected[option.nameAr] === value.valueAr;
              return (
                <button
                  key={value.valueAr}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected((s) => ({ ...s, [option.nameAr]: value.valueAr }))}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    active ? "border-primary bg-primary text-white" : "border-primary/20 bg-surface hover:border-primary",
                  )}
                >
                  {value.valueAr}
                  {value.priceDelta > 0 && <span className="ms-1 text-xs opacity-80">+{formatPrice(value.priceDelta)}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {(product.allowName || product.allowCardMessage || product.allowPhotoUpload) && (
        <div className="card space-y-4 p-4">
          <p className="text-sm font-bold text-primary">✨ خصّصي هديتك</p>
          {product.allowName && (
            <Input label="الاسم المطلوب على الهدية" maxLength={40} value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="مثال: لين" />
          )}
          {product.allowCardMessage && (
            <div className="space-y-1.5">
              <label htmlFor="card-message" className="text-sm font-medium">رسالة الكرت</label>
              <textarea
                id="card-message"
                rows={3}
                maxLength={CARD_MESSAGE_MAX}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="اكتبي رسالتك..."
                className="w-full rounded-input border border-primary/15 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-end text-xs text-muted">{cardMessage.length}/{CARD_MESSAGE_MAX}</p>
            </div>
          )}
          {product.allowPhotoUpload && <PhotoUploadField label="الصورة المطلوب طباعتها" kind="photo" value={photoPath} onChange={setPhotoPath} />}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-primary/15">
          <button type="button" aria-label="زيادة" onClick={() => setQuantity((q) => Math.min(50, q + 1))} className="p-3 text-primary"><Plus className="h-4 w-4" /></button>
          <span className="min-w-8 text-center font-bold">{quantity}</span>
          <button type="button" aria-label="إنقاص" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 text-primary"><Minus className="h-4 w-4" /></button>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            add({
              productId: product.id,
              slug: product.slug,
              nameAr: product.nameAr,
              imageUrl: product.images[0]?.url ?? null,
              unitPrice: product.price,
              quantity,
              options: chosen,
              customName: customName.trim() || null,
              cardMessage: cardMessage.trim() || null,
              photoPath,
            })
          }
          className="btn-primary flex-1"
        >
          <ShoppingBag className="h-5 w-5" />
          {soldOut ? "نفد من المخزون" : ordersPaused ? "الطلبات متوقفة مؤقتاً" : "أضيفي للسلة"}
        </button>
      </div>

      <div className="flex gap-3">
        <a
          href={whatsappLink(productWhatsappMessage(product, unitPrice, env.NEXT_PUBLIC_SITE_URL, chosen))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn flex-1 bg-emerald text-white hover:brightness-105"
        >
          <MessageCircle className="h-5 w-5" /> اطلبي مباشرة عبر واتساب
        </a>
        <button type="button" onClick={share} className="btn-secondary" aria-label="مشاركة المنتج">
          <Share2 className="h-5 w-5" />
          <span className="sr-only md:not-sr-only">{shared ? "تم النسخ" : "مشاركة"}</span>
        </button>
      </div>
    </div>
  );
}
