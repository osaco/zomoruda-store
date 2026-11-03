import { describe, expect, it } from "vitest";
import { orderWhatsappMessage } from "@/features/orders/lib/whatsapp-message";
import { whatsappLink } from "@/lib/site";
import type { Order, OrderItem } from "@/types/db";

const makeOrder = (lineCount: number): Order => {
  const items = Array.from({ length: lineCount }, (_, index) => ({
    productId: `product-${index}`,
    nameAr: `منتج ${index + 1}`,
    price: 25,
    quantity: 1,
    imageUrl: null,
    options: [],
    customName: null,
    cardMessage: null,
    photoPath: null,
    lineTotal: 25,
  }) satisfies OrderItem);
  return {
    id: "order-id",
    orderNumber: "ZM-1234",
    customerId: null,
    customerName: "سارة أحمد",
    customerPhone: "0597000000",
    zoneId: "zone-id",
    zoneNameAr: "الرمال",
    address: null,
    items,
    subtotal: lineCount * 25,
    deliveryFee: 0,
    discount: 0,
    total: lineCount * 25,
    couponCode: null,
    fulfillment: "delivery",
    deliveryDate: null,
    timeSlot: null,
    paymentMethod: "cash_on_delivery",
    receiptPath: null,
    status: "new",
    notes: null,
    createdAt: "2026-11-02T10:00:00.000Z",
    statusHistory: [],
  };
};

describe("compact order WhatsApp message", () => {
  it.each([1, 3, 8])("keeps a %i-item wa.me URL short and identifiable", (itemCount) => {
    const order = makeOrder(itemCount);
    const message = orderWhatsappMessage(order, "https://zomoruda-store.vercel.app");
    const url = whatsappLink(message);
    expect(url.length).toBeLessThan(1200);
    expect(message).toContain(order.orderNumber);
    expect(message).toContain("https://zomoruda-store.vercel.app/track?order=ZM-1234");
  });
});
