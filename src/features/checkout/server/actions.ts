"use server";

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
import { sign } from "@/lib/signing";

export type PlacedOrder = { orderNumber: string; total: number; whatsappUrl: string; successUrl: string };

const orderRateLimitMap = new Map<string, { count: number; resetAt: number }>();

/** Creates an order: validate -> re-price on the server -> persist -> WhatsApp handoff URL. */
export async function placeOrder(raw: unknown): Promise<Result<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return fail("بيانات الطلب غير صالحة", fieldErrorsFrom(parsed.error.issues));
  const input = parsed.data;

  const phoneForLimit = normalizePsPhone(input.customerPhone);
  if (phoneForLimit) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const entry = orderRateLimitMap.get(phoneForLimit);
    if (entry && entry.resetAt > now) {
      if (entry.count >= 5) {
        return fail("تم تجاوز عدد الطلبات المسموح به. يرجى الانتظار والمحاولة لاحقاً.");
      }
      entry.count += 1;
    } else {
      orderRateLimitMap.set(phoneForLimit, { count: 1, resetAt: now + windowMs });
    }
  }

  const settings = await getStoreSettings();
  if (settings.ordersPaused) return fail(settings.ordersPausedMessage);

  const repos = getRepos();
  const [products, zone, coupon] = await Promise.all([
    repos.products.getManyByIds([...new Set(input.items.map((i) => i.productId))]),
    input.fulfillment === "delivery" && input.zoneId ? repos.zones.getById(input.zoneId) : Promise.resolve(null),
    input.couponCode ? repos.coupons.getByCode(input.couponCode) : Promise.resolve(null),
  ]);

  const built = buildOrder({ input, products, zone, coupon });
  if (!built.ok) return fail(built.error);

  const phone = normalizePsPhone(input.customerPhone)!;
  const customer = await repos.customers.upsertByPhone({
    name: input.customerName,
    phone,
    birthday: input.birthday || undefined,
  });

  const order = await repos.orders.create({ ...built.order, customerId: customer.id });
  await Promise.all([
    ...order.items.map((item) => repos.products.adjustStock(item.productId, -item.quantity)),
    repos.customers.recordOrder(customer.id, order.total),
    built.couponId ? repos.coupons.incrementUsage(built.couponId) : Promise.resolve(),
  ]);

  revalidatePath("/admin", "layout");
  return ok({
    orderNumber: order.orderNumber,
    total: order.total,
    whatsappUrl: whatsappLink(orderWhatsappMessage(order, env.NEXT_PUBLIC_SITE_URL)),
    successUrl: `/order/${order.orderNumber}?t=${sign(order.orderNumber)}`,
  });
}

/** Live coupon preview in the checkout form (the order action re-checks it). */
export async function previewCoupon(code: string, lines: { price: number; quantity: number; options: { priceDelta: number }[] }[]) {
  const coupon = await (await getRepos()).coupons.getByCode(code);
  const subtotal = calculateSubtotal(lines.map((l) => ({ ...l, options: l.options.map((o) => ({ nameAr: "", valueAr: "", priceDelta: o.priceDelta })) })));
  const check = checkCoupon(coupon, subtotal);
  return check.ok ? { ok: true as const, discount: check.discount, code: check.coupon.code } : { ok: false as const, error: check.error };
} env } from "@/lib/env";
import { normalizePsPhone } from "@/lib/phone";
import { fail, fieldErrorsFrom, ok, type Result } from "@/lib/result";
import { whatsappLink } from "@/lib/site";
import { orderWhatsappMessage } from "@/features/orders/lib/whatsapp-message";
import { getStoreSettings } from "@/features/settings/server/queries";
import { checkCoupon } from "../lib/coupon";
import { buildOrder } from "../lib/build-order";
import { checkoutSchema } from "../schemas";
import { calculateSubtotal } from "@/lib/pricing";
import { sign } from "@/lib/signing";

export type PlacedOrder = { orderNumber: string; total: number; whatsappUrl: string; successUrl: string };

const orderRateLimitMap = new Map<string, { count: number; resetAt: number }>();

