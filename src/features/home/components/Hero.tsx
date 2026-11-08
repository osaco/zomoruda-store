import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, MessageCircle } from "lucide-react";
import type { Product } from "@/types/db";
import { formatPrice } from "@/lib/format";
import { getProductStorefrontImage } from "@/lib/storefront-images";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/site";
import { homeCopy } from "../constants";
import { AtelierButterfly } from "./AtelierButterfly";

/** A compact storefront hero built around the real brand mark and a real product. */
export function Hero({
  addressAr,
  featuredProduct,
}: {
  addressAr: string;
  featuredProduct?: Product;
}) {
  // The demo catalogue uses a text-only placeholder image. It is useful in
  // admin previews but looks unfinished in a public store hero, so render the
  // branded gift visual until a real product photo is available.
  const hasStorePhoto = Boolean(featuredProduct?.images.some((image) => !image.url.includes("placehold.co")));
  const displayImage = featuredProduct ? getProductStorefrontImage(featuredProduct) : null;

  return (
    <section
      data-testid="hero"
      className="relative overflow-hidden bg-deep pb-10 pt-24 text-on-deep sm:pb-14 sm:pt-28 lg:pt-32"
    >
      <div className="wrap grid items-center gap-9 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
        <div className="min-w-0">
          <div className="mb-7 flex items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/50 bg-primary shadow-[0_0_0_4px_rgba(255,255,255,.08)]">
              <Image src="/logo.png" alt="" fill sizes="48px" className="object-cover" priority />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">زُمُرّدة</p>
              <p className="mt-0.5 text-xs text-on-deep/65">هدايا وتفاصيل تحكي عنك</p>
            </div>
          </div>

          <p className="flex items-center gap-2 text-sm text-[#e6c878]">
            <span aria-hidden="true" className="h-px w-7 bg-[#c9a24a]" />
            {addressAr}
          </p>
          <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(42px,6vw,76px)] font-bold leading-[1.22] tracking-tight">
            هديّةٌ <span className="text-[#e6c878]">تُشبه</span> من تُهديها
          </h1>
          <p className="mt-4 max-w-[42ch] text-base leading-8 text-on-deep/80 sm:text-lg">
            بوكسات، عطور، إكسسوارات وتفاصيل لطيفة؛ اختاري ما يفرحهم، ونحن نرتّبه بعناية.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/categories"
              className="focus-gold inline-flex min-h-12 items-center gap-3 rounded-full bg-[#c9a24a] px-6 font-semibold text-deep transition-colors hover:bg-[#dfbd68]"
            >
              تصفّحي الأقسام <ArrowLeft aria-hidden="true" size={17} />
            </Link>
            <a
              href={whatsappLink(defaultWhatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-gold inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 px-5 text-sm text-white transition-colors hover:bg-white/10"
            >
              <MessageCircle aria-hidden="true" size={17} /> اسألي عبر واتساب
            </a>
          </div>

          <p className="mt-5 text-xs text-on-deep/55">{homeCopy.hero.note}</p>
        </div>

        <div className="relative mx-auto w-full max-w-[580px] lg:me-0">
          <AtelierButterfly className="pointer-events-none absolute -top-8 start-4 z-10 w-20 drop-shadow-[0_8px_16px_rgba(0,0,0,.28)] sm:-top-10 sm:start-8 sm:w-24" />
          <div className="relative aspect-[1.18/1] overflow-hidden rounded-[24px] border border-white/15 bg-primary/70 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:aspect-[1.25/1]">
            {hasStorePhoto && featuredProduct ? (
              <Link
                href={`/product/${featuredProduct.slug}`}
                className="group absolute inset-0 focus-gold"
                aria-label={`تصفّح ${featuredProduct.nameAr}`}
              >
                <Image
                  src={displayImage!.src}
                  alt={displayImage!.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep/85 via-deep/5 to-deep/10" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
                  <span>
                    <span className="mb-1 block text-xs text-white/70">من اختيارات زُمُرّدة</span>
                    <span className="block font-display text-xl font-semibold sm:text-2xl">{featuredProduct.nameAr}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-deep">
                    {formatPrice(featuredProduct.price)} <ArrowUpLeft aria-hidden="true" size={15} />
                  </span>
                </span>
              </Link>
            ) : (
              <Link href="/categories" className="group absolute inset-0 focus-gold" aria-label="تصفّحي بوكسات الهدايا">
                <Image src="/showcase/gift-box.svg" alt="بوكس هدية من زُمُرّدة" fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-deep/10" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
                  <span>
                    <span className="mb-1 block text-xs text-white/70">اختاري الهدية التي تشبه المناسبة</span>
                    <span className="block font-display text-xl font-semibold sm:text-2xl">بوكسات وهدايا مرتّبة</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-deep">
                    اكتشفي <ArrowUpLeft aria-hidden="true" size={15} />
                  </span>
                </span>
              </Link>
            )}
          </div>
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-3 -end-3 -z-0 h-20 w-20 rounded-full border border-[#c9a24a]/45 sm:-bottom-5 sm:-end-5 sm:h-28 sm:w-28" />
        </div>
      </div>
    </section>
  );
}
