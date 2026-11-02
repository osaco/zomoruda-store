import { AlertCircle, Check } from "lucide-react";
import type { Order } from "@/types/db";
import { ORDER_STATUS_LABELS_AR, type OrderStatus } from "@/types/enums";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const FLOW: OrderStatus[] = ["new", "confirmed", "preparing", "out_for_delivery", "delivered"];

export function StatusTimeline({ order }: { order: Pick<Order, "status" | "statusHistory" | "fulfillment"> }) {
  if (order.status === "cancelled") {
    const cancelEntry = [...order.statusHistory].reverse().find((h) => h.status === "cancelled");
    return (
      <div className="rounded-input border border-danger/30 bg-danger/10 p-4 text-center space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-bold text-danger">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <span>تم إلغاء هذا الطلب</span>
        </p>
        {cancelEntry?.note && <p className="text-xs text-danger/80">السبب: {cancelEntry.note}</p>}
        {cancelEntry?.createdAt && (
          <p className="text-xs text-muted">تاريخ الإلغاء: {formatDate(cancelEntry.createdAt, true)}</p>
        )}
      </div>
    );
  }

  const flow = order.fulfillment === "pickup" ? FLOW.filter((s) => s !== "out_for_delivery") : FLOW;
  const currentIndex = flow.indexOf(order.status);

  return (
    <ol className="space-y-0" aria-label="تتبع مراحل الطلب">
      {flow.map((status, i) => {
        const isCurrent = i === currentIndex;
        const isDone = i <= currentIndex;
        const at = [...order.statusHistory].reverse().find((h) => h.status === status)?.createdAt;

        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition",
                  isDone
                    ? "border-primary bg-primary text-white"
                    : "border-primary/20 text-transparent",
                  isCurrent && "ring-4 ring-primary/20",
                )}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              {i < flow.length - 1 && (
                <span
                  className={cn(
                    "h-8 w-0.5",
                    i < currentIndex ? "bg-primary" : "bg-primary/15",
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-bold",
                  isCurrent ? "text-primary" : isDone ? "text-ink" : "text-muted",
                )}
              >
                {status === "delivered" && order.fulfillment === "pickup"
                  ? "تم الاستلام"
                  : ORDER_STATUS_LABELS_AR[status]}
                {isCurrent && <span className="ms-2 text-xs font-normal text-primary">(الحالية)</span>}
              </p>
              {at && <p className="text-xs text-muted">{formatDate(at, true)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
