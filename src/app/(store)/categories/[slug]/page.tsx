import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogView } from "@/features/catalog";
import { getCategoryBySlug, parseCatalogParams, type CatalogSearchParams } from "@/features/catalog/server/queries";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return category ? { title: category.nameAr, description: category.descriptionAr ?? undefined } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.isActive) notFound();
  const sp = await searchParams;
  return (
    <>
      <PageHeader title={category.nameAr} description={category.descriptionAr} crumbs={[{ href: "/categories", label: "الأقسام" }]} />
      <div className="container-page py-6">
        <CatalogView query={{ ...parseCatalogParams(sp), categorySlug: slug }} basePath={`/categories/${slug}`} params={sp} />
      </div>
    </>
  );
}
