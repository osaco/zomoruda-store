import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  Flower2,
  Gem,
  Gift,
  HeartHandshake,
  Instagram,
  MapPin,
  MessageCircle,
  Clock,
  Palette,
  ShoppingBag,
  Sparkles,
  SprayCan,
} from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

const categories = [
  { label: "بوكسات هدايا", href: "/categories", icon: Gift },
  { label: "ورد", href: "/categories", icon: Flower2 },
  { label: "عطور", href: "/categories", icon: SprayCan },
  { label: "مكياج", href: "/categories", icon: Palette },
  { label: "أكواب", href: "/categories", icon: Coffee },
  { label: "إكسسوارات", href: "/categories", icon: Gem },
  { label: "حقائب", href: "/categories", icon: ShoppingBag },
  { label: "هدايا الأعراس", href: "/categories", icon: HeartHandshake },
] as const;

const occasions = ["عيد ميلاد", "تخرج", "عرس", "عيد الأم", "مولود جديد"] as const;

function ProductPlaceholder({ title }: { title: string }) {
  return (
    <article className="card overflow-hidden" aria-label={`${title} — قريباً`}>
      <div className="flex aspect-square items-center justify-center bg-primary-light">
        <Gift className="h-10 w-10 text-primary/40" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="p-4">
        <div className="h-4 w-3/4 rounded-full bg-primary/10" />
        <div className="mt-2 h-4 w-1/3 rounded-full bg-primary/10" />
        <p className="mt-3 text-xs font-medium text-muted">قريباً…</p>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <>
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

      <div className="ribbon-divider" />

      <section className="container-page py-12 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
            تسوّقي حسب القسم
          </h2>
          <p className="mt-2 text-sm text-muted">كل ما تحتاجينه لمناسبة جميلة في مكان واحد</p>
        </div>

        <ul className="grid grid-cols-4 gap-4 md:grid-cols-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.label}>
                <Link
                  href={category.href}
                  className="group flex flex-col items-center gap-2 text-center focus-visible:rounded-card"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary shadow-soft transition duration-200 group-hover:bg-primary-light md:h-20 md:w-20">
                    <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-ink/80 md:text-xs">
                    {category.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

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

      <section className="container-page py-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
              الأكثر مبيعاً
            </h2>
            <p className="mt-1 text-sm text-muted">أحبّت الزبونات، وأكثره طلباً</p>
          </div>
          <Link href="/categories" className="hidden text-sm font-bold text-primary hover:underline md:inline">
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ProductPlaceholder title="الأكثر مبيعاً" />
          <ProductPlaceholder title="الأكثر مبيعاً" />
          <ProductPlaceholder title="الأكثر مبيعاً" />
          <ProductPlaceholder title="الأكثر مبيعاً" />
        </div>
      </section>

      <div className="ribbon-divider" />

      <section className="container-page py-12 md:py-16">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">وصل حديثاً</h2>
          <p className="mt-1 text-sm text-muted">أحدث ما أضفناه إلى المتجر</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ProductPlaceholder title="وصل حديثاً" />
          <ProductPlaceholder title="وصل حديثاً" />
          <ProductPlaceholder title="وصل حديثاً" />
          <ProductPlaceholder title="وصل حديثاً" />
        </div>
      </section>

      <section className="container-page pb-12 md:pb-16">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
            تسوّقي حسب المناسبة
          </h2>
        </div>
        <ul className="flex flex-wrap justify-center gap-3">
          {occasions.map((occasion) => (
            <li key={occasion}>
              <Link
                href="/occasions"
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-surface px-5 py-2 text-sm font-medium text-ink transition duration-200 hover:border-accent hover:bg-accent/10"
              >
                <Gift className="h-4 w-4 text-accent" strokeWidth={1.75} aria-hidden="true" />
                {occasion}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface py-12 md:py-16">
        <div className="container-page grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
              نحن قريبون منك دائماً
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              اطلبي هديتك وسنجهّزها بعناية، ويمكنك التواصل معنا مباشرةً على واتساب لتأكيد الطلب أو الاستفسار.
            </p>

            <ul className="mt-6 flex flex-col gap-4 text-sm">
              <li className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-emerald" strokeWidth={1.75} aria-hidden="true" />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink transition hover:text-primary"
                  dir="ltr"
                >
                  +{site.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-accent" strokeWidth={1.75} aria-hidden="true" />
                <a
                  href={`https://instagram.com/${site.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink transition hover:text-primary"
                  dir="ltr"
                >
                  @{site.instagram}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                <a
                  href={site.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink transition hover:text-primary"
                >
                  {site.addressAr}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                <span className="font-medium text-ink">{site.hoursAr}</span>
              </li>
            </ul>
          </div>

          <div className="card flex flex-col items-center gap-4 bg-bg p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Gift className="h-8 w-8 text-primary" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="font-heading text-xl font-bold text-ink">جاهزون لطلبك</h3>
            <p className="text-sm leading-7 text-muted">
              الدفع عند الاستلام أو تحويل بنكي/محفظة مع صورة الإشعار — والتأكيد عبر واتساب.
            </p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              تواصلي معنا الآن
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
