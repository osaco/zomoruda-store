import type { Order } from "@/types/db";

export const ORDER_ARCHIVE_AFTER_DAYS = 60;
export const UNCONFIRMED_ORDER_WARNING_AFTER_HOURS = 2;

export function orderArchiveCutoff(now = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - ORDER_ARCHIVE_AFTER_DAYS);
  return cutoff.toISOString();
}

export function isArchivedOrder(order: Pick<Order, "createdAt" | "status">, now = new Date()): boolean {
  return (order.status === "delivered" || order.status === "cancelled") &&
    order.createdAt < orderArchiveCutoff(now);
}

export function unconfirmedOrderAgeLabel(createdAt: string, now = new Date()): string | null {
  const ageHours = (now.getTime() - new Date(createdAt).getTime()) / 3_600_000;
  if (!Number.isFinite(ageHours) || ageHours < UNCONFIRMED_ORDER_WARNING_AFTER_HOURS) return null;
  const roundedHours = Math.floor(ageHours);
  return roundedHours < 24 ? `منذ ${roundedHours} ساعة` : `منذ ${Math.floor(roundedHours / 24)} يوم`;
}
