import type { Customer } from "@/types/db";

export const VIP_THRESHOLD = 300;

export type Segment = "vip" | "loyal" | "new";
export const SEGMENT_LABELS_AR: Record<Segment, string> = { vip: "مميزة VIP", loyal: "دائمة", new: "جديدة" };

export function segmentOf(c: Pick<Customer, "ordersCount" | "totalSpent">): Segment {
  if (c.totalSpent >= VIP_THRESHOLD) return "vip";
  if (c.ordersCount >= 2) return "loyal";
  return "new";
}

/** Days until the next occurrence of a yyyy-mm-dd anniversary (0 = today). */
export function daysUntil(date: string, now = new Date()): number {
  const [, m, d] = date.split("-").map(Number);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let next = Date.UTC(now.getUTCFullYear(), m - 1, d);
  if (next < today) next = Date.UTC(now.getUTCFullYear() + 1, m - 1, d);
  return Math.round((next - today) / 86_400_000);
}

export type UpcomingDate = { customer: Customer; kind: "birthday" | "anniversary"; inDays: number };

/** Birthdays/anniversaries in the next `withinDays` days — for gift reminders on WhatsApp. */
export function upcomingDates(customers: Customer[], withinDays = 30, now = new Date()): UpcomingDate[] {
  const out: UpcomingDate[] = [];
  for (const customer of customers) {
    if (customer.birthday) {
      const inDays = daysUntil(customer.birthday, now);
      if (inDays <= withinDays) out.push({ customer, kind: "birthday", inDays });
    }
    if (customer.anniversary) {
      const inDays = daysUntil(customer.anniversary, now);
      if (inDays <= withinDays) out.push({ customer, kind: "anniversary", inDays });
    }
  }
  return out.sort((a, b) => a.inDays - b.inDays);
}
