import Link from "next/link";
import { ArrowLeft, MessageCircle, Sparkles } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

export function HeroSection() {
  return (
    <section className="bg-sparkle">
      <div className="container-page flex flex-col items-center gap-6 py-14 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-bold text-primary shadow-soft md:text-sm">
          <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} aria-hidden="true" />
          متجر هدايا • غزة - الرمال
        </span>

        <h1 className="max-w-2xl font-heading text-3xl font-bold leading-snug text-ink md:text-5xl">
          <span className="text-primary">{site.tagline}</span>
        </h1>

        <p className="max-w-xl text-sm leading-8 text-muted md:text-base">
          {site.descriptionAr}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/categories" className="btn-primary">
            تسوّقي الأقسام
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <a
            href={whatsappLink("مرحباً زُمُرّدة 👋 أرغب بالطلب مباشرة.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            اطلبي عبر واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
