/**
 * Integration: checkout server action against the demo data layer
 * (validation -> server re-pricing -> persistence -> stock/CRM/coupon side effects).
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { placeOrder } = await import("@/features/checkout/server/actions");
const { getRepos } = await import("@/lib/data");
const { findOrderForTracking } = await import("@/features/orders/server/queries");

describe("placeOrder (demo adapter)", () => {
  it("creates an order end to end", async () => {
    const repos = getRepos();
    const product = (await repos.products.getBySlug("name-necklace"))!;
    const zone = (await repos.zones.list())[0];
    const stockBefore = product.stockQty;

    const res = await placeOrder({
      customerName: "نور",
      customerPhone: "0597000111",
      fulfillment: "delivery",
      zoneId: zone.id,
      address: "غزة، الرمال",
      paymentMethod: "cash_on_delivery",
      couponCode: "GIFT5",
      items: [{ productId: product.id, quantity: 2, options: [{ nameAr: "اللون", valueAr: "روز جولد" }], customName: "نور" }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.total).toBe((45 + 5) * 2 + zone.fee - 5);
    expect(res.data.whatsappUrl).toContain("wa.me/970567812644");
    expect(res.data.successUrl).toMatch(/^\/order\/ZM-\d{4}\?t=/);

    const order = await findOrderForTracking(res.data.orderNumber, "+970597000111");
    expect(order?.items[0].customName).toBe("نور");
    expect((await repos.products.getById(product.id))!.stockQty).toBe(stockBefore - 2);
    expect((await repos.customers.getByPhone("0597000111"))!.ordersCount).toBe(1);
    expect((await repos.coupons.getByCode("GIFT5"))!.usedCount).toBe(1);
    expect(await findOrderForTracking(res.data.orderNumber, "0599999999")).toBeNull();

    const placed = await repos.orders.getByNumber(res.data.orderNumber);
    expect(placed).not.toBeNull();
    const soldAfterOrder = (await repos.products.getById(product.id))!.soldCount;
    await repos.orders.updateStatus(placed!.id, "cancelled");
    expect((await repos.products.getById(product.id))!.stockQty).toBe(stockBefore);
    expect((await repos.products.getById(product.id))!.soldCount).toBe(soldAfterOrder - 2);
    await repos.orders.updateStatus(placed!.id, "new");
    expect((await repos.products.getById(product.id))!.stockQty).toBe(stockBefore - 2);
  });

  it("rejects invalid phone and empty cart with field errors", async () => {
    const res = await placeOrder({ customerName: "x", customerPhone: "123", fulfillment: "pickup", paymentMethod: "cash_on_delivery", items: [] });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.fieldErrors?.customerPhone).toBeDefined();
    expect(res.fieldErrors?.items).toBeDefined();
  });

  it("refuses orders while paused", async () => {
    await getRepos().settings.set("orders_paused", "true");
    const product = (await getRepos().products.getBySlug("pearl-bracelet"))!;
    const res = await placeOrder({ customerName: "نور", customerPhone: "0597000111", fulfillment: "pickup", paymentMethod: "cash_on_delivery", items: [{ productId: product.id, quantity: 1, options: [] }] });
    expect(res.ok).toBe(false);
    await getRepos().settings.set("orders_paused", "false");
  });
});
