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
export const getProductBySlug = cache(async (slug: string) => {
  // Some adapters pass percent-encoded dynamic segments to the page.
  const decoded = /%[a-f0-9]{2}/i.test(slug) ? safelyDecodeSlug(slug) : slug;
  return getRepos().products.getBySlug(decoded);
});

function safelyDecodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
export const getActiveBanners = cache(async () => {
  const now = new Date().toISOString();
  const banners = await getRepos().banners.list();
  return banners.filter((b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now));
});

type CatalogParam = "sort" | "page" | "min" | "max" | "q" | "avail";
export type CatalogSearchParams = Partial<Record<CatalogParam, string | string[]>>;

/** Parses URL search params into a safe ProductQuery. */
export function parseCatalogParams(params: CatalogSearchParams): ProductQuery {
  const first = (key: CatalogParam) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const requestedSort = first("sort");
  const sort = SORT_OPTIONS.some((o) => o.value === requestedSort) ? (requestedSort as ProductSort) : "newest";
  const requestedPage = Number(first("page"));
  // Bound the offset to PostgreSQL's signed integer range.
  const maxPage = Math.floor(2_147_483_647 / PER_PAGE);
  const page = Number.isSafeInteger(requestedPage) ? Math.min(maxPage, Math.max(1, requestedPage)) : 1;
  const min = Number(first("min") || NaN);
  const max = Number(first("max") || NaN);
  return {
    sort,
    page,
    perPage: PER_PAGE,
    minPrice: Number.isFinite(min) ? min : undefined,
    maxPrice: Number.isFinite(max) ? max : undefined,
    availability: first("avail") === "in_stock" ? "in_stock" : undefined,
    search: first("q")?.trim().slice(0, 120) || undefined,
  };
}

export function listProducts(query: ProductQuery) {
  return getRepos().products.list(query);
}