/** Creates an order: validate -> re-price on the server -> persist -> WhatsApp handoff URL. */
export async function placeOrder(raw: unknown): Promise<Result<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return fail("بيانات الطلب غير صالحة", fieldErrorsFrom(parsed.error.issues));
  const input = parsed.data;

  const phoneForLimit = normalizePsPhone(input.customerPhone);
  if (phoneForLimit) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const entry = orderRateLimitMap.get(phoneForLimit);
    if (entry && entry.resetAt > now) {
      if (entry.count >= 5) {
        return fail("تم تجاوز عدد الطلبات المسموح به. يرجى الانتظار والمحاولة لاحقاً.");
      }
      entry.count += 1;
    } else {
      orderRateLimitMap.set(phoneForLimit, { count: 1, resetAt: now + windowMs });
    }
  }

  const settings = await getStoreSettings();
  if (settings.ordersPaused) return fail(settings.ordersPausedMessage);

  const repos = getRepos();
  const [products, zone, coupon] = await Promise.all([
    repos.products.getManyByIds([...new Set(input.items.map((i) => i.productId))]),
    input.fulfillment === "delivery" && input.zoneId ? repos.zones.getById(input.zoneId) : Promise.resolve(null),
    input.couponCode ? repos.coupons.getByCode(input.couponCode) : Promise.resolve(null),
  ]);

  const built = buildOrder({ input, products, zone, coupon });
  if (!built.ok) return fail(built.error);

  const phone = normalizePsPhone(input.customerPhone)!;
  const customer = await repos.customers.upsertByPhone({
    name: input.customerName,
    phone,
    birthday: input.birthday || undefined,
  });

  const order = await repos.orders.create({ ...built.order, customerId: customer.id });
  await Promise.all([
    ...order.items.map((item) => repos.products.adjustStock(item.productId, -item.quantity)),
    repos.customers.recordOrder(customer.id, order.total),
    built.couponId ? repos.coupons.incrementUsage(built.couponId) : Promise.resolve(),
  ]);

  revalidatePath("/admin", "layout");
  return ok({
    orderNumber: order.orderNumber,
    total: order.total,
    whatsappUrl: whatsappLink(orderWhatsappMessage(order, env.NEXT_PUBLIC_SITE_URL)),
    successUrl: `/order/${order.orderNumber}?t=${sign(order.orderNumber)}`,
  });
}

/** Live coupon preview in the checkout form (the order action re-checks it). */
export async function previewCoupon(code: string, lines: { price: number; quantity: number; options: { priceDelta: number }[] }[]) {
  const coupon = await (await getRepos()).coupons.getByCode(code);
  const subtotal = calculateSubtotal(lines.map((l) => ({ ...l, options: l.options.map((o) => ({ nameAr: "", valueAr: "", priceDelta: o.priceDelta })) })));
  const check = checkCoupon(coupon, subtotal);
  return check.ok ? { ok: true as const, discount: check.discount, code: check.coupon.code } : { ok: false as const, error: check.error };
}erver";

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
import { sign } from "@/lib/signing";

export type PlacedOrder = { orderNumber: string; total: number; whatsappUrl: string; successUrl: string };

const orderRateLimitMap = new Map<string, { count: number; resetAt: number }>();

/** Creates an order: validate -> re-price on the server -> persist -> WhatsApp handoff URL. */
export async function placeOrder(raw: unknown): Promise<Result<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return fail("بيانات الطلب غير صالحة", fieldErrorsFrom(parsed.error.issues));
  const input = parsed.data;

  const phoneForLimit = normalizePsPhone(input.customerPhone);
  if (phoneForLimit) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const entry = orderRateLimitMap.get(phoneForLimit);
    if (entry && entry.resetAt > now) {
      if (entry.count >= 5) {
        return fail("تم تجاوز عدد الطلبات المسموح به. يرجى الانتظار والمحاولة لاحقاً.");
      }
      entry.count += 1;
    } else {
      orderRateLimitMap.set(phoneForLimit, { count: 1, resetAt: now + windowMs });
    }
  }

  const settings = await getStoreSettings();
  if (settings.ordersPaused) return fail(settings.ordersPausedMessage);

  const repos = getRepos();
  const [products, zone, coupon] = await Promise.all([
    repos.products.getManyByIds([...new Set(input.items.map((i) => i.productId))]),
    input.fulfillment === "delivery" && input.zoneId ? repos.zones.getById(input.zoneId) : Promise.resolve(null),
    input.couponCode ? repos.coupons.getByCode(input.couponCode) : Promise.resolve(null),
  ]);

  const built = buildOrder({ input, products, zone, coupon });
  if (!built.ok) return fail(built.error);

  const phone = normalizePsPhone(input.customerPhone)!;
  const customer = await repos.customers.upsertByPhone({
    name: input.customerName,
    phone,
    birthday: input.birthday || undefined,
  });

  const order = await repos.orders.create({ ...built.order, customerId: customer.id });
  await Promise.all([
    ...order.items.map((item) => repos.products.adjustStock(item.productId, -item.quantity)),
    repos.customers.recordOrder(customer.id, order.total),
    built.couponId ? repos.coupons.incrementUsage(built.couponId) : Promise.resolve(),
  ]);

  revalidatePath("/admin", "layout");
  return ok({
    orderNumber: order.orderNumber,
    total: order.total,
    whatsappUrl: whatsappLink(orderWhatsappMessage(order, env.NEXT_PUBLIC_SITE_URL)),
    successUrl: `/order/${order.orderNumber}?t=${sign(order.orderNumber)}`,
  });
}

