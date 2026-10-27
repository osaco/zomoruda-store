import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ORDER_STATUS_LABELS_AR, type OrderStatus } from "@/types/enums";

const VARIANT: Record<OrderStatus, BadgeVariant> = {
  new: "gold",
  confirmed: "neutral",
  preparing: "warning",
  out_for_delivery: "new",
  delivered: "success",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT[status]}>{ORDER_STATUS_LABELS_AR[status]}</Badge>;
}
