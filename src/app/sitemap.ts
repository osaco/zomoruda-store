import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getRepos } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const repos = getRepos();
  const [categories, occasions, products] = await Promise.all([
    repos.categories.list(),
    repos.occasions.list(),
    repos.products.list({ perPage: 1000 }),
  ]);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...["/categories", "/occasions", "/offers", "/contact"].map((p) => ({ url: `${base}${p}` })),
    ...categories.map((c) => ({ url: `${base}/categories/${c.slug}` })),
    ...occasions.map((o) => ({ url: `${base}/occasions/${o.slug}` })),
    ...products.items.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.createdAt })),
  ];
}
