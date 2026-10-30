"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getRepos } from "@/lib/data";
import { env } from "@/lib/env";
import { normalizePsPhone } from "@/lib/phone";
import { fail, fieldErrorsFrom, ok, type Result } from "@/lib/result";
import { whatsappLink } from "@/lib/site";
import { orderWhatsappMessage } from "@/features/orders/lib/whatsapp-message";
import { getStoreSettings } from "@/features/settings/server/queries";
import { checkCoupon } from "../lib/coupon";
import { buildOrder } from "../lib/build-order";
import { checkoutSchema } from "../schemas";
import { calculateSubtotal } from "@/lib/pricing";
import { signOrderAccessToken } from "@/lib/signing";
import { getRequestIp, isRateLimited } from "@/lib/rate-limit";

export type PlacedOrder = { orderNumber: string; total: number; whatsappUrl: string; successUrl: string };

const couponPreviewSchema = z.object({
  code: z.string().trim().min(1).max(30),
  lines: z.array(z.object({
    price: z.number().finite().min(0).max(100_000),
    quantity: z.number().int().min(1).max(50),
    options: z.array(z.object({ priceDelta: z.number().finite().min(-100_000).max(100_000) })).max(10),
  })).min(1).max(50),
});

/** Creates an order: validate -> re-price on the server -> persist -> WhatsApp handoff URL. */
export async function placeOrder(raw: unknown): Promise<Result<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return fail("بيانات الطلب غير صالحة", fieldErrorsFrom(parsed.error.issues));
  const input = parsed.data;

  const phoneForLimit = normalizePsPhone(input.customerPhone);
  if (!phoneForLimit) return fail("رقم الجوال غير صحيح");
  try {
    const ip = await getRequestIp();
    const [ipLimited, phoneLimited] = await Promise.all([
      isRateLimited("checkout-ip", ip, 30, 10 * 60),
      isRateLimited("checkout-phone", phoneForLimit, 5, 10 * 60),
    ]);
    if (ipLimited || phoneLimited) {
      return fail("تم تجاوز عدد الطلبات المسموح به. يرجى الانتظار والمحاولة لاحقاً.");
    }
  } catch {
    return fail("تعذر التحقق من الطلب حالياً. يرجى المحاولة بعد قليل.");
  }

  const settings = await getStoreSettings();
  if (settings.ordersPaused) return fail(settings.ordersPausedMessage);

  const repos = getRepos();
  const [products, zone, coupon] = await Promise.all([
    repos.products.getManyByIds([...new Set(input.items.map((i) => i.productId))]),
    input.fulfillment === "delivery" && input.zoneId ? repos.zones.getById(input.zoneId) : Promise.resolve(null),
    input.couponCode ? repos.coupons.getByCode(input.couponCode) : Promise.resolve(null),
  ]);

  const built = buildOrder({ input, products, zone, coupon, customer: null });
  if (!built.ok) return fail(built.error);

  const phone = normalizePsPhone(input.customerPhone)!;
  const order = await repos.orders.placeCheckoutOrder(
    { ...built.order, customerId: null },
    { name: input.customerName, phone, birthday: input.birthday || undefined },
    built.couponId,
  );
  if (!order) return fail("تغيّر المخزون أو انتهت صلاحية الكوبون أثناء إتمام الطلب. راجعي السلة وحاولي مرة أخرى.");

  revalidatePath("/admin", "layout");
  return ok({
    orderNumber: order.orderNumber,
    total: order.total,
    whatsappUrl: whatsappLink(orderWhatsappMessage(order, env.NEXT_PUBLIC_SITE_URL)),
    successUrl: `/order/${order.orderNumber}?t=${signOrderAccessToken(order.orderNumber)}`,
  });
}

/** Live coupon preview in the checkout form (the order action re-checks it). */
export async function previewCoupon(code: string, lines: { price: number; quantity: number; options: { priceDelta: number }[] }[]) {
  const parsed = couponPreviewSchema.safeParse({ code, lines });
  if (!parsed.success) return { ok: false as const, error: "بيانات الكوبون غير صالحة" };
  try {
    const ip = await getRequestIp();
    if (await isRateLimited("coupon-preview-ip", ip, 60, 10 * 60)) {
      return { ok: false as const, error: "حاولي التحقق من الكوبون بعد قليل" };
    }
  } catch {
    return { ok: false as const, error: "تعذر التحقق من الكوبون حالياً" };
  }
  const coupon = await (await getRepos()).coupons.getByCode(parsed.data.code);
  const subtotal = calculateSubtotal(parsed.data.lines.map((l) => ({ ...l, options: l.options.map((o) => ({ nameAr: "", valueAr: "", priceDelta: o.priceDelta })) })));
  const check = checkCoupon(coupon, subtotal);
  return check.ok ? { ok: true as const, discount: check.discount, code: check.coupon.code } : { ok: false as const, error: check.reason };
}
