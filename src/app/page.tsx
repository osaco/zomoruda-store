import {
  CategoryCircles,
  ContactSection,
  HeroSection,
  OccasionChips,
  OffersStrip,
  ProductShowcase,
} from "@/features/catalog";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <div className="ribbon-divider" />

      <CategoryCircles />

      <OffersStrip />

      <ProductShowcase
        title="الأكثر مبيعاً"
        subtitle="أحبّت الزبونات، وأكثره طلباً"
        href="/categories"
      />

      <div className="ribbon-divider" />

      <ProductShowcase
        title="وصل حديثاً"
        subtitle="أحدث ما أضفناه إلى المتجر"
        href="/categories"
      />

      <OccasionChips />

      <ContactSection />
    </>
  );
}
