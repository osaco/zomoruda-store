import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogView } from "@/features/catalog";
import { OccasionChips } from "@/features/catalog/components/OccasionChips";
import { getOccasionBySlug, getOccasions, parseCatalogParams, type CatalogSearchParams } from "@/features/catalog/server/queries";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const occasion = await getOccasionBySlug((await params).slug);
  return occasion ? { title: `هدايا ${occasion.nameAr}` } : {};
}

export default async function OccasionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [occasion, occasions] = await Promise.all([getOccasionBySlug(slug), getOccasions()]);
  if (!occasion || !occasion.isActive) notFound();
  const sp = await searchParams;
  return (
    <>
      <PageHeader title={`هدايا ${occasion.nameAr}`} crumbs={[{ href: "/occasions", label: "المناسبات" }]} />
      <OccasionChips occasions={occasions} activeSlug={slug} />
      <div className="container-page pb-6">
        <CatalogView query={{ ...parseCatalogParams(sp), occasionSlug: slug }} basePath={`/occasions/${slug}`} params={sp} />
      </div>
    </>
  );
}
