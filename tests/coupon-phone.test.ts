import { describe, expect, it } from "vitest";
import { checkCoupon } from "@/features/checkout/lib/coupon";
import { normalizePsPhone, toInternational } from "@/lib/phone";
import type { Coupon } from "@/types/db";

const base: Coupon = { id: "c", code: "GIFT5", type: "fixed", value: 5, minOrder: 40, maxDiscount: null, usageLimit: 2, usedCount: 0, startsAt: null, endsAt: null, isActive: true };

describe("checkCoupon", () => {
  it("accepts a valid coupon", () => {
    expect(checkCoupon(base, 50)).toEqual({ ok: true, coupon: base, discount: 5 });
  });
  it("rejects missing / inactive", () => {
    expect(checkCoupon(null, 50).ok).toBe(false);
    expect(checkCoupon({ ...base, isActive: false }, 50).ok).toBe(false);
  });
  it("rejects expired and not-started", () => {
    const now = new Date("2026-10-27T00:00:00Z");
    expect(checkCoupon({ ...base, endsAt: "2026-10-01T00:00:00Z" }, 50, now).ok).toBe(false);
    expect(checkCoupon({ ...base, startsAt: "2026-11-01T00:00:00Z" }, 50, now).ok).toBe(false);
  });
  it("rejects when usage limit reached or under min order", () => {
    expect(checkCoupon({ ...base, usedCount: 2 }, 50).ok).toBe(false);
    expect(checkCoupon(base, 30).ok).toBe(false);
  });
});

describe("phone", () => {
  it.each([
    ["0599123456", "0599123456"],
    ["599123456", "0599123456"],
    ["+970 59 912 3456", "0599123456"],
    ["00972-568889900", "0568889900"],
    ["٠٥٩٩١٢٣٤٥٦", "0599123456"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizePsPhone(input)).toBe(expected);
  });
  it.each(["0501234567", "12345", "05991234567"])("rejects %s", (input) => {
    expect(normalizePsPhone(input)).toBeNull();
  });
  it("converts to international", () => {
    expect(toInternational("0599123456")).toBe("970599123456");
  });
});
