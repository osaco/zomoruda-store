"use server";

import { trackSchema } from "@/features/checkout/schemas";
import { getRequestIp, isRateLimited } from "@/lib/rate-limit";
import { normalizePsPhone } from "@/lib/phone";
import type { FulfillmentType, OrderStatus } from "@/types/enums";
import { findOrderForTracking } from "./queries";

export type TrackingState = {
  error?: string;
  order?: {
    orderNumber: string;
    createdAt: string;
    items: { nameAr: string; quantity: number; lineTotal: number }[];
    total: number;
    status: OrderStatus;
    fulfillment: FulfillmentType;
    statusHistory: { id: string; orderId: string; status: OrderStatus; note: null; createdBy: null; createdAt: string }[];
  };
};

export async function trackOrderAction(_: TrackingState, form: FormData): Promise<TrackingState> {
  const parsed = trackSchema.safeParse({ orderNumber: form.get("orderNumber"), phone: form.get("phone") });
  if (!parsed.success) return { error: "أدخلي رقم الطلب ورقم الجوال بصيغة صحيحة" };
  const phone = normalizePsPhone(parsed.data.phone);
  if (!phone) return { error: "أدخلي رقم الطلب ورقم الجوال بصيغة صحيحة" };

  try {
    const ip = await getRequestIp();
    const [ipLimited, pairLimited] = await Promise.all([
      isRateLimited("tracking-ip", ip, 30, 10 * 60),
      isRateLimited("tracking-pair", `${parsed.data.orderNumber.trim().toUpperCase()}:${phone}`, 5, 10 * 60),
    ]);
    if (ipLimited || pairLimited) return { error: "تعذر العثور على الطلب بهذه البيانات" };
  } catch {
    return { error: "تعذر التحقق من الطلب حالياً. حاولي بعد قليل." };
  }

  const order = await findOrderForTracking(parsed.data.orderNumber, phone);
  if (!order) return { error: "تعذر العثور على الطلب بهذه البيانات" };

  return {
    order: {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      items: order.items.map(({ nameAr, quantity, lineTotal }) => ({ nameAr, quantity, lineTotal })),
      total: order.total,
      status: order.status,
      fulfillment: order.fulfillment,
      statusHistory: order.statusHistory.map(({ id, orderId, status, createdAt }) => ({
        id, orderId, status, note: null, createdBy: null, createdAt,
      })),
    },
  };
}
