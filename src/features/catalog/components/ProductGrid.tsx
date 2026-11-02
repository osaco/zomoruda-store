import { PackageSearch } from "lucide-react";
import type { Product } from "@/types/db";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, emptyText = "لا توجد منتجات هنا بعد" }: { products: Product[]; emptyText?: string }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
        <PackageSearch className="h-12 w-12 text-primary/30" aria-hidden="true" />
        <p>{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
