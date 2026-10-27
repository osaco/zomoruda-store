import { Check } from "lucide-react";
import type { Order } from "@/types/db";
import { ORDER_STATUS_LABELS_AR, type OrderStatus } from "@/types/enums";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const FLOW: OrderStatus[] = ["new", "confirmed", "preparing", "out_for_delivery", "delivered"];

export function StatusTimeline({ order }: { order: Pick<Order, "status" | "statusHistory" | "fulfillment"> }) {
  if (order.status === "cancelled")
    return <p className="rounded-input bg-danger/10 p-4 text-center font-bold text-danger">تم إلغاء الطلب</p>;
  const flow = order.fulfillment === "pickup" ? FLOW.filter((s) => s !== "out_for_delivery") : FLOW;
  const currentIndex = flow.indexOf(order.status);
  return (
    <ol className="space-y-0">
      {flow.map((status, i) => {
        const done = i <= currentIndex;
        const at = [...order.statusHistory].reverse().find((h) => h.status === status)?.createdAt;
        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2", done ? "border-primary bg-primary text-white" : "border-primary/20 text-transparent")}>
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              {i < flow.length - 1 && <span className={cn("h-8 w-0.5", i < currentIndex ? "bg-primary" : "bg-primary/15")} />}
            </div>
            <div className="pt-1">
              <p className={cn("text-sm font-bold", done ? "text-ink" : "text-muted")}>
                {status === "delivered" && order.fulfillment === "pickup" ? "تم الاستلام" : ORDER_STATUS_LABELS_AR[status]}
              </p>
              {at && <p className="text-xs text-muted">{formatDate(at, true)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
