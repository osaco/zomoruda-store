import { getRepos } from "@/lib/data";
import { BannerSlider } from "@/features/catalog/components/BannerSlider";
import { CategoryCircles } from "@/features/catalog/components/CategoryCircles";
import { ContactSection } from "@/features/catalog/components/ContactSection";
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
      <ProductShowcase title="الأكثر مبيعاً" subtitle="أحبّتها الزبونات وأكثرها طلباً" href="/offers?sort=best_selling" products={bestSellers.items} />
      <div className="ribbon-divider" />
      <ProductShowcase title="وصل حديثاً" subtitle="أحدث ما أضفناه إلى المتجر" href="/search?sort=newest" products={newest} />
      <OccasionChips occasions={occasions} />
      <ContactSection />
    </>
  );
}
