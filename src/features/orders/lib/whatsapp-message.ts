import type { Order, Product } from "@/types/db";
import { FULFILLMENT_LABELS_AR, PAYMENT_METHOD_LABELS_AR } from "@/types/enums";
import { formatPrice } from "@/lib/format";

/** The structured message the customer sends to the store on WhatsApp. */
export function orderWhatsappMessage(order: Order, siteUrl: string): string {
  const lines: string[] = [];
  lines.push(`🛍️ طلب جديد من زُمُرّدة`);
  lines.push(`رقم الطلب: ${order.orderNumber}`);
  lines.push("");
  lines.push(`👤 الاسم: ${order.customerName}`);
  lines.push(`📱 الجوال: ${order.customerPhone}`);
  lines.push(`🚚 الاستلام: ${FULFILLMENT_LABELS_AR[order.fulfillment]}${order.zoneNameAr ? ` - ${order.zoneNameAr}` : ""}`);
  if (order.address) lines.push(`📍 العنوان: ${order.address}`);
  if (order.deliveryDate) lines.push(`📅 التاريخ: ${order.deliveryDate}${order.timeSlot ? ` (${order.timeSlot})` : ""}`);
  lines.push("");
  lines.push("المنتجات:");
  order.items.forEach((item, i) => {
    const opts = item.options.map((o) => `${o.nameAr}: ${o.valueAr}`).join("، ");
    lines.push(`${i + 1}) ${item.nameAr} × ${item.quantity} = ${formatPrice(item.lineTotal)}`);
    if (opts) lines.push(`   • ${opts}`);
    if (item.customName) lines.push(`   • الاسم: ${item.customName}`);
    if (item.cardMessage) lines.push(`   • رسالة الكرت: ${item.cardMessage}`);
    if (item.photoPath) lines.push(`   • تم رفع صورة للطباعة`);
  });
  lines.push("");
  lines.push(`المجموع: ${formatPrice(order.subtotal)}`);
  if (order.deliveryFee) lines.push(`التوصيل: ${formatPrice(order.deliveryFee)}`);
  if (order.discount) lines.push(`الخصم${order.couponCode ? ` (${order.couponCode})` : ""}: -${formatPrice(order.discount)}`);
  lines.push(`💰 الإجمالي: ${formatPrice(order.total)}`);
  lines.push(`الدفع: ${PAYMENT_METHOD_LABELS_AR[order.paymentMethod]}${order.receiptPath ? " (تم رفع الإيصال)" : ""}`);
  if (order.notes) lines.push(`📝 ملاحظات: ${order.notes}`);
  lines.push("");
  lines.push(`تتبّع الطلب: ${siteUrl}/track?order=${order.orderNumber}`);
  return lines.join("\n");
}

/** Quick "order this product" message from the product page. */
export function productWhatsappMessage(
  product: Pick<Product, "nameAr" | "slug">,
  price: number,
  siteUrl: string,
  options: { nameAr: string; valueAr: string }[] = [],
): string {
  const opts = options.map((o) => `${o.nameAr}: ${o.valueAr}`).join("، ");
  return [
    `مرحباً زُمُرّدة 👋`,
    `أرغب بطلب: ${product.nameAr}`,
    opts ? `الخيارات: ${opts}` : null,
    `السعر: ${formatPrice(price)}`,
    `${siteUrl}/product/${product.slug}`,
  ]
    .filter(Boolean)
    .join("\n");
}
