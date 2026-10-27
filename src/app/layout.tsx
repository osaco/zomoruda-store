import type { Metadata, Viewport } from "next";
import { Reem_Kufi, Tajawal } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

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
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
