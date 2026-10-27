import type { Order } from "@/types/db";
import type { OrderStatus } from "@/types/enums";
import { roundMoney } from "@/lib/pricing";

export type DayPoint = { day: string; revenue: number; orders: number };
export type TopProduct = { productId: string; nameAr: string; quantity: number; revenue: number };

export type SalesSummary = {
  revenue: number;
  orders: number;
  averageOrder: number;
  byDay: DayPoint[];
  topProducts: TopProduct[];
  byStatus: Record<OrderStatus, number>;
};

const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Gaza", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

/** Revenue counts every order that isn't cancelled. Pure + unit-tested. */
export function summarizeSales(orders: Order[], days = 30, now = new Date()): SalesSummary {
  const byStatus = { new: 0, confirmed: 0, preparing: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 } as Record<OrderStatus, number>;
  const points = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * 86_400_000).toISOString());
    points.set(key, { day: key, revenue: 0, orders: 0 });
  }
  const products = new Map<string, TopProduct>();
  let revenue = 0;
  let count = 0;

  for (const order of orders) {
    byStatus[order.status] += 1;
    if (order.status === "cancelled") continue;
    revenue += order.total;
    count += 1;
    const point = points.get(dayKey(order.createdAt));
    if (point) {
      point.revenue = roundMoney(point.revenue + order.total);
      point.orders += 1;
    }
    for (const item of order.items) {
      const p = products.get(item.productId) ?? { productId: item.productId, nameAr: item.nameAr, quantity: 0, revenue: 0 };
      p.quantity += item.quantity;
      p.revenue = roundMoney(p.revenue + item.lineTotal);
      products.set(item.productId, p);
    }
  }

  return {
    revenue: roundMoney(revenue),
    orders: count,
    averageOrder: count ? roundMoney(revenue / count) : 0,
    byDay: [...points.values()],
    topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    byStatus,
  };
}

/** RFC-4180 CSV with BOM so Excel opens Arabic correctly. */
export function toCsv(rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}
