import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCategories } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "الأقسام" };
export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader title="الأقسام" description="اختاري القسم وتصفّحي كل المنتجات" />
      <div className="container-page grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
        {categories.map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="card group overflow-hidden">
            <div className="relative aspect-[4/3] bg-primary-light">
              {c.imageUrl && <Image src={c.imageUrl} alt={c.nameAr} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition group-hover:scale-105" />}
            </div>
            <div className="p-3">
              <h2 className="font-heading font-bold text-ink">{c.nameAr}</h2>
              {c.descriptionAr && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{c.descriptionAr}</p>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
