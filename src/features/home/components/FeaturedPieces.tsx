"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpLeft } from "lucide-react";
import type { Product } from "@/types/db";
import { formatPrice } from "@/lib/format";
import { getProductStorefrontImage } from "@/lib/storefront-images";
import { isPieceAvailable } from "../lib/select-featured";
import styles from "./HomeDesign.module.css";

export function FeaturedPieces({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const product = products[index] ?? products[0];
  if (!product) return null;
  const image = getProductStorefrontImage(product);

  function step(direction: number) {
    setIndex(current => (current + direction + products.length) % products.length);
  }

  return (
    <section id="pieces" className={`wrap ${styles.galleryRegion}`} aria-labelledby="pieces-heading">
      <div className={styles.sectionHeading}>
        <h2 id="pieces-heading">معرض زمردة</h2>
        <Link className={styles.allProducts} href="/search">كل المنتجات <ArrowUpLeft size={17} aria-hidden /></Link>
      </div>
      <div className={styles.gallery} aria-roledescription="عارض منتجات">
        <Link href={`/product/${product.slug}`} className={styles.galleryImage} aria-label={product.nameAr}>
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 720px) 92vw, 48vw" />
        </Link>
        <div className={styles.galleryContent}>
          <div aria-live="polite" aria-atomic="true">
            <h3>{product.nameAr}</h3>
            <p>{isPieceAvailable(product) ? formatPrice(product.price) : "غير متوفر حالياً"}</p>
            <Link href={`/product/${product.slug}`} className={styles.galleryLink}>
              تفاصيل الهدية <ArrowUpLeft size={17} aria-hidden />
            </Link>
          </div>
          {products.length > 1 && (
            <div className={styles.controls}>
              <button type="button" onClick={() => step(-1)} aria-label="الهدية السابقة"><ArrowRight size={18} aria-hidden /></button>
              <button type="button" onClick={() => step(1)} aria-label="الهدية التالية"><ArrowLeft size={18} aria-hidden /></button>
              <span>{index + 1} / {products.length}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
