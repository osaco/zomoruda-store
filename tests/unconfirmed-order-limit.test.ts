import { describe, expect, it } from "vitest";
import { canPlaceUnconfirmedOrder, MAX_UNCONFIRMED_ORDERS_PER_PHONE } from "@/features/checkout/lib/unconfirmed-order-limit";

describe("unconfirmed order limit", () => {
  it("allows fewer than two current unconfirmed orders", () => {
    expect(canPlaceUnconfirmedOrder(0)).toBe(true);
    expect(canPlaceUnconfirmedOrder(1)).toBe(true);
  });

  it("caps unconfirmed orders per phone at two", () => {
    expect(MAX_UNCONFIRMED_ORDERS_PER_PHONE).toBe(2);
    expect(canPlaceUnconfirmedOrder(2)).toBe(false);
    expect(canPlaceUnconfirmedOrder(3)).toBe(false);
  });

  it("rejects invalid counts", () => {
    expect(canPlaceUnconfirmedOrder(-1)).toBe(false);
    expect(canPlaceUnconfirmedOrder(1.5)).toBe(false);
  });
});
