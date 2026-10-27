import { describe, expect, it } from "vitest";
import { buildOrder } from "@/features/checkout/lib/build-order";
import { orderWhatsappMessage } from "@/features/orders/lib/whatsapp-message";
import { seedCoupons, seedProducts, seedZones } from "@/lib/data/demo/seed";
import type { CheckoutInput } from "@/features/checkout/schemas";
import type { Order } from "@/types/db";

const box = seedProducts.find((p) => p.slug === "royal-gift-box")!;
const mug = seedProducts.find((p) => p.slug === "name-mug")!;
const zone = seedZones[0];

const input = (over: Partial<CheckoutInput> = {}): CheckoutInput => ({
  customerName: "سارة",
  customerPhone: "+970599123456",
  fulfillment: "delivery",
  zoneId: zone.id,
  address: "الرمال، شارع عمر المختار",
  paymentMethod: "cash_on_delivery",
  items: [
    { productId: box.id, quantity: 1, options: [{ nameAr: "الحجم", valueAr: "كبير" }], cardMessage: "كل عام وأنتِ بخير" },
    { productId: mug.id, quantity: 2, options: [], customName: "لين" },
  ],
  ...over,
});

describe("buildOrder", () => {
  it("re-prices lines server-side and adds delivery", () => {
    const result = buildOrder({ input: input(), products: seedProducts, zone, coupon: null, customer: null });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.subtotal).toBe(150 + 50);
    expect(result.order.deliveryFee).toBe(10);
    expect(result.order.total).toBe(210);
    expect(result.order.customerPhone).toBe("0599123456");
    expect(result.order.items[0].cardMessage).toBe("كل عام وأنتِ بخير");
  });
  it("ignores unknown option values (no client price injection)", () => {
    const bad = input({ items: [{ productId: box.id, quantity: 1, options: [{ nameAr: "الحجم", valueAr: "مجاني" }] }] });
    const result = buildOrder({ input: bad, products: seedProducts, zone, coupon: null, customer: null });
    expect(result.ok).toBe(false);
  });
  it("applies a coupon", () => {
    const coupon = seedCoupons.find((c) => c.code === "WELCOME10")!;
    const result = buildOrder({ input: input({ couponCode: "WELCOME10" }), products: seedProducts, zone, coupon, customer: null });
    expect(result.ok && result.order.discount).toBe(20);
  });
  it("pickup has no delivery fee", () => {
    const result = buildOrder({ input: input({ fulfillment: "pickup", zoneId: null }), products: seedProducts, zone: null, coupon: null, customer: null });
    expect(result.ok && result.order.deliveryFee).toBe(0);
  });
  it("rejects out-of-stock items", () => {
    const products = seedProducts.map((p) => (p.id === box.id ? { ...p, availability: "out_of_stock" as const } : p));
    expect(buildOrder({ input: input(), products, zone, coupon: null, customer: null }).ok).toBe(false);
  });
  it("produces a WhatsApp message with totals and tracking link", () => {
    const result = buildOrder({ input: input(), products: seedProducts, zone, coupon: null, customer: null });
    if (!result.ok) throw new Error(result.error);
    const order: Order = { ...result.order, id: "1", orderNumber: "ZM-1001", status: "new", createdAt: "", statusHistory: [] };
    const message = orderWhatsappMessage(order, "https://zomoruda.vercel.app");
    expect(message).toContain("ZM-1001");
    expect(message).toContain("210 ₪");
    expect(message).toContain("/track?order=ZM-1001");
  });
});
