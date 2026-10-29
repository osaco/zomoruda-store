import type { Coupon, OrderItemOption } from "@/types/db";

export type PricedLine = {
  price: number;
  quantity: number;
  options?: OrderItemOption[] | null;
};

export type Totals = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateLineTotal(line: PricedLine): number {
  const optionDelta = (line.options ?? []).reduce(
    (sum, option) => sum + (option.priceDelta ?? 0),
    0,
  );
  const unitPrice = Math.max(0, line.price + optionDelta);
  return roundMoney(unitPrice * Math.max(0, line.quantity));
}

export function calculateSubtotal(lines: PricedLine[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + calculateLineTotal(line), 0));
}

export function calculateDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon || !coupon.is_active) return 0;
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return 0;
  if (
    typeof coupon.max_uses === "number" &&
    coupon.max_uses > 0 &&
    (coupon.used_count ?? 0) >= coupon.max_uses
  ) {
    return 0;
  }
  if (coupon.min_order_value && subtotal < coupon.min_order_value) return 0;

  if (coupon.discount_type === "fixed") {
    return roundMoney(Math.min(subtotal, coupon.discount_value));
  }
  if (coupon.discount_type === "percent") {
    const raw = (subtotal * coupon.discount_value) / 100;
    return roundMoney(Math.min(subtotal, raw));
  }
  return 0;
}

export function calculateTotals(
  lines: PricedLine[],
  deliveryFee: number,
  coupon: Coupon | null = null,
): Totals {
  const subtotal = calculateSubtotal(lines);
  const discount = calculateDiscount(subtotal, coupon);
  const total = roundMoney(Math.max(0, subtotal + deliveryFee - discount));
  return { subtotal, deliveryFee, discount, total };
}
