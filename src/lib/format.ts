const priceFormatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });

/** 120 -> "120 ₪" (Arabic digits kept Western for readability on cheap phones). */
export function formatPrice(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(2)} ₪`;
}

export function formatNumber(value: number): string {
  return priceFormatter.format(value);
}

export function formatDate(iso: string, withTime = false): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Gaza",
  }).format(date);
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
