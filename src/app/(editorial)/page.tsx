import type { Metadata } from "next";
import { env } from "@/lib/env";
import { serializeJsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";
import { AtelierCraftDemo } from "@/features/home/components/AtelierCraftDemo";
import {
  AtelierCraftArgument,
  AtelierHero,
  AtelierMaterials,
  AtelierMeasurements,
} from "@/features/home/components/AtelierSections";

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
        url: "/logo.png",
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
    images: ["/logo.png"],
  },
};

export default async function HomePage() {
  return (
    <>
      <AtelierHero />
      <AtelierCraftArgument />
      <AtelierCraftDemo />
      <AtelierMaterials />
      <AtelierMeasurements />

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
