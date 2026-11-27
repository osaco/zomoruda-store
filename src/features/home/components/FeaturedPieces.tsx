"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpLeft } from "lucide-react";
import type { Banner, Product } from "@/types/db";
import { formatPrice } from "@/lib/format";
import { getProductStorefrontImage } from "@/lib/storefront-images";
import { isPieceAvailable } from "../lib/select-featured";
import styles from "./HomeDesign.module.css";

export function FeaturedPieces({ products, banners }: { products: Product[]; banners: Banner[] }) {
  const slides = banners.length ? banners.map(banner => ({
    title: banner.titleAr,
    detail: banner.subtitleAr,
    image: { src: banner.imageUrl, alt: banner.titleAr },
    href: banner.linkUrl?.startsWith("/") && !banner.linkUrl.startsWith("//") && !banner.linkUrl.includes("\\") ? banner.linkUrl : null,
  })) : products.map(product => ({
    title: product.nameAr,
    detail: isPieceAvailable(product) ? formatPrice(product.price) : "غير متوفر حالياً",
    image: getProductStorefrontImage(product),
    href: `/product/${product.slug}`,
  }));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const slide = slides[index] ?? slides[0];
  const count = slides.length;

  useEffect(() => {
    if (!playing || count < 2) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!motion.matches && !document.hidden) setIndex(current => (current + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [count, playing]);

  if (!slide) return null;

  function step(direction: number) {
    setPlaying(false);
    setIndex(current => (current + direction + count) % count);
  }

  return (
    <section id="pieces" className={`wrap ${styles.galleryRegion}`} aria-labelledby="pieces-heading">
      <div className={styles.sectionHeading}>
        <h2 id="pieces-heading">معرض زمردة</h2>
        <Link className={styles.allProducts} href="/search">كل المنتجات <ArrowUpLeft size={17} aria-hidden /></Link>
      </div>
      <div className={styles.gallery} aria-roledescription="عارض منتجات">
        <div className={styles.galleryImage}>
          <Image src={slide.image.src} alt={slide.image.alt} fill sizes="(max-width: 720px) 92vw, 48vw" />
        </div>
        <div className={styles.galleryContent}>
          <div aria-live={playing ? "off" : "polite"} aria-atomic="true">
            <h3>{slide.title}</h3>
            {slide.detail && <p>{slide.detail}</p>}
            {slide.href && <Link href={slide.href} prefetch={false} className={styles.galleryLink}>
              تفاصيل الهدية <ArrowUpLeft size={17} aria-hidden />
            </Link>}
          </div>
          {count > 1 && (
            <div className={styles.controls}>
              <button type="button" onClick={() => step(-1)} aria-label="الهدية السابقة"><ArrowRight size={18} aria-hidden /></button>
              <button type="button" onClick={() => step(1)} aria-label="الهدية التالية"><ArrowLeft size={18} aria-hidden /></button>
              <span>{index + 1} / {count}</span>
              <button type="button" className={styles.playback} onClick={() => setPlaying(value => !value)} aria-label={playing ? "إيقاف العرض التلقائي" : "تشغيل العرض التلقائي"}>{playing ? "إيقاف" : "تشغيل"}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
