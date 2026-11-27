import { updateOrderStatus } from "../server/admin-actions";
import type { Order } from "@/types/db";

const next = {
  new: ["confirmed", "تأكيد الطلب"],
  confirmed: ["preparing", "بدء التجهيز"],
  preparing: ["out_for_delivery", "إرسال للتوصيل"],
  out_for_delivery: ["delivered", "تأكيد التسليم"],
} as const;

export function AdvanceOrder({ order }: { order: Pick<Order, "id" | "status" | "fulfillment"> }) {
  if (order.status === "delivered" || order.status === "cancelled") return null;
  const [status, label] = next[order.status];
  return <form action={updateOrderStatus} className="mt-2">
    <input type="hidden" name="id" value={order.id} />
    <input type="hidden" name="expected" value={order.status} />
    <button name="status" value={status} className="btn-primary whitespace-nowrap !px-3 !py-2 text-xs">
      {order.fulfillment === "pickup" && status === "out_for_delivery" ? "جاهز للاستلام" : label}
    </button>
  </form>;
}
