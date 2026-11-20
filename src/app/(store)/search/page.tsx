import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/features/catalog";
import { SearchBox } from "@/features/catalog/components/SearchBox";
import { parseCatalogParams, type CatalogSearchParams } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "بحث" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const sp = await searchParams;
  const query = parseCatalogParams(sp);
  return (
    <div className="container-page space-y-6 py-6">
      <h1 className="font-heading text-2xl font-bold">تصفّحي المنتجات</h1>
      <Suspense>
        <SearchBox />
      </Suspense>
      <CatalogView
        query={query}
        basePath="/search"
        params={{ ...sp, q: query.search }}
        emptyText={query.search ? `لا نتائج لـ «${query.search}» — جرّبي كلمة أخرى أو اسألينا على واتساب` : undefined}
      />
    </div>
  );
}
