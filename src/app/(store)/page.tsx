import { env } from "@/lib/env";
import { site } from "@/lib/site";
import { getRepos } from "@/lib/data";
import { BannerSlider } from "@/features/catalog/components/BannerSlider";
import { CategoryCircles } from "@/features/catalog/components/CategoryCircles";
import { ContactSection } from "@/features/catalog/components/ContactSection";
import { DisplayOnlyShowcase } from "@/features/catalog/components/DisplayOnlyShowcase";
import { HeroSection } from "@/features/catalog/components/HeroSection";
import { OccasionChips } from "@/features/catalog/components/OccasionChips";
import { OffersStrip } from "@/features/catalog/components/OffersStrip";
import { ProductShowcase } from "@/features/catalog/components/ProductShowcase";
import { getActiveBanners, getCategories, getOccasions } from "@/features/catalog/server/queries";

export const revalidate = 60;

export default async function HomePage() {
  const { products } = getRepos();
  const [banners, categories, occasions, bestSellers, newest] = await Promise.all([
    getActiveBanners(),
    getCategories(),
    getOccasions(),
    products.list({ sort: "best_selling", perPage: 8 }),
    products.newest(8),
  ]);

  return (
    <>
      {banners.length > 0 ? <BannerSlider banners={banners} /> : <HeroSection />}
      <CategoryCircles categories={categories} />
      <OffersStrip />
      {bestSellers.items.length > 0 && (
        <ProductShowcase title="الأكثر مبيعاً" subtitle="أحبّتها الزبونات وأكثرها طلباً" href="/offers?sort=best_selling" products={bestSellers.items} />
      )}
      {bestSellers.items.length > 0 && newest.length > 0 && <div className="ribbon-divider" />}
      {newest.length > 0 && (
        <ProductShowcase title="وصل حديثاً" subtitle="أحدث ما أضفناه إلى المتجر" href="/search?sort=newest" products={newest} />
      )}
      {bestSellers.items.length === 0 && newest.length === 0 && <DisplayOnlyShowcase />}
      <OccasionChips occasions={occasions} />
      <ContactSection />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: site.nameAr,
            image: `${env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
            telephone: `+${site.whatsapp}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: "غزة",
              addressRegion: "الرمال",
              addressCountry: "PS",
            },
            openingHours: "Sa-Th 10:00-21:00",
            url: env.NEXT_PUBLIC_SITE_URL,
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
