import Link from "next/link";
import type { Product } from "@/types/db";
import { ProductGrid } from "./ProductGrid";

export function ProductShowcase({
  title,
  subtitle,
  href,
  products,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-page py-10 md:py-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-bold text-primary hover:underline">
            عرض الكل
          </Link>
        )}
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
