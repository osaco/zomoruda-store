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
  return roundMoney((line.price + optionDelta) * line.quantity);
}

export function calculateSubtotal(lines: PricedLine[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + calculateLineTotal(line), 0));
}

export function calculateDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.minOrder !== null && subtotal < coupon.minOrder) return 0;

  const raw =
    coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  const capped =
    coupon.maxDiscount !== null ? Math.min(raw, coupon.maxDiscount) : raw;

  return roundMoney(Math.min(Math.max(capped, 0), subtotal));
}

export function calculateTotals({
  lines,
  deliveryFee,
  coupon,
}: {
  lines: PricedLine[];
  deliveryFee: number;
  coupon?: Coupon | null;
}): Totals {
  const subtotal = calculateSubtotal(lines);
  const discount = calculateDiscount(coupon ?? null, subtotal);
  const total = roundMoney(Math.max(subtotal + deliveryFee - discount, 0));

  return { subtotal, deliveryFee: roundMoney(deliveryFee), discount, total };
}

export function formatOrderNumber(sequence: number): string {
  return `ZM-${String(sequence).padStart(4, "0")}`;
}
