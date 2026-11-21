import "server-only";
import { cache } from "react";
import { getRepos } from "@/lib/data";
import type { Product } from "@/types/db";
import { selectFeaturedPieces } from "../lib/select-featured";

// Public catalog reads only. Cache successful results briefly per warm Worker.
function publicHomeRead<T>(read: () => Promise<T>) {
  let last: { value: T; expires: number } | undefined;
  return cache(async () => {
    if (last && last.expires > Date.now()) return last.value;
    const value = await read();
    last = { value, expires: Date.now() + 60_000 };
    return value;
  });
}

/**
 * Home-page reads. Data access goes through `getRepos()` only, so switching
 * from demo seed to Supabase is purely an environment concern.
 */

/** Occasions for the editorial index, active only, in store order. */
export const getHomeOccasions = publicHomeRead(async () => {
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
export const getFeaturedPieces = publicHomeRead(async (): Promise<Product[]> => {
  const products = getRepos().products;
  const featured = await products.featured(3);
  if (featured.length === 3) return featured;
  return selectFeaturedPieces(featured, await products.newest(3), []);
});
