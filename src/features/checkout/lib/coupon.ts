import type { Coupon } from "@/types/db";
import { calculateDiscount } from "@/lib/pricing";

export type CouponCheck =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; reason: string };

/** Full coupon eligibility rules (dates, usage, min order). Pure + unit-tested. */
export function checkCoupon(coupon: Coupon | null, subtotal: number, now = new Date()): CouponCheck {
  if (!coupon || !coupon.isActive) return { ok: false, reason: "الكود غير صحيح" };
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return { ok: false, reason: "الكود لم يبدأ بعد" };
  if (coupon.endsAt && new Date(coupon.endsAt) < now) return { ok: false, reason: "انتهت صلاحية الكود" };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    return { ok: false, reason: "تم استخدام الكود بالكامل" };
  if (coupon.minOrder !== null && subtotal < coupon.minOrder)
    return { ok: false, reason: `الحد الأدنى للطلب ${coupon.minOrder} ₪` };
  return { ok: true, coupon, discount: calculateDiscount(coupon, subtotal, now) };
}
