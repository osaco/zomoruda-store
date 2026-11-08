import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DisplayOnlyShowcase } from "@/features/catalog/components/DisplayOnlyShowcase";
import { getCategories } from "@/features/catalog/server/queries";
import { getCategoryStorefrontImage } from "@/lib/storefront-images";

export const metadata: Metadata = {
  title: "الأقسام",
  description: "تصفّحي أقسام متجر زمردة: بوكسات الهدايا، الورد، العطور، مستحضرات التجميل وأكثر.",
  alternates: { canonical: "/categories" },
};

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        title="الأقسام"
        description={categories.length > 0 ? "اختاري القسم وتصفّحي كل المنتجات" : "أفكار هدايا من زُمُرّدة — تواصلي معنا لمعرفة القطع المتوفرة"}
      />
      {categories.length > 0 ? (
        <div className="container-page grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => {
            const image = getCategoryStorefrontImage(c);
            return (
              <Link key={c.id} href={`/categories/${c.slug}`} className="card group overflow-hidden">
                <div className="relative aspect-[4/3] bg-primary-light">
                  <Image src={image.src} alt={image.alt} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="object-contain p-3 transition group-hover:scale-[1.02]" />
                </div>
                <div className="p-3">
                  <h2 className="font-heading font-bold text-ink">{c.nameAr}</h2>
                  {c.descriptionAr && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{c.descriptionAr}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <DisplayOnlyShowcase />
      )}
    </>
  );
}
