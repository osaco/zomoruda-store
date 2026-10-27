import { describe, expect, it } from "vitest";
import { daysUntil, segmentOf, upcomingDates } from "@/features/crm/lib/segments";
import type { Customer } from "@/types/db";

const c = (over: Partial<Customer>): Customer => ({ id: "1", name: "x", phone: "0599123456", birthday: null, anniversary: null, ordersCount: 0, totalSpent: 0, notes: null, createdAt: "", ...over });

describe("crm", () => {
  it("segments customers", () => {
    expect(segmentOf(c({ totalSpent: 400 }))).toBe("vip");
    expect(segmentOf(c({ ordersCount: 3, totalSpent: 100 }))).toBe("loyal");
    expect(segmentOf(c({ ordersCount: 1, totalSpent: 50 }))).toBe("new");
  });
  it("counts days to next anniversary, wrapping the year", () => {
    const now = new Date("2026-12-30T10:00:00Z");
    expect(daysUntil("1999-12-30", now)).toBe(0);
    expect(daysUntil("2001-01-02", now)).toBe(3);
  });
  it("lists upcoming birthdays sorted", () => {
    const now = new Date("2026-10-27T00:00:00Z");
    const list = upcomingDates([c({ id: "a", birthday: "2000-11-20" }), c({ id: "b", birthday: "1998-11-03" }), c({ id: "c", birthday: "1998-05-01" })], 30, now);
    expect(list.map((u) => u.customer.id)).toEqual(["b", "a"]);
  });
});
