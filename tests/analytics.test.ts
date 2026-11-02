import { describe, expect, it } from "vitest";
import { summarizeSales, toCsv } from "@/features/reports/lib/analytics";
import type { Order } from "@/types/db";

const order = (over: Partial<Order>): Order => ({
  id: "o", orderNumber: "ZM-1", customerId: null, customerName: "x", customerPhone: "0599123456", zoneId: null, zoneNameAr: null, address: null,
  items: [{ productId: "p1", nameAr: "بوكس", price: 50, quantity: 2, imageUrl: null, options: [], customName: null, cardMessage: null, photoPath: null, lineTotal: 100 }],
  subtotal: 100, deliveryFee: 10, discount: 0, total: 110, couponCode: null, fulfillment: "delivery", deliveryDate: null, timeSlot: null,
  paymentMethod: "cash_on_delivery", receiptPath: null, status: "delivered", notes: null, createdAt: "2026-10-26T10:00:00Z", statusHistory: [], ...over,
});

describe("summarizeSales", () => {
  it("excludes cancelled orders from revenue", () => {
    const s = summarizeSales([order({}), order({ status: "cancelled" })], 7, new Date("2026-10-27T12:00:00Z"));
    expect(s.revenue).toBe(110);
    expect(s.orders).toBe(1);
    expect(s.byStatus.cancelled).toBe(1);
    expect(s.topProducts[0]).toMatchObject({ productId: "p1", quantity: 2, revenue: 100 });
    expect(s.byDay.find((d) => d.day === "2026-10-26")?.revenue).toBe(110);
  });
});

describe("toCsv", () => {
  it("escapes commas and quotes", () => {
    expect(toCsv([["a,b", 'q"t', null]])).toBe('\uFEFF"a,b","q""t",');
  });
  it("prevents spreadsheet formulas in exported customer text", () => {
    expect(toCsv([["=1+1", "@SUM(A1:A2)", "safe text", -2]])).toBe("\uFEFF'=1+1,'@SUM(A1:A2),safe text,-2");
  });
});
