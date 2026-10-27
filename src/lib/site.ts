export const site = {
  nameAr: "زُمُرّدة",
  nameEn: "Zomoruda",
  tagline: "هدايا تُشبه من تُحبّ",
  descriptionAr:
    "متجر هدايا في غزة: بوكسات، ورد، عطور، مكياج، أكواب، إكسسوارات، حقائب وهدايا الأعراس. اطلبِي بسهولة ووصلك لباب البيت.",
  addressAr: "غزة - الرمال، مفترق البلميرا",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "970567812644",
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
