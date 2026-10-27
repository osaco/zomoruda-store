import Link from "next/link";
import { categoryCircles } from "@/features/catalog/constants";

export function CategoryCircles() {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
          تسوّقي حسب القسم
        </h2>
        <p className="mt-2 text-sm text-muted">كل ما تحتاجينه لمناسبة جميلة في مكان واحد</p>
      </div>

      <ul className="grid grid-cols-4 gap-4 md:grid-cols-8">
        {categoryCircles.map((category) => {
          const Icon = category.icon;
          return (
            <li key={category.label}>
              <Link
                href={category.href}
                className="group flex flex-col items-center gap-2 text-center focus-visible:rounded-card"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary shadow-soft transition duration-200 group-hover:bg-primary-light md:h-20 md:w-20">
                  <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-[11px] font-medium leading-tight text-ink/80 md:text-xs">
                  {category.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
