import Link from "next/link";
import type { Occasion } from "@/types/db";
import { iconFor, occasionIcons } from "../constants";

export function OccasionChips({ occasions, activeSlug }: { occasions: Occasion[]; activeSlug?: string }) {
  return (
    <section className="container-page py-8">
      <h2 className="mb-5 text-center font-heading text-2xl font-bold text-ink md:text-3xl">تسوّقي حسب المناسبة</h2>
      <ul className="flex flex-wrap justify-center gap-3">
        {occasions.map((occasion) => {
          const Icon = iconFor(occasionIcons, occasion.icon);
          const active = occasion.slug === activeSlug;
          return (
            <li key={occasion.id}>
              <Link
                href={`/occasions/${occasion.slug}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition duration-200 ${
                  active ? "border-accent bg-accent text-white" : "border-accent/40 bg-surface text-ink hover:border-accent hover:bg-accent/10"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-accent"}`} strokeWidth={1.75} aria-hidden="true" />
                {occasion.nameAr}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
