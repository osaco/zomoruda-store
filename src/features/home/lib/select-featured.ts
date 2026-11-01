import type { Product } from "@/types/db";

export const FEATURED_LIMIT = 3;

/**
 * Picks the three products shown in the "مختارات" section.
 *
 * There is no dedicated "curated" flag in the schema, and this task must not
 * change the schema. So the rule is a pure, documented fallback chain:
 *
 *   1. products flagged `isFeatured` (the store's own editorial pick),
 *   2. topped up with the newest products,
 *   3. topped up with the best-selling ones.
 *
 * Products that are sold out still qualify — the card renders an "غير متوفر"
 * badge instead of hiding, so the grid keeps its shape.
 *
 * Pure function: no I/O, no React. Unit-tested in tests/home-selection.test.ts.
 */
export function selectFeaturedPieces(
  featured: Product[],
  newest: Product[],
  bestSelling: Product[],
  limit = FEATURED_LIMIT,
): Product[] {
  if (limit <= 0) return [];

  const picked: Product[] = [];
  const seen = new Set<string>();

  const push = (product: Product | undefined) => {
    if (!product || seen.has(product.id) || picked.length >= limit) return;
    seen.add(product.id);
    picked.push(product);
  };

  const onlyActive = (list: Product[]) => list.filter((p) => p.isActive);

  onlyActive(featured).forEach(push);
  onlyActive(newest).forEach(push);
  onlyActive(bestSelling).forEach(push);

  return picked;
}

/**
 * A product is orderable only when it is not explicitly out of stock.
 * `made_to_order` still counts as available (the store makes it on request).
 */
export function isPieceAvailable(product: Product): boolean {
  return product.availability !== "out_of_stock";
}
