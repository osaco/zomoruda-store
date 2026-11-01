import type { Order, Product } from "@/types/db";
import { PAYMENT_METHOD_LABELS_AR } from "@/types/enums";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

const DIVIDER = "━━━━━━━━━━━━━━━━━━━━";

/** The structured message the customer sends to the store on WhatsApp. */
export function orderWhatsappMessage(order: Order, siteUrl: string): string {
  const lines: string[] = [];
  lines.push(`🛍️ *طلب جديد من متجر زُمُرّدة*`);
  lines.push(DIVIDER);
  lines.push(`📋 *رقم الطلب:* #${order.orderNumber}`);
  lines.push(`👤 *الاسم:* ${order.customerName}`);
  lines.push(`📱 *الجوال:* ${order.customerPhone}`);

  if (order.fulfillment === "delivery") {
    lines.push(`🚚 *طريقة الاستلام:* توصيل${order.zoneNameAr ? ` — ${order.zoneNameAr}` : ""}`);
    if (order.address) lines.push(`📍 *العنوان:* ${order.address}`);
  } else {
    lines.push(`🛍️ *طريقة الاستلام:* استلام من المتجر (${site.addressAr})`);
  }

  if (order.deliveryDate) {
    lines.push(`📅 *الموعد المطلوب:* ${order.deliveryDate}${order.timeSlot ? ` (${order.timeSlot})` : ""}`);
  }

  lines.push(DIVIDER);
  lines.push(`📦 *تفاصيل المنتجات:*`);
  order.items.forEach((item, i) => {
    lines.push(`${i + 1}. *${item.nameAr}* × ${item.quantity} = ${formatPrice(item.lineTotal)}`);
    const opts = item.options.map((o) => `${o.nameAr}: ${o.valueAr}`).join("، ");
    if (opts) lines.push(`   ▫️ الخيارات: ${opts}`);
    if (item.customName) lines.push(`   ▫️ الاسم المكتوب: ${item.customName}`);
    if (item.cardMessage) lines.push(`   ▫️ رسالة الكرت: "${item.cardMessage}"`);
    if (item.photoPath) lines.push(`   ▫️ مرفق صورة مخصصة للطباعة 🖼️`);
  });

  lines.push(DIVIDER);
  lines.push(`💵 *ملخص الحساب:*`);
  lines.push(`▫️ المجموع الفرعي: ${formatPrice(order.subtotal)}`);
  if (order.deliveryFee > 0) {
    lines.push(`▫️ رسوم التوصيل: ${formatPrice(order.deliveryFee)}`);
  } else if (order.fulfillment === "pickup") {
    lines.push(`▫️ رسوم التوصيل: مجاناً (استلام من المتجر)`);
  }
  if (order.discount > 0) {
    lines.push(`▫️ الخصم${order.couponCode ? ` (كوبون: ${order.couponCode})` : ""}: -${formatPrice(order.discount)}`);
  }
  lines.push(`💰 *الإجمالي النهائي: ${formatPrice(order.total)}*`);
  lines.push(`💳 *طريقة الدفع:* ${PAYMENT_METHOD_LABELS_AR[order.paymentMethod]}${order.receiptPath ? " (مرفق إشعار التحويل 📎)" : ""}`);
  if (order.notes) {
    lines.push(`📝 *ملاحظات خاصة:* ${order.notes}`);
  }

  lines.push(DIVIDER);
  lines.push(`🔍 *تتبّع حالة الطلب مباشرة:*`);
  lines.push(`${siteUrl}/track?order=${order.orderNumber}`);

  return lines.join("\n");
}

/** Quick inquiry message from the product page (Zero Ghost Orders: inquiry only, not an order). */
export function productWhatsappMessage(
  product: Pick<Product, "nameAr" | "slug">,
  price: number,
  siteUrl: string,
  options: { nameAr: string; valueAr: string }[] = [],
): string {
  const opts = options.map((o) => `${o.nameAr}: ${o.valueAr}`).join("، ");
  return [
    `مرحباً زُمُرّدة 👋`,
    `أود الاستفسار عن توفر منتج: ${product.nameAr}`,
    opts ? `الخيارات: ${opts}` : null,
    `السعر المعروض: ${formatPrice(price)}`,
    `رابط المنتج: ${siteUrl}/product/${product.slug}`,
    `شكراً لكم!`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Template WhatsApp messages sent by the admin to the customer for status updates. */
export function customerStatusWhatsappMessage(
  order: Pick<Order, "orderNumber" | "customerName" | "fulfillment">,
  status: "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled",
  siteUrl: string,
): string {
  const firstName = order.customerName.split(" ")[0];
  const orderNum = `#${order.orderNumber}`;
  const trackLink = `${siteUrl}/track?order=${order.orderNumber}`;

  switch (status) {
    case "confirmed":
      return [
        `مرحباً ${firstName} 💜`,
        `يسعدنا إبلاغك بأنه تم *تأكيد طلبك* ${orderNum} في متجر زُمُرّدة وجارٍ البدء بتجهيزه ✨`,
        `يمكنك متابعة حالة الطلب في أي وقت عبر الرابط:`,
        trackLink,
      ].join("\n");

    case "preparing":
      return [
        `مرحباً ${firstName} 💜`,
        `طلبك ${orderNum} في متجر زُمُرّدة *قيد التجهيز والتغليف* الآن بكل حب 🎁`,
        `يمكنك متابعة الحالة عبر الرابط:`,
        trackLink,
      ].join("\n");

    case "out_for_delivery":
      if (order.fulfillment === "pickup") {
        return [
          `مرحباً ${firstName} 💜`,
          `طلبك ${orderNum} *جاهز للاستلام* الآن من متجر زُمُرّدة! 🛍️`,
          `📍 العنوان: ${site.addressAr}`,
          `⏰ أوقات العمل: ${site.hoursAr}`,
          `نحن بانتظار زيارتك الكريمة 🌸`,
        ].join("\n");
      }
      return [
        `مرحباً ${firstName} 💜`,
        `طلبك ${orderNum} من متجر زُمُرّدة *في الطريق إليك* الآن مع مندوب التوصيل 🚚`,
        `يرجى إبقاء الهاتف متاحاً للتنسيق السريع.`,
        `رابط تتبع الطلب:`,
        trackLink,
      ].join("\n");

    case "delivered":
      return [
        `مرحباً ${firstName} 💜`,
        `تم *تسليم طلبك* ${orderNum} بنجاح! ✨`,
        `نتمنى أن تنال الهدية إعجابكم وأن تصنع لحظات مميزة 🌸`,
        `شكراً لاختيارك متجر زُمُرّدة، ويسعدنا دائماً خدمتك!`,
      ].join("\n");

    case "cancelled":
      return [
        `مرحباً ${firstName} 💜`,
        `نود إعلامك بأنه تم إلغاء الطلب ${orderNum} في متجر زُمُرّدة.`,
        `إذا كان لديك أي استفسار أو ترغبين بإعادة الطلب، يسعدنا تواصلك معنا دائماً 🌸`,
      ].join("\n");
  }
}
