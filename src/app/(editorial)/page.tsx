import type { Metadata } from "next";
import { env } from "@/lib/env";
import { serializeJsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";
import { FeaturedPieces } from "@/features/home/components/FeaturedPieces";
import { GiftBoxSpotlight } from "@/features/home/components/GiftBoxSpotlight";
import { Hero } from "@/features/home/components/Hero";
import { HowItWorks } from "@/features/home/components/HowItWorks";
import { OccasionsIndex } from "@/features/home/components/OccasionsIndex";
import { BotanicalDivider } from "@/features/home/components/BotanicalDivider";
import { getActiveBanners } from "@/features/catalog/server/queries";
import { getFeaturedPieces, getHomeGiftBox, getHomeOccasions } from "@/features/home/server/queries";

export const revalidate = 60;

const title = "زُمُرّدة — هدايا تُشبه من تُهديها";
const description =
  "متجر زُمُرّدة للهدايا في غزة، الرمال — مفترق البلميرا. بوكسات وورد وعطور وإكسسوارات مرتّبة، نوصلها في موعدها.";

export const metadata: Metadata = {
  // `absolute` bypasses the root template, which would otherwise append the
  // store name a second time ("… | زُمُرّدة").
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_PS",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: site.nameAr,
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${site.nameAr} — هدايا تُشبه من تُهديها`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default async function HomePage() {
  const [occasions, pieces, giftBox, banners] = await Promise.all([getHomeOccasions(), getFeaturedPieces(), getHomeGiftBox(), getActiveBanners()]);

  return (
    <>
      <Hero addressAr={site.addressAr} />
      <FeaturedPieces products={pieces} banners={banners} />
      <GiftBoxSpotlight box={giftBox} />
      <BotanicalDivider />
      <OccasionsIndex occasions={occasions} />
      <BotanicalDivider />
      <HowItWorks />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: site.nameAr,
            image: `${env.NEXT_PUBLIC_SITE_URL}/logo.png`,
            telephone: `+${site.whatsapp}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: "غزة",
              addressRegion: "الرمال",
              streetAddress: "مفترق البلميرا",
              addressCountry: "PS",
            },
            openingHours: "Sa-Th 10:00-21:00",
            url: env.NEXT_PUBLIC_SITE_URL,
          }),
        }}
      />
    </>
  );
}
