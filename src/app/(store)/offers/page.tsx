import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogView } from "@/features/catalog";
import { parseCatalogParams, type CatalogSearchParams } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "العروض" };

export default async function OffersPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const sp = await searchParams;
  const onSaleOnly = sp.sort !== "best_selling";
  return (
    <>
      <PageHeader title={onSaleOnly ? "العروض والخصومات" : "الأكثر مبيعاً"} description="أسعار مميزة لفترة محدودة" />
      <div className="container-page py-6">
        <CatalogView query={{ ...parseCatalogParams(sp), onSale: onSaleOnly || undefined }} basePath="/offers" params={sp} emptyText="لا توجد عروض حالياً، تابعينا على إنستغرام" />
      </div>
    </>
  );
}
