"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Store, Truck } from "lucide-react";
import type { DeliveryZone } from "@/types/db";
import { PAYMENT_METHOD_LABELS_AR, PAYMENT_METHOD_VALUES, TIME_SLOTS, type FulfillmentType, type PaymentMethod } from "@/types/enums";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { cartSubtotal, useCart } from "@/features/cart/store";
import { useHydrated } from "@/features/cart/useHydrated";
import { PhotoUploadField } from "@/features/product/components/PhotoUploadField";
import { placeOrder, previewCoupon } from "../server/actions";

const today = () => new Date(Date.now() + 2 * 3600_000).toISOString().slice(0, 10);

export function CheckoutForm({ zones, bankDetails }: { zones: DeliveryZone[]; bankDetails: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [pending, startTransition] = useTransition();
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("delivery");
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("cash_on_delivery");
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [coupon, setCoupon] = useState({ code: "", discount: 0, message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  if (!hydrated) return <div className="h-96 animate-pulse rounded-card bg-primary-light" />;
  if (lines.length === 0)
    return (
      <div className="card p-8 text-center">
        <p className="mb-4 text-muted">السلة فارغة</p>
        <Link href="/categories" className="btn-primary">تسوّقي الآن</Link>
      </div>
    );

  const zone = zones.find((z) => z.id === zoneId);
  const subtotal = cartSubtotal(lines);
  const deliveryFee = fulfillment === "delivery" ? zone?.fee ?? 0 : 0;
  const total = Math.max(0, subtotal + deliveryFee - coupon.discount);

  const applyCoupon = async () => {
    if (!coupon.code.trim()) return;
    const res = await previewCoupon(coupon.code, lines.map((l) => ({ price: l.unitPrice, quantity: l.quantity, options: l.options })));
    setCoupon((c) => (res.ok ? { ...c, discount: res.discount, message: `تم تطبيق الخصم (${res.code})` } : { ...c, discount: 0, message: res.error }));
  };

  const submit = (form: FormData) => {
    setFormError("");
    setErrors({});
    const payload = {
      customerName: String(form.get("customerName") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      fulfillment,
      zoneId: fulfillment === "delivery" ? zoneId : null,
      address: String(form.get("address") ?? ""),
      deliveryDate: String(form.get("deliveryDate") ?? ""),
      timeSlot: String(form.get("timeSlot") ?? ""),
      paymentMethod: payment,
      receiptPath,
      couponCode: coupon.discount > 0 ? coupon.code : null,
      notes: String(form.get("notes") ?? ""),
      birthday: String(form.get("birthday") ?? ""),
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        options: l.options.map(({ nameAr, valueAr }) => ({ nameAr, valueAr })),
        customName: l.customName,
        cardMessage: l.cardMessage,
        photoPath: l.photoPath,
      })),
    };
    startTransition(async () => {
      const res = await placeOrder(payload);
      if (!res.ok) {
        setFormError(res.error);
        setErrors(res.fieldErrors ?? {});
        return;
      }
      clear();
      window.open(res.data.whatsappUrl, "_blank", "noopener");
      router.push(res.data.successUrl);
    });
  };

  return (
    <form action={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]" noValidate>
      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="font-heading text-lg font-bold">بياناتك</h2>
          <Input name="customerName" label="الاسم" autoComplete="name" required error={errors.customerName} />
          <Input name="customerPhone" label="رقم الجوال" type="tel" inputMode="tel" dir="ltr" placeholder="059xxxxxxx" autoComplete="tel" required error={errors.customerPhone} className="text-end" />
          <Input name="birthday" label="تاريخ ميلادك (اختياري — لنفاجئك بهدية 🎁)" type="date" />
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-heading text-lg font-bold">طريقة الاستلام</h2>
          <div className="grid grid-cols-2 gap-3">
            {([["delivery", "توصيل", Truck], ["pickup", "استلام من المتجر", Store]] as const).map(([value, label, Icon]) => (
              <button key={value} type="button" aria-pressed={fulfillment === value} onClick={() => setFulfillment(value)}
                className={cn("flex items-center justify-center gap-2 rounded-input border p-3 text-sm font-bold", fulfillment === value ? "border-primary bg-primary-light text-primary" : "border-primary/15")}>
                <Icon className="h-5 w-5" /> {label}
              </button>
            ))}
          </div>
          {fulfillment === "delivery" && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="zone" className="text-sm font-medium">المنطقة</label>
                <select id="zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-input border border-primary/15 bg-surface px-4 py-3 text-sm">
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.nameAr} — {formatPrice(z.fee)} ({z.deliveryTimeAr})</option>
                  ))}
                </select>
                {errors.zoneId && <p className="text-xs text-danger">{errors.zoneId}</p>}
              </div>
              <Input name="address" label="العنوان بالتفصيل" placeholder="الحي، الشارع، أقرب معلم" error={errors.address} />
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input name="deliveryDate" label="التاريخ" type="date" min={today()} error={errors.deliveryDate} />
            <div className="space-y-1.5">
              <label htmlFor="timeSlot" className="text-sm font-medium">الوقت</label>
              <select id="timeSlot" name="timeSlot" className="w-full rounded-input border border-primary/15 bg-surface px-3 py-3 text-sm">
                <option value="">أي وقت</option>
                {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-heading text-lg font-bold">الدفع</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHOD_VALUES.map((value) => (
              <button key={value} type="button" aria-pressed={payment === value} onClick={() => setPayment(value)}
                className={cn("rounded-input border p-3 text-sm font-bold", payment === value ? "border-primary bg-primary-light text-primary" : "border-primary/15")}>
                {PAYMENT_METHOD_LABELS_AR[value]}
              </button>
            ))}
          </div>
          {payment === "bank_transfer" && (
            <div className="space-y-3 rounded-input bg-accent/10 p-4 text-sm">
              <p>{bankDetails || "سنرسل لك تفاصيل التحويل على واتساب."}</p>
              <PhotoUploadField label="صورة إيصال التحويل (يمكن إرسالها لاحقاً على واتساب)" kind="receipt" value={receiptPath} onChange={setReceiptPath} />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-sm font-medium">ملاحظات (اختياري)</label>
            <textarea id="notes" name="notes" rows={2} maxLength={500} className="w-full rounded-input border border-primary/15 px-4 py-3 text-sm" />
          </div>
        </section>
      </div>

      <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-24">
        <h2 className="font-heading text-lg font-bold">ملخص الطلب</h2>
        <ul className="space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-2">
              <span className="line-clamp-1">{l.nameAr} × {l.quantity}</span>
              <span>{formatPrice((l.unitPrice + l.options.reduce((d, o) => d + o.priceDelta, 0)) * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input value={coupon.code} onChange={(e) => setCoupon({ code: e.target.value.toUpperCase(), discount: 0, message: "" })} placeholder="كود الخصم" aria-label="كود الخصم" dir="ltr"
            className="min-w-0 flex-1 rounded-full border border-primary/15 px-4 py-2 text-sm" />
          <button type="button" onClick={applyCoupon} className="btn-secondary !px-4 !py-2">تطبيق</button>
        </div>
        {coupon.message && <p className={cn("text-xs", coupon.discount ? "text-success" : "text-danger")}>{coupon.message}</p>}
        <dl className="space-y-1.5 border-t border-primary/10 pt-3 text-sm">
          <div className="flex justify-between"><dt>المجموع</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>التوصيل</dt><dd>{formatPrice(deliveryFee)}</dd></div>
          {coupon.discount > 0 && <div className="flex justify-between text-success"><dt>الخصم</dt><dd>-{formatPrice(coupon.discount)}</dd></div>}
          <div className="flex justify-between text-base font-bold text-primary"><dt>الإجمالي</dt><dd>{formatPrice(total)}</dd></div>
        </dl>
        {formError && <p role="alert" className="rounded-input bg-danger/10 p-3 text-sm text-danger">{formError}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          تأكيد الطلب عبر واتساب
        </button>
        <p className="text-center text-xs text-muted">سيُحفظ طلبك ثم يفتح واتساب برسالة جاهزة لتأكيده.</p>
      </aside>
    </form>
  );
}
