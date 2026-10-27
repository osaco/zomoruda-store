import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/db";
import { Badge } from "@/components/ui/Badge";
import { discountPercent, formatPrice } from "@/lib/format";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const image = product.images[0];
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.availability === "out_of_stock";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-primary-light">
        {image && (
          <Image
            src={image.url}
            alt={image.altAr ?? product.nameAr}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute start-2 top-2 flex flex-col gap-1">
          {off && <Badge variant="sale">-{off}%</Badge>}
          {product.isNew && <Badge variant="new">جديد</Badge>}
          {soldOut && <Badge variant="danger">نفد</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-6 text-ink">{product.nameAr}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          {off && <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice!)}</span>}
        </div>
      </div>
    </Link>
  );
}
