import type { Customer, DeliveryZone, Order, OrderStatus, Product } from "@/types/db";
import { calculateLineTotal, formatOrderNumber, roundMoney } from "@/lib/pricing";

const people = [
  { name: "سارة أحمد", phone: "0599123456", birthday: "1998-11-03" },
  { name: "لينا خالد", phone: "0597654321", birthday: "2001-12-15" },
  { name: "مريم يوسف", phone: "0592223344", birthday: null },
  { name: "هبة سمير", phone: "0568889900", birthday: "1995-11-20" },
  { name: "رنا محمود", phone: "0594445566", birthday: null },
];

const statuses: OrderStatus[] = ["new", "confirmed", "preparing", "out_for_delivery", "delivered", "delivered", "delivered", "cancelled", "new", "delivered"];

/** Deterministic sample orders so the admin dashboard has something to show in demo mode. */
export function buildDemoOrders(products: Product[], zones: DeliveryZone[]) {
  const customers: Customer[] = people.map((p, i) => ({
    id: `cus-demo-${i + 1}`,
    name: p.name,
    phone: p.phone,
    birthday: p.birthday,
    anniversary: null,
    notes: null,
    ordersCount: 0,
    totalSpent: 0,
    createdAt: new Date(Date.UTC(2026, 8, 1 + i)).toISOString(),
  }));

  const today = Date.now();
  const orders: Order[] = statuses.map((status, i) => {
    const customer = customers[i % customers.length];
    const zone = zones[i % zones.length];
    const product = products[(i * 5) % products.length];
    const quantity = (i % 2) + 1;
    const line = {
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity,
      imageUrl: product.images[0]?.url ?? null,
      options: [],
      customName: null,
      cardMessage: null,
      photoPath: null,
      lineTotal: calculateLineTotal({ price: product.price, quantity }),
    };
    const subtotal = line.lineTotal;
    const total = roundMoney(subtotal + zone.fee);
    const createdAt = new Date(today - (statuses.length - i) * 86_400_000 * 1.3).toISOString();
    if (status !== "cancelled") {
      customer.ordersCount += 1;
      customer.totalSpent += total;
    }
    return {
      id: `ord-demo-${i + 1}`,
      orderNumber: formatOrderNumber(1001 + i),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      zoneId: zone.id,
      zoneNameAr: zone.nameAr,
      address: "غزة - الرمال",
      items: [line],
      subtotal,
      deliveryFee: zone.fee,
      discount: 0,
      total,
      couponCode: null,
      fulfillment: "delivery",
      deliveryDate: null,
      timeSlot: null,
      paymentMethod: i % 3 === 0 ? "bank_transfer" : "cash_on_delivery",
      receiptPath: null,
      status,
      notes: null,
      createdAt,
      statusHistory: [
        { id: `hist-demo-${i}-a`, orderId: `ord-demo-${i + 1}`, status: "new", note: "تم استلام الطلب", createdBy: null, createdAt },
        ...(status !== "new"
          ? [{ id: `hist-demo-${i}-b`, orderId: `ord-demo-${i + 1}`, status, note: null, createdBy: "admin", createdAt }]
          : []),
      ],
    };
  });

  return { customers, orders: orders.reverse() };
}
