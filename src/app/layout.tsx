import type { Metadata, Viewport } from "next";
import { Reem_Kufi, Tajawal } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { env } from "@/lib/env";

const reemKufi = Reem_Kufi({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-reem-kufi",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
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
  themeColor: "#6B2FA0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${reemKufi.variable} ${tajawal.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
          تخطّي إلى المحتوى
        </a>
        {children}
      </body>
    </html>
  );
}
