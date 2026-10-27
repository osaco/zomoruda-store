import Link from "next/link";
import type { Category } from "@/types/db";
import { categoryIcons, iconFor } from "../constants";

export function CategoryCircles({ categories, title = "تسوّقي حسب القسم" }: { categories: Category[]; title?: string }) {
  return (
    <section className="container-page py-10 md:py-14">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-muted">كل ما تحتاجينه لمناسبة جميلة في مكان واحد</p>
      </div>
      <ul className="grid grid-cols-4 gap-4 md:grid-cols-8">
        {categories.map((category) => {
          const Icon = iconFor(categoryIcons, category.slug);
          return (
            <li key={category.id}>
              <Link href={`/categories/${category.slug}`} className="group flex flex-col items-center gap-2 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary shadow-soft ring-1 ring-accent/20 transition duration-200 group-hover:bg-primary-light md:h-20 md:w-20">
                  <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-[11px] font-medium leading-tight text-ink/80 md:text-xs">{category.nameAr}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
