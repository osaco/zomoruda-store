import "server-only";
import { cache } from "react";
import { getRepos } from "@/lib/data";
import type { ProductQuery, ProductSort } from "@/lib/data/repositories";
import { PER_PAGE, SORT_OPTIONS } from "../constants";

/** Request-scoped memoized reads (React cache dedupes calls within one render). */
export const getCategories = cache(() => getRepos().categories.list());
export const getOccasions = cache(() => getRepos().occasions.list());
export const getCategoryBySlug = cache((slug: string) => getRepos().categories.getBySlug(slug));
export const getOccasionBySlug = cache((slug: string) => getRepos().occasions.getBySlug(slug));
export const getProductBySlug = cache((slug: string) => getRepos().products.getBySlug(slug));
export const getActiveBanners = cache(async () => {
  const now = new Date().toISOString();
  const banners = await getRepos().banners.list();
  return banners.filter((b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now));
});

export type CatalogSearchParams = { sort?: string; page?: string; min?: string; max?: string; q?: string; avail?: string };

/** Parses URL search params into a safe ProductQuery. */
export function parseCatalogParams(params: CatalogSearchParams): ProductQuery {
  const sort = SORT_OPTIONS.some((o) => o.value === params.sort) ? (params.sort as ProductSort) : "newest";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const min = Number(params.min);
  const max = Number(params.max);
  return {
    sort,
    page,
    perPage: PER_PAGE,
    minPrice: Number.isFinite(min) && params.min ? min : undefined,
    maxPrice: Number.isFinite(max) && params.max ? max : undefined,
    availability: params.avail === "in_stock" ? "in_stock" : undefined,
    search: params.q?.trim() || undefined,
  };
}

export function listProducts(query: ProductQuery) {
  return getRepos().products.list(query);
}
