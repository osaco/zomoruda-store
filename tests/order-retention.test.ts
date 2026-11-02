import { describe, expect, it } from "vitest";
import { unconfirmedOrderAgeLabel } from "@/features/orders/lib/order-retention";

describe("unconfirmed order age label", () => {
  const now = new Date("2026-11-02T12:00:00.000Z");

  it("does not warn before two hours", () => {
    expect(unconfirmedOrderAgeLabel("2026-11-02T10:01:00.000Z", now)).toBeNull();
  });

  it("shows the age in hours and days after two hours", () => {
    expect(unconfirmedOrderAgeLabel("2026-11-02T09:30:00.000Z", now)).toBe("منذ 2 ساعة");
    expect(unconfirmedOrderAgeLabel("2026-10-30T10:00:00.000Z", now)).toBe("منذ 3 يوم");
  });

  it("ignores invalid dates", () => {
    expect(unconfirmedOrderAgeLabel("invalid", now)).toBeNull();
  });
});
