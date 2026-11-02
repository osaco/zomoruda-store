import { describe, expect, it } from "vitest";
import { arabicIndex, arabicNumber, homeCopy } from "@/features/home/constants";
import {
  FEATURED_LIMIT,
  isPieceAvailable,
  selectFeaturedPieces,
} from "@/features/home/lib/select-featured";
import type { Product } from "@/types/db";

const product = (over: Partial<Product> & { id: string }): Product => ({
  nameAr: `منتج ${over.id}`,
  slug: over.id,
  descriptionAr: "وصف",
  price: 10,
  compareAtPrice: null,
  categoryId: "cat-1",
  stockQty: 5,
  availability: "in_stock",
  isFeatured: false,
  isNew: false,
  isActive: true,
  allowName: false,
  allowCardMessage: false,
  allowPhotoUpload: false,
  images: [],
  options: [],
  occasionIds: [],
  soldCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

describe("arabicIndex", () => {
  it("pads to two Arabic-Indic digits", () => {
    expect(arabicIndex(1)).toBe("٠١");
    expect(arabicIndex(2)).toBe("٠٢");
    expect(arabicIndex(5)).toBe("٠٥");
  });

  it("handles two-digit numbers", () => {
    expect(arabicIndex(10)).toBe("١٠");
    expect(arabicIndex(12)).toBe("١٢");
    expect(arabicIndex(99)).toBe("٩٩");
  });

  it("falls back to ٠١ for invalid input", () => {
    expect(arabicIndex(0)).toBe("٠١");
    expect(arabicIndex(-4)).toBe("٠١");
    expect(arabicIndex(Number.NaN)).toBe("٠١");
    expect(arabicIndex(Number.POSITIVE_INFINITY)).toBe("٠١");
  });
});

describe("arabicNumber", () => {
  it("converts without padding", () => {
    expect(arabicNumber(0)).toBe("٠");
    expect(arabicNumber(1)).toBe("١");
    expect(arabicNumber(3)).toBe("٣");
    expect(arabicNumber(11)).toBe("١١");
  });
});

describe("selectFeaturedPieces", () => {
  it("prefers featured products, in order", () => {
    const result = selectFeaturedPieces(
      [product({ id: "a", isFeatured: true }), product({ id: "b", isFeatured: true })],
      [product({ id: "c" })],
      [],
    );
    expect(result.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("tops up from newest then best-selling", () => {
    const result = selectFeaturedPieces(
      [product({ id: "a", isFeatured: true })],
      [product({ id: "b" })],
      [product({ id: "c" })],
    );
    expect(result.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("never returns duplicates", () => {
    const shared = product({ id: "same", isFeatured: true });
    const result = selectFeaturedPieces([shared], [shared], [shared]);
    expect(result).toHaveLength(1);
  });

  it("caps at the limit", () => {
    const many = Array.from({ length: 10 }, (_, i) => product({ id: `p${i}` }));
    expect(selectFeaturedPieces(many, many, many)).toHaveLength(FEATURED_LIMIT);
  });

  it("skips inactive products", () => {
    const result = selectFeaturedPieces(
      [product({ id: "off", isActive: false })],
      [product({ id: "on" })],
      [],
    );
    expect(result.map((p) => p.id)).toEqual(["on"]);
  });

  it("keeps sold-out products so the grid keeps its shape", () => {
    const result = selectFeaturedPieces(
      [product({ id: "sold", availability: "out_of_stock" })],
      [],
      [],
    );
    expect(result.map((p) => p.id)).toEqual(["sold"]);
  });

  it("returns an empty list when there is no stock", () => {
    expect(selectFeaturedPieces([], [], [])).toEqual([]);
  });

  it("returns nothing for a non-positive limit", () => {
    expect(selectFeaturedPieces([product({ id: "a" })], [], [], 0)).toEqual([]);
  });
});

describe("isPieceAvailable", () => {
  it("treats made_to_order as available", () => {
    expect(isPieceAvailable(product({ id: "a", availability: "made_to_order" }))).toBe(true);
  });

  it("treats out_of_stock as unavailable", () => {
    expect(isPieceAvailable(product({ id: "a", availability: "out_of_stock" }))).toBe(false);
  });
});

describe("homeCopy", () => {
  it("keeps the warm, specific store voice", () => {
    expect(homeCopy.hero.lead).toContain("تُشبه من تُهديها");
    expect(homeCopy.statement.emphasis).toBe("كلمة طيبة");
  });

  it("describes exactly three steps", () => {
    expect(homeCopy.steps.items).toHaveLength(3);
  });
});
