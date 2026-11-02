import { describe, expect, it } from "vitest";
import { calculateDiscount, calculateLineTotal, calculateTotals, formatOrderNumber } from "@/lib/pricing";
import type { Coupon } from "@/types/db";

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: "c", code: "X", type: "percent", value: 10, minOrder: null, maxDiscount: null,
  usageLimit: null, usedCount: 0, startsAt: null, endsAt: null, isActive: true, ...over,
});

describe("pricing", () => {
  it("adds option deltas per unit", () => {
    expect(calculateLineTotal({ price: 100, quantity: 2, options: [{ nameAr: "الحجم", valueAr: "كبير", priceDelta: 30 }] })).toBe(260);
  });
  it("applies percent coupon with cap", () => {
    expect(calculateDiscount(coupon({ value: 50, maxDiscount: 20 }), 100)).toBe(20);
  });
  it("fixed coupon never exceeds subtotal", () => {
    expect(calculateDiscount(coupon({ type: "fixed", value: 80 }), 50)).toBe(50);
  });
  it("respects min order", () => {
    expect(calculateDiscount(coupon({ minOrder: 200 }), 100)).toBe(0);
  });
  it("computes totals", () => {
    expect(calculateTotals({ lines: [{ price: 45, quantity: 2 }], deliveryFee: 10, coupon: coupon() })).toEqual({ subtotal: 90, deliveryFee: 10, discount: 9, total: 91 });
  });
  it("formats order numbers", () => {
    expect(formatOrderNumber(7)).toBe("ZM-0007");
    expect(formatOrderNumber(1234)).toBe("ZM-1234");
  });
});
