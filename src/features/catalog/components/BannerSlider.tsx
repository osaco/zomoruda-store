"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Banner } from "@/types/db";

/** Lightweight CSS scroll-snap slider (swipe on mobile, auto-advance, no library). */
export function BannerSlider({ banners }: { banners: Banner[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = track.current;
      if (!el) return;
      const next = (index + 1) % banners.length;
      const slide = el.children.item(next);
      if (slide instanceof HTMLElement) slide.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [index, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="container-page pt-4" aria-roledescription="carousel" aria-label="العروض">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          const center = el.getBoundingClientRect().left + el.clientWidth / 2;
          let nearest = 0;
          let distance = Number.POSITIVE_INFINITY;
          Array.from(el.children).forEach((child, slideIndex) => {
            const rect = child.getBoundingClientRect();
            const nextDistance = Math.abs(rect.left + rect.width / 2 - center);
            if (nextDistance < distance) { nearest = slideIndex; distance = nextDistance; }
          });
          setIndex(nearest);
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, i) => {
          const content = (
            <div className="relative aspect-[12/5] w-full min-w-full snap-center overflow-hidden bg-primary">
              <Image src={banner.imageUrl} alt={banner.titleAr} fill priority={i === 0} sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/60 to-transparent p-5 text-white md:p-10">
                <h2 className="font-heading text-xl font-bold md:text-4xl">{banner.titleAr}</h2>
                {banner.subtitleAr && <p className="mt-1 text-sm text-white/90 md:text-lg">{banner.subtitleAr}</p>}
              </div>
            </div>
          );
          return banner.linkUrl ? (
            <Link key={banner.id} href={banner.linkUrl} className="min-w-full" aria-label={banner.titleAr}>
              {content}
            </Link>
          ) : (
            <div key={banner.id} className="min-w-full">{content}</div>
          );
        })}
      </div>
      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <span key={b.id} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-primary/25"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
