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

export function calculateDiscount(coupon: Coupon | null, subtotal: number, now = new Date()): number {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return 0;
  if (coupon.endsAt && new Date(coupon.endsAt) < now) return 0;
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return 0;
  if (coupon.minOrder !== null && subtotal < coupon.minOrder) return 0;

  const raw = coupon.type === "fixed" ? coupon.value : (subtotal * coupon.value) / 100;
  const capped = coupon.maxDiscount === null ? raw : Math.min(raw, coupon.maxDiscount);
  return roundMoney(Math.min(subtotal, capped));
}

export function calculateTotals(args: {
  lines: PricedLine[];
  deliveryFee: number;
  coupon?: Coupon | null;
}): Totals {
  const { lines, deliveryFee, coupon = null } = args;
  const subtotal = calculateSubtotal(lines);
  const discount = calculateDiscount(coupon, subtotal);
  const total = roundMoney(Math.max(0, subtotal + deliveryFee - discount));
  return { subtotal, deliveryFee, discount, total };
}

export function formatOrderNumber(sequence: number): string {
  return `ZM-${Math.max(0, Math.trunc(sequence)).toString().padStart(4, "0")}`;
}
