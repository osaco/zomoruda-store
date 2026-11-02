import type { Metadata, Viewport } from "next";
import { Cairo, Reem_Kufi } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { env } from "@/lib/env";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";

/**
 * Both families are self-hosted by next/font (no external <link>).
 * `display: swap` plus matched fallback metrics keep the CLS at ~0 while the
 * real face streams in.
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["500", "700"],
  variable: "--font-reem-kufi",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  applicationName: site.nameAr,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: site.nameAr, statusBarStyle: "default" },
  title: {
    default: `${site.nameAr} | ${site.nameEn}`,
    template: `%s | ${site.nameAr}`,
  },
  description: site.descriptionAr,
  keywords: [
    "هدايا",
    "غزة",
    "زمرودة",
    "بوكس هدايا",
    "ورد",
    "عطور",
    "إكسسوارات",
  ],
  openGraph: {
    title: `${site.nameAr} | ${site.nameEn}`,
    description: site.descriptionAr,
    locale: "ar_PS",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#39244A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${reemKufi.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
          تخطّي إلى المحتوى
        </a>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