/** Live coupon preview in the checkout form (the order action re-checks it). */
export async function previewCoupon(code: string, lines: { price: number; quantity: number; options: { priceDelta: number }[] }[]) {
  const coupon = await (await getRepos()).coupons.getByCode(code);
  const subtotal = calculateSubtotal(lines.map((l) => ({ ...l, options: l.options.map((o) => ({ nameAr: "", valueAr: "", priceDelta: o.priceDelta })) })));
  const check = checkCoupon(coupon, subtotal);
  return check.ok ? { ok: true as const, discount: check.discount, code: check.coupon.code } : { ok: false as const, error: check.error };
}
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
import { sign } from "@/lib/signing";

export type PlacedOrder = { orderNumber: string; total: number; whatsappUrl: string; successUrl: string };

/** Creates an order: validate -> re-price on the server -> persist -> WhatsApp handoff URL. */
export async function placeOrder(raw: unknown): Promise<Result<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return fail("تحقّقي من البيانات المطلوبة", fieldErrorsFrom(parsed.error.issues));
  const input = parsed.data;

  const settings = await getStoreSettings();
  if (settings.ordersPaused) return fail(settings.ordersPausedMessage);

  const repos = getRepos();
  const [products, zone, coupon] = await Promise.all([
    repos.products.getManyByIds([...new Set(input.items.map((i) => i.productId))]),
    input.fulfillment === "delivery" && input.zoneId ? repos.zones.getById(input.zoneId) : Promise.resolve(null),
    input.couponCode ? repos.coupons.getByCode(input.couponCode) : Promise.resolve(null),
  ]);

  const phone = normalizePsPhone(input.customerPhone)!;
  const customer = await repos.customers.upsertByPhone({
    name: input.customerName,
    phone,
    birthday: input.birthday || undefined,
  });

  const built = buildOrder({ input, products, zone, coupon, customer });
  if (!built.ok) return fail(built.error);

  const order = await repos.orders.create(built.order);
  await Promise.all([
    ...order.items.map((item) => repos.products.adjustStock(item.productId, -item.quantity)),
    repos.customers.recordOrder(customer.id, order.total),
    built.couponId ? repos.coupons.incrementUsage(built.couponId) : Promise.resolve(),
  ]);

  revalidatePath("/admin", "layout");
  return ok({
    orderNumber: order.orderNumber,
    total: order.total,
    whatsappUrl: whatsappLink(orderWhatsappMessage(order, env.NEXT_PUBLIC_SITE_URL)),
    successUrl: `/order/${order.orderNumber}?t=${sign(order.orderNumber)}`,
  });
}

/** Live coupon preview in the checkout form (the order action re-checks it). */
export async function previewCoupon(code: string, lines: { price: number; quantity: number; options: { priceDelta: number }[] }[]) {
  const coupon = await getRepos().coupons.getByCode(code);
  const subtotal = calculateSubtotal(lines.map((l) => ({ ...l, options: l.options.map((o) => ({ nameAr: "", valueAr: "", priceDelta: o.priceDelta })) })));
  const check = checkCoupon(coupon, subtotal);
  return check.ok ? { ok: true as const, discount: check.discount, code: check.coupon.code } : { ok: false as const, error: check.reason };
}
