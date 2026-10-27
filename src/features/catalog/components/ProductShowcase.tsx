import Link from "next/link";
import { ProductPlaceholderCard } from "@/features/catalog/components/ProductPlaceholderCard";

export function ProductShowcase({
  title,
  subtitle,
  href,
  count = 4,
}: {
  title: string;
  subtitle: string;
  href?: string;
  count?: number;
}) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        {href ? (
          <Link
            href={href}
            className="hidden text-sm font-bold text-primary hover:underline md:inline"
          >
            عرض الكل
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <ProductPlaceholderCard key={`${title}-${index}`} title={title} />
        ))}
      </div>
    </section>
  );
}
