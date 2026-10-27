import { z } from "zod";
import { FULFILLMENT_VALUES, PAYMENT_METHOD_VALUES } from "@/types/enums";
import { isValidPsPhone } from "@/lib/phone";

export const CARD_MESSAGE_MAX = 150;

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  options: z.array(z.object({ nameAr: z.string(), valueAr: z.string() })).default([]),
  customName: z.string().trim().max(40).nullish(),
  cardMessage: z.string().trim().max(CARD_MESSAGE_MAX, `رسالة الكرت ${CARD_MESSAGE_MAX} حرف كحد أقصى`).nullish(),
  photoPath: z.string().max(300).nullish(),
});
export type CartLineInput = z.infer<typeof cartLineSchema>;

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(2, "الاسم مطلوب").max(60),
    customerPhone: z.string().trim().refine(isValidPsPhone, "رقم الجوال غير صحيح (059 أو 056)"),
    fulfillment: z.enum(FULFILLMENT_VALUES),
    zoneId: z.string().nullish(),
    address: z.string().trim().max(200).nullish(),
    deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "اختاري التاريخ").nullish().or(z.literal("")),
    timeSlot: z.string().max(60).nullish(),
    paymentMethod: z.enum(PAYMENT_METHOD_VALUES),
    receiptPath: z.string().max(300).nullish(),
    couponCode: z.string().trim().max(30).nullish(),
    notes: z.string().trim().max(500).nullish(),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish().or(z.literal("")),
    items: z.array(cartLineSchema).min(1, "السلة فارغة"),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillment === "delivery") {
      if (!value.zoneId) ctx.addIssue({ code: "custom", path: ["zoneId"], message: "اختاري منطقة التوصيل" });
      if (!value.address || value.address.length < 4)
        ctx.addIssue({ code: "custom", path: ["address"], message: "العنوان مطلوب للتوصيل" });
    }
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const trackSchema = z.object({
  orderNumber: z.string().trim().min(4, "رقم الطلب مطلوب"),
  phone: z.string().trim().refine(isValidPsPhone, "رقم الجوال غير صحيح"),
});
