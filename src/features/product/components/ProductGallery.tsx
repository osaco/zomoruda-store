"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/types/db";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const goTo = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: -i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={track}
          onScroll={(e) => setActive(Math.round(Math.abs(e.currentTarget.scrollLeft) / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-card bg-primary-light [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, i) => (
            <button key={image.id} type="button" onClick={() => setZoom(true)} className="relative aspect-square min-w-full snap-center" aria-label="تكبير الصورة">
              <Image src={image.url} alt={image.altAr ?? name} fill priority={i === 0} sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </button>
          ))}
        </div>
        <ZoomIn className="pointer-events-none absolute bottom-3 end-3 h-8 w-8 rounded-full bg-white/80 p-1.5 text-primary" aria-hidden="true" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`الصورة ${i + 1}`}
              className={cn("relative h-16 w-16 overflow-hidden rounded-image border-2", i === active ? "border-primary" : "border-transparent")}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {zoom && images[active] && (
        <div role="dialog" aria-modal="true" aria-label="الصورة مكبّرة" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4" onClick={() => setZoom(false)}>
          <button type="button" aria-label="إغلاق" className="absolute end-4 top-4 rounded-full bg-white/10 p-2 text-white">
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl touch-pinch-zoom">
            <Image src={images[active].url} alt={name} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
