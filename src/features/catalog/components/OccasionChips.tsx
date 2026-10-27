import Link from "next/link";
import { Gift } from "lucide-react";
import { occasionChips } from "@/features/catalog/constants";

export function OccasionChips() {
  return (
    <section className="container-page pb-12 md:pb-16">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
          تسوّقي حسب المناسبة
        </h2>
      </div>
      <ul className="flex flex-wrap justify-center gap-3">
        {occasionChips.map((occasion) => (
          <li key={occasion.label}>
            <Link
              href={occasion.href}
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-surface px-5 py-2 text-sm font-medium text-ink transition duration-200 hover:border-accent hover:bg-accent/10"
            >
              <Gift className="h-4 w-4 text-accent" strokeWidth={1.75} aria-hidden="true" />
              {occasion.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
