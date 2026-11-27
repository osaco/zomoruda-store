"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { getRepos } from "@/lib/data";
import { getRequestIp, isRateLimited } from "@/lib/rate-limit";
import { trackingCookieName, verifyOrderAccessToken } from "@/lib/signing";
import type { OrderStatus } from "@/types/enums";

export type TrackingState = {
  error?: string;
  order?: { orderNumber: string; status: OrderStatus; fulfillment: "delivery" | "pickup"; canConfirm: boolean };
};

const orderNumberSchema = z.string().trim().max(30)
  .transform(value => value.toUpperCase().replace(/^#/, "").replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))))
  .transform(value => /^\d+$/.test(value) ? `ZM-${value}` : value)
  .pipe(z.string().regex(/^ZM-[0-9]{4,24}$/));

export async function trackOrderAction(_: TrackingState, form: FormData): Promise<TrackingState> {
  const parsed = orderNumberSchema.safeParse(form.get("orderNumber"));
  if (!parsed.success) return { error: "أدخلي رقم الطلب بصيغة صحيحة، مثل ZM-1234." };
  const number = parsed.data;
  const wantsConfirmation = form.get("intent") === "confirm";

  try {
    if (await isRateLimited("tracking-ip", await getRequestIp(), 30, 10 * 60))
      return { error: "محاولات كثيرة. حاولي بعد قليل." };

    const submitted = form.get("token");
    const saved = (await cookies()).get(trackingCookieName(number))?.value;
    const canAccess = verifyOrderAccessToken(number, saved) ||
      (typeof submitted === "string" && submitted.length < 100 && verifyOrderAccessToken(number, submitted));
    const repo = getRepos().orders;
    let order = await repo.getByNumber(number);
    if (!order) return { error: "لم نعثر على طلب بهذا الرقم." };

    if (wantsConfirmation && canAccess && order.status === "new") {
      order = await repo.confirmNewOrder(order.id);
      revalidatePath("/admin", "layout");
    }
    if (!order) return { error: "تعذر العثور على الطلب." };

    return {
      ...(wantsConfirmation && !canAccess ? { error: "لتأكيد الطلب، افتحي رابط طلبك الخاص أو استخدمي نفس المتصفح اللي طلبتِ منه." } : {}),
      order: { orderNumber: order.orderNumber, status: order.status, fulfillment: order.fulfillment, canConfirm: canAccess && order.status === "new" },
    };
  } catch {
    return { error: "تعذّر التحقق من حالة الطلب حالياً. حاولي بعد قليل." };
  }
}
