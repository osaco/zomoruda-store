import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/db";
import { formatPrice } from "@/lib/format";
import { Reveal } from "./Reveal";
import { isPieceAvailable } from "../lib/select-featured";
import { arabicIndex, homeCopy } from "../constants";

/** Unequal vertical offsets per column, mirroring the approved mockup. */
const OFFSETS = ["lg:mt-0", "lg:mt-[72px]", "lg:mt-[24px]"] as const;

/**
 * Three curated pieces on a 12-column grid with deliberately uneven offsets
 * (0 / 72px / 24px) from lg up, stacking to one column on smaller screens.
 *
 * Product art is 4:5 with 20px corners. Prices come from `lib/format` so the
 * shekel formatting stays in one place.
 */
export function FeaturedPieces({ products }: { products: Product[] }) {
  return (
    <section id="pieces" className="wrap pt-24 sm:pt-32" aria-labelledby="pieces-heading">
      <Reveal>
        <div className="sec-h">
          <h2 id="pieces-heading" className="text-sm font-normal">
            {`${arabicIndex(2)} — ${homeCopy.pieces.index}`}
          </h2>
          <Link
            href="/search"
            className="focus-gold inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-plum"
          >
            {homeCopy.pieces.all} ←
          </Link>
        </div>
      </Reveal>

      {products.length === 0 ? (
        <p className="mt-10 max-w-[40ch] text-muted">{homeCopy.pieces.empty}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-[clamp(16px,3vw,40px)] sm:mt-12 lg:grid-cols-12">
          {products.map((product, i) => (
            <Reveal
              key={product.id}
              delay={i * 90}
              className={`lg:col-span-4 ${OFFSETS[i] ?? "lg:mt-0"}`}
            >
              {/* Never `priority`: these sit far below the fold, and eager
                  loading here steals bandwidth from the hero's LCP text. */}
              <PieceCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function PieceCard({ product }: { product: Product }) {
  const image = product.images[0];
  const available = isPieceAvailable(product);

  return (
    <article data-testid="featured-piece" className="group">
      <Link
        href={`/product/${product.slug}`}
        className="focus-gold block rounded-[20px]"
        aria-label={product.nameAr}
      >
        <div
          data-testid="piece-art"
          className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-primary-light"
        >
          {image ? (
            <Image
              src={image.url}
              alt={image.altAr ?? product.nameAr}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
            />
          ) : null}
          {!available && (
            <span className="absolute bottom-3 start-3 rounded-full bg-deep/90 px-3 py-1 text-xs text-on-deep">
              {homeCopy.pieces.unavailable}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[22px] font-semibold leading-snug">
            {product.nameAr}
          </h3>
          <span className="shrink-0 text-sm text-muted">{formatPrice(product.price)}</span>
        </div>
      </Link>
      <p className="mt-1 text-sm text-muted">{product.descriptionAr}</p>
    </article>
  );
}
