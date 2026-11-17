/**
 * Server-side order pricing. Never trusts client prices: every line is
 * re-priced from the product record and its option deltas.
 */
import type { Coupon, Customer, DeliveryZone, OrderItem, Product } from "@/types/db";
import type { NewOrderRecord } from "@/lib/data/repositories";
import { calculateTotals } from "@/lib/pricing";
import { normalizePsPhone } from "@/lib/phone";
import { getProductStorefrontImage } from "@/lib/storefront-images";
import type { CheckoutInput } from "../schemas";
import { checkCoupon } from "./coupon";

export type BuildOrderResult =
  | { ok: true; order: NewOrderRecord; couponId: string | null }
  | { ok: false; error: string };

export function buildOrder(args: {
  input: CheckoutInput;
  products: Product[];
  zone: DeliveryZone | null;
  coupon: Coupon | null;
  customer: Pick<Customer, "id"> | null;
  now?: Date;
}): BuildOrderResult {
  const { input, products, zone, coupon, customer } = args;
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];

  // Check combined quantities: separate cart lines may refer to the same SKU.
  const requestedByProduct = new Map<string, number>();
  for (const line of input.items) {
    const product = byId.get(line.productId);
    if (product?.isGiftBox && !line.giftBoxKey) return { ok: false, error: `اختاري محتويات بوكس «${product.nameAr}» قبل إضافته` };
    requestedByProduct.set(line.productId, (requestedByProduct.get(line.productId) ?? 0) + line.quantity);
  }
  for (const [productId, quantity] of requestedByProduct) {
    const product = byId.get(productId);
    if (!product || !product.isActive) return { ok: false, error: "أحد المنتجات لم يعد متوفراً" };
    if (product.availability === "out_of_stock") return { ok: false, error: `«${product.nameAr}» نفد من المخزون` };
    if (product.availability === "in_stock" && product.stockQty < quantity)
      return { ok: false, error: `الكمية المتوفرة من «${product.nameAr}» هي ${product.stockQty}` };
  }

  const giftBoxes = new Map<string, { product: Product; quantity: number }>();
  for (const line of input.items) {
    if (!line.giftBoxKey) {
      if (line.giftBoxId) return { ok: false, error: "محتويات بوكس الهدية غير صالحة" };
      continue;
    }
    if (line.giftBoxId) continue;
    const product = byId.get(line.productId);
    if (!product) return { ok: false, error: "أحد منتجات البوكس لم يعد متوفراً" };
    if (!product.isGiftBox || giftBoxes.has(line.giftBoxKey)) return { ok: false, error: "اختيار بوكس الهدية غير صالح" };
    giftBoxes.set(line.giftBoxKey, { product, quantity: 0 });
  }
  for (const line of input.items) {
    if (!line.giftBoxId) continue;
    const product = byId.get(line.productId);
    if (!product) return { ok: false, error: "أحد منتجات البوكس لم يعد متوفراً" };
    const box = line.giftBoxKey ? giftBoxes.get(line.giftBoxKey) : undefined;
    if (!box || line.giftBoxId !== box.product.id || !product.allowInGiftBox || product.isGiftBox) {
      return { ok: false, error: `«${product.nameAr}» لا يمكن وضعه في هذا البوكس` };
    }
    box.quantity += line.quantity;
  }
  for (const box of giftBoxes.values()) {
    if (box.quantity < 1) return { ok: false, error: `أضيفي قطعة واحدة على الأقل إلى «${box.product.nameAr}»` };
    if (box.product.giftBoxCapacity !== null && box.quantity > box.product.giftBoxCapacity) {
      return { ok: false, error: `سعة «${box.product.nameAr}» هي ${box.product.giftBoxCapacity} قطع` };
    }
  }

  for (const line of input.items) {
    const product = byId.get(line.productId);
    if (!product) return { ok: false, error: "أحد المنتجات لم يعد متوفراً" };

    const group = line.giftBoxKey ? giftBoxes.get(line.giftBoxKey) : null;
    if (!line.giftBoxKey && line.giftBoxId) return { ok: false, error: "محتويات بوكس الهدية غير صالحة" };

    const options = [];
    for (const option of product.options) {
      const picked = line.options.find((o) => o.nameAr === option.nameAr);
      const value = picked && option.values.find((v) => v.valueAr === picked.valueAr);
      if (!value) {
        if (option.isRequired) return { ok: false, error: `اختاري «${option.nameAr}» لـ «${product.nameAr}»` };
        continue;
      }
      options.push({ nameAr: option.nameAr, valueAr: value.valueAr, priceDelta: value.priceDelta });
    }

    if (line.options.some((picked) => !product.options.some((option) => option.nameAr === picked.nameAr && option.values.some((value) => value.valueAr === picked.valueAr)))) {
      return { ok: false, error: `أحد خيارات «${product.nameAr}» لم يعد متاحاً` };
    }

    const customName = product.allowName ? line.customName?.trim() || null : null;
    const cardMessage = product.allowCardMessage ? line.cardMessage?.trim() || null : null;
    const photoPath = product.allowPhotoUpload ? line.photoPath || null : null;
    if (product.nameRequired && !customName) return { ok: false, error: `أدخلي الاسم المطلوب لـ «${product.nameAr}»` };
    if (product.cardMessageRequired && !cardMessage) return { ok: false, error: `أدخلي رسالة الإهداء المطلوبة لـ «${product.nameAr}»` };
    if (product.photoRequired && !photoPath) return { ok: false, error: `ارفعي الصورة المطلوبة لـ «${product.nameAr}»` };
    const nameFee = customName ? product.namePrice : 0;
    const cardMessageFee = cardMessage ? product.cardMessagePrice : 0;
    const photoFee = photoPath ? product.photoPrice : 0;
    const unitTotal = Math.max(0, product.price + options.reduce((sum, option) => sum + option.priceDelta, 0) + nameFee + cardMessageFee + photoFee);

    items.push({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity: line.quantity,
      imageUrl: getProductStorefrontImage(product).src,
      options,
      customName,
      nameFee,
      cardMessage,
      cardMessageFee,
      photoPath,
      photoFee,
      giftBoxKey: line.giftBoxKey || null,
      giftBoxId: line.giftBoxId || null,
      giftBoxName: line.giftBoxId ? group?.product.nameAr ?? null : null,
      isGiftBox: !line.giftBoxId && product.isGiftBox,
      lineTotal: Math.round(unitTotal * line.quantity * 100) / 100,
    });
  }

  const isDelivery = input.fulfillment === "delivery";
  if (isDelivery && (!zone || !zone.isActive)) return { ok: false, error: "منطقة التوصيل غير متاحة" };

  const preview = calculateTotals({ lines: items, deliveryFee: 0 });
  if (isDelivery && zone?.minOrder && preview.subtotal < zone.minOrder)
    return { ok: false, error: `الحد الأدنى للطلب في ${zone.nameAr} هو ${zone.minOrder} ₪` };

  let appliedCoupon: Coupon | null = null;
  if (input.couponCode) {
    const check = checkCoupon(coupon, preview.subtotal, args.now);
    if (!check.ok) return { ok: false, error: check.reason };
    appliedCoupon = check.coupon;
  }

  const totals = calculateTotals({
    lines: items,
    deliveryFee: isDelivery ? zone!.fee : 0,
    coupon: appliedCoupon,
  });

  return {
    ok: true,
    couponId: appliedCoupon?.id ?? null,
    order: {
      customerId: customer?.id ?? null,
      customerName: input.customerName,
      customerPhone: normalizePsPhone(input.customerPhone)!,
      zoneId: isDelivery ? zone!.id : null,
      zoneNameAr: isDelivery ? zone!.nameAr : null,
      address: isDelivery ? input.address ?? null : null,
      items,
      ...totals,
      couponCode: appliedCoupon?.code ?? null,
      fulfillment: input.fulfillment,
      deliveryDate: input.deliveryDate || null,
      timeSlot: input.timeSlot || null,
      paymentMethod: input.paymentMethod,
      receiptPath: input.paymentMethod === "bank_transfer" ? input.receiptPath ?? null : null,
      notes: input.notes || null,
    },
  };
}
