import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function OffersStrip() {
  return (
    <section className="container-page">
      <div className="flex flex-col items-center justify-between gap-3 rounded-card bg-primary-gradient px-6 py-6 text-center text-white md:flex-row md:py-7 md:text-start">
        <div>
          <h2 className="font-heading text-xl font-bold md:text-2xl">عروض ونُقَط مضيئة</h2>
          <p className="mt-1 text-sm text-white/85">
            وفّري على بوكسات المناسبات هذا الأسبوع — التوصيل لكل مناطق غزة.
          </p>
        </div>
        <Link
          href="/offers"
          className="btn shrink-0 bg-white text-primary hover:brightness-95"
        >
          شاهدِي العروض
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
