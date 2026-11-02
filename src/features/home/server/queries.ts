import "server-only";
import { cache } from "react";
import { getRepos } from "@/lib/data";
import type { Product } from "@/types/db";
import { selectFeaturedPieces } from "../lib/select-featured";

/**
 * Home-page reads. Data access goes through `getRepos()` only, so switching
 * from demo seed to Supabase is purely an environment concern.
 */

/** Occasions for the editorial index, active only, in store order. */
export const getHomeOccasions = cache(async () => {
  const occasions = await getRepos().occasions.list();
  return occasions
    .filter((o) => o.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
});

/**
 * The three "مختارات" pieces.
 *
 * Prefers the store's own `isFeatured` picks and tops up with newest /
 * best-selling stock so the editorial grid is never half-empty. See
 * `selectFeaturedPieces` for the exact rule.
 */
export const getFeaturedPieces = cache(async (): Promise<Product[]> => {
  const products = getRepos().products;
  const [featured, newest, bestSelling] = await Promise.all([
    products.featured(12),
    products.newest(12),
    products.list({ sort: "best_selling", perPage: 12 }),
  ]);
  return selectFeaturedPieces(featured, newest, bestSelling.items);
});
