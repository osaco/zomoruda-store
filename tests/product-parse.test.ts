import { describe, expect, it } from "vitest";
import { formatOptions, parseOptions, slugify } from "@/features/products-admin/lib/parse";

describe("product options text format", () => {
  it("parses required option with Arabic comma and deltas", () => {
    expect(parseOptions("الحجم*: وسط=0، كبير=30\nاللون: ذهبي, فضي=5")).toEqual([
      { nameAr: "الحجم", isRequired: true, values: [{ valueAr: "وسط", priceDelta: 0 }, { valueAr: "كبير", priceDelta: 30 }] },
      { nameAr: "اللون", isRequired: false, values: [{ valueAr: "ذهبي", priceDelta: 0 }, { valueAr: "فضي", priceDelta: 5 }] },
    ]);
  });
  it("round-trips", () => {
    const text = "الحجم*: وسط=0، كبير=30";
    expect(formatOptions(parseOptions(text))).toBe(text);
  });
  it("slugifies Arabic and Latin", () => {
    expect(slugify("Royal Gift Box!")).toBe("royal-gift-box");
    expect(slugify("بوكس ورد")).toBe("بوكس-ورد");
  });
});
