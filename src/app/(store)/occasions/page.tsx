import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { OccasionChips } from "@/features/catalog/components/OccasionChips";
import { ProductShowcase } from "@/features/catalog/components/ProductShowcase";
import { getOccasions, listProducts } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "المناسبات" };
export const revalidate = 60;

export default async function OccasionsPage() {
  const occasions = await getOccasions();
  const sections = await Promise.all(
    occasions.map(async (o) => ({ occasion: o, products: (await listProducts({ occasionSlug: o.slug, perPage: 4, sort: "best_selling" })).items })),
  );
  return (
    <>
      <PageHeader title="المناسبات" description="هدايا مختارة لكل مناسبة" />
      <OccasionChips occasions={occasions} />
      {sections.map(({ occasion, products }) => (
        <ProductShowcase key={occasion.id} title={occasion.nameAr} href={`/occasions/${occasion.slug}`} products={products} />
      ))}
    </>
  );
}
