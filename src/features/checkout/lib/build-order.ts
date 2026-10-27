/**
 * Server-side order pricing. Never trusts client prices: every line is
 * re-priced from the product record and its option deltas.
 */
import type { Coupon, Customer, DeliveryZone, OrderItem, Product } from "@/types/db";
import type { NewOrderRecord } from "@/lib/data/repositories";
import { calculateLineTotal, calculateTotals } from "@/lib/pricing";
import { normalizePsPhone } from "@/lib/phone";
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

  for (const line of input.items) {
    const product = byId.get(line.productId);
    if (!product || !product.isActive) return { ok: false, error: "أحد المنتجات لم يعد متوفراً" };
    if (product.availability === "out_of_stock") return { ok: false, error: `«${product.nameAr}» نفد من المخزون` };
    if (product.availability === "in_stock" && product.stockQty < line.quantity)
      return { ok: false, error: `الكمية المتوفرة من «${product.nameAr}» هي ${product.stockQty}` };

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

    items.push({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity: line.quantity,
      imageUrl: product.images[0]?.url ?? null,
      options,
      customName: product.allowName ? line.customName || null : null,
      cardMessage: product.allowCardMessage ? line.cardMessage || null : null,
      photoPath: product.allowPhotoUpload ? line.photoPath || null : null,
      lineTotal: calculateLineTotal({ price: product.price, quantity: line.quantity, options }),
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
