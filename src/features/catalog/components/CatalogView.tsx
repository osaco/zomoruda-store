import { Suspense } from "react";
import { Pagination } from "@/components/ui/Pagination";
import type { ProductQuery } from "@/lib/data/repositories";
import { listProducts, type CatalogSearchParams } from "../server/queries";
import { CatalogToolbar } from "./CatalogToolbar";
import { ProductGrid } from "./ProductGrid";

/** Shared listing used by category, occasion, offers and search pages. */
export async function CatalogView({
  query,
  basePath,
  params,
  emptyText,
}: {
  query: ProductQuery;
  basePath: string;
  params: CatalogSearchParams;
  emptyText?: string;
}) {
  const result = await listProducts(query);
  return (
    <>
      <Suspense>
        <CatalogToolbar total={result.total} />
      </Suspense>
      <ProductGrid products={result.items} emptyText={emptyText} />
      <Pagination page={result.page} pageCount={result.pageCount} basePath={basePath} params={params} />
    </>
  );
}
