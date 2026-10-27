export const AVAILABILITY_VALUES = [
  "in_stock",
  "out_of_stock",
  "made_to_order",
] as const;
export type Availability = (typeof AVAILABILITY_VALUES)[number];
export const AVAILABILITY_LABELS_AR: Record<Availability, string> = {
  in_stock: "متوفر",
  out_of_stock: "غير متوفر",
  made_to_order: "يُصنع عند الطلب",
};

export const FULFILLMENT_VALUES = ["delivery", "pickup"] as const;
export type FulfillmentType = (typeof FULFILLMENT_VALUES)[number];
export const FULFILLMENT_LABELS_AR: Record<FulfillmentType, string> = {
  delivery: "توصيل",
  pickup: "استلام من المتجر",
};

export const PAYMENT_METHOD_VALUES = ["cash_on_delivery", "bank_transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];
export const PAYMENT_METHOD_LABELS_AR: Record<PaymentMethod, string> = {
  cash_on_delivery: "كاش عند الاستلام",
  bank_transfer: "تحويل بنكي/محفظة",
};

export const ORDER_STATUS_VALUES = [
  "new",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];
export const ORDER_STATUS_LABELS_AR: Record<OrderStatus, string> = {
  new: "جديد",
  confirmed: "مؤكّد",
  preparing: "قيد التجهيز",
  out_for_delivery: "خرج للتوصيل",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export const ADMIN_ROLE_VALUES = ["admin", "staff"] as const;
export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number];
export const ADMIN_ROLE_LABELS_AR: Record<AdminRole, string> = {
  admin: "مدير",
  staff: "موظف",
};

export const COUPON_TYPE_VALUES = ["percent", "fixed"] as const;
export type CouponType = (typeof COUPON_TYPE_VALUES)[number];
export const COUPON_TYPE_LABELS_AR: Record<CouponType, string> = {
  percent: "نسبة مئوية",
  fixed: "مبلغ ثابت",
};

export const TIME_SLOTS = [
  "الفترة الصباحية (10 ص - 2 م)",
  "الفترة المسائية (2 م - 6 م)",
  "الفترة الليلية (6 م - 9 م)",
] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];
