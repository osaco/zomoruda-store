import { env } from "@/lib/env";

export const site = {
  nameAr: "زُمُرّدة",
  nameEn: "Zomoruda",
  tagline: "هدايا تُشبه من تُحبّ",
  descriptionAr:
    "متجر زُمُرّدة للهدايا في غزة: بوكسات، ورد، عطور، مستحضرات تجميل، أكواب وإكسسوارات وهدايا شخصية. تواصلي معنا لمعرفة القطع المتوفرة.",
  addressAr: "غزة - الرمال، مفترق البلميرا",
  whatsapp: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  instagram: "zomoruda1",
  hoursAr: "السبت - الخميس: 10 صباحاً - 9 مساءً",
  mapUrl: "https://maps.google.com/?q=Al+Rimal+Gaza",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const defaultWhatsappMessage =
  "مرحباً زُمُرّدة 👋 أرغب بالاستفسار عن منتجاتكم والطلب.";
