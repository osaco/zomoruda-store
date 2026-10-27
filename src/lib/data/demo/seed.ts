/**
 * Demo seed data. Mirrors supabase/seed.sql so the store looks the same in
 * demo mode and after connecting a real database.
 */
import type {
  Banner,
  Category,
  Coupon,
  DeliveryZone,
  Occasion,
  Product,
  ProductOption,
  Setting,
} from "@/types/db";

const img = (label: string, bg = "F4EDFA", fg = "6B2FA0") =>
  `https://placehold.co/800x800/${bg}/${fg}/png?text=${encodeURIComponent(label)}`;

export const seedCategories: Category[] = [
  { id: "cat-gift-boxes", nameAr: "بوكسات هدايا", slug: "gift-boxes", descriptionAr: "بوكسات مرتّبة لكل مناسبة", imageUrl: img("Gift Boxes"), sortOrder: 1, isActive: true },
  { id: "cat-flowers", nameAr: "ورد", slug: "flowers", descriptionAr: "بوكيهات ورد طبيعي وصناعي", imageUrl: img("Flowers"), sortOrder: 2, isActive: true },
  { id: "cat-perfumes", nameAr: "عطور", slug: "perfumes", descriptionAr: "عطور نسائية ورجالية", imageUrl: img("Perfumes"), sortOrder: 3, isActive: true },
  { id: "cat-cosmetics", nameAr: "مكياج وعناية", slug: "cosmetics", descriptionAr: "مكياج ومنتجات عناية", imageUrl: img("Cosmetics"), sortOrder: 4, isActive: true },
  { id: "cat-mugs", nameAr: "أكواب", slug: "mugs", descriptionAr: "أكواب مطبوعة بالاسم والصورة", imageUrl: img("Mugs"), sortOrder: 5, isActive: true },
  { id: "cat-accessories", nameAr: "إكسسوارات", slug: "accessories", descriptionAr: "سلاسل، أساور، حلق", imageUrl: img("Accessories"), sortOrder: 6, isActive: true },
  { id: "cat-bags", nameAr: "حقائب", slug: "bags", descriptionAr: "حقائب يد وكتف", imageUrl: img("Bags"), sortOrder: 7, isActive: true },
  { id: "cat-wedding", nameAr: "هدايا الأعراس", slug: "wedding-gifts", descriptionAr: "براويز بصمة وتوزيعات أعراس", imageUrl: img("Wedding"), sortOrder: 8, isActive: true },
];

export const seedOccasions: Occasion[] = [
  { id: "occ-birthday", nameAr: "عيد ميلاد", slug: "birthday", icon: "cake", sortOrder: 1, isActive: true },
  { id: "occ-graduation", nameAr: "تخرج", slug: "graduation", icon: "graduation-cap", sortOrder: 2, isActive: true },
  { id: "occ-wedding", nameAr: "عرس", slug: "wedding", icon: "heart", sortOrder: 3, isActive: true },
  { id: "occ-mothers-day", nameAr: "عيد الأم", slug: "mothers-day", icon: "flower", sortOrder: 4, isActive: true },
  { id: "occ-new-baby", nameAr: "مولود جديد", slug: "new-baby", icon: "baby", sortOrder: 5, isActive: true },
];

export const seedZones: DeliveryZone[] = [
  { id: "zone-gaza-city", nameAr: "مدينة غزة", fee: 10, minOrder: null, deliveryTimeAr: "نفس اليوم", sortOrder: 1, isActive: true },
  { id: "zone-north", nameAr: "شمال غزة", fee: 15, minOrder: null, deliveryTimeAr: "خلال 24 ساعة", sortOrder: 2, isActive: true },
  { id: "zone-middle", nameAr: "الوسطى", fee: 20, minOrder: 50, deliveryTimeAr: "خلال 24-48 ساعة", sortOrder: 3, isActive: true },
];

export const seedCoupons: Coupon[] = [
  { id: "cpn-welcome", code: "WELCOME10", type: "percent", value: 10, minOrder: 50, maxDiscount: 30, usageLimit: null, usedCount: 0, startsAt: null, endsAt: null, isActive: true },
  { id: "cpn-gift5", code: "GIFT5", type: "fixed", value: 5, minOrder: 40, maxDiscount: null, usageLimit: 100, usedCount: 0, startsAt: null, endsAt: null, isActive: true },
];

export const seedBanners: Banner[] = [
  { id: "ban-1", titleAr: "هدايا تُشبه من تُحبّ", subtitleAr: "بوكسات مرتّبة بلمسة زُمُرّدة", imageUrl: img("Zomoruda Gifts", "6B2FA0", "FFFFFF").replace("800x800", "1200x500"), linkUrl: "/categories/gift-boxes", sortOrder: 1, isActive: true, startsAt: null, endsAt: null },
  { id: "ban-2", titleAr: "عروض عيد الأم", subtitleAr: "خصم 10% بكود WELCOME10", imageUrl: img("Mothers Day", "C9A24A", "FFFFFF").replace("800x800", "1200x500"), linkUrl: "/offers", sortOrder: 2, isActive: true, startsAt: null, endsAt: null },
];

export const seedSettings: Setting[] = [
  { key: "orders_paused", value: "false" },
  { key: "orders_paused_message", value: "نعتذر، استقبال الطلبات متوقف مؤقتاً. تواصلي معنا عبر واتساب." },
  { key: "bank_details", value: "بنك فلسطين — حساب زُمُرّدة — أو محفظة جوّال باي على رقم المتجر" },
  { key: "announcement", value: "التوصيل لكل مناطق غزة 🚚" },
];

type SeedProduct = {
  slug: string;
  nameAr: string;
  descriptionAr: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  occasions: string[];
  label: string;
  featured?: boolean;
  isNew?: boolean;
  allowName?: boolean;
  allowCardMessage?: boolean;
  allowPhotoUpload?: boolean;
  stockQty?: number;
  availability?: Product["availability"];
  soldCount?: number;
  options?: Omit<ProductOption, "id" | "productId">[];
};

const raw: SeedProduct[] = [
  { slug: "royal-gift-box", nameAr: "بوكس الهدايا الملكي", descriptionAr: "بوكس فاخر يحتوي عطر، شوكولاتة، شمعة معطّرة وكرت إهداء.", price: 120, compareAtPrice: 140, categoryId: "cat-gift-boxes", occasions: ["occ-birthday", "occ-mothers-day"], label: "Royal Box", featured: true, allowName: true, allowCardMessage: true, soldCount: 48,
    options: [{ nameAr: "الحجم", values: [{ valueAr: "وسط", priceDelta: 0 }, { valueAr: "كبير", priceDelta: 30 }], isRequired: true, sortOrder: 1 }] },
  { slug: "pink-roses-bouquet", nameAr: "بوكيه ورد جوري زهري", descriptionAr: "بوكيه ورد جوري طبيعي ملفوف بورق كوري أنيق.", price: 65, categoryId: "cat-flowers", occasions: ["occ-birthday", "occ-mothers-day", "occ-graduation"], label: "Roses", featured: true, allowCardMessage: true, soldCount: 61,
    options: [{ nameAr: "عدد الوردات", values: [{ valueAr: "10 وردات", priceDelta: 0 }, { valueAr: "20 وردة", priceDelta: 40 }], isRequired: true, sortOrder: 1 }] },
  { slug: "oud-perfume-50ml", nameAr: "عطر عود ملكي 50 مل", descriptionAr: "عطر شرقي ثابت بنفحات العود والعنبر.", price: 85, categoryId: "cat-perfumes", occasions: ["occ-birthday", "occ-wedding"], label: "Oud", isNew: true, soldCount: 22 },
  { slug: "vanilla-perfume", nameAr: "عطر فانيلا ناعم", descriptionAr: "عطر نسائي خفيف بالفانيلا والمسك الأبيض.", price: 55, compareAtPrice: 70, categoryId: "cat-perfumes", occasions: ["occ-birthday", "occ-mothers-day"], label: "Vanilla", soldCount: 35 },
  { slug: "makeup-kit", nameAr: "طقم مكياج متكامل", descriptionAr: "طقم مكياج يحتوي باليت ظلال، روج، ماسكرا وفرش.", price: 95, categoryId: "cat-cosmetics", occasions: ["occ-birthday", "occ-graduation"], label: "Makeup Kit", isNew: true, soldCount: 18 },
  { slug: "name-mug", nameAr: "كوب مطبوع بالاسم", descriptionAr: "كوب سيراميك أبيض مطبوع بالاسم والصورة التي تختارينها.", price: 25, categoryId: "cat-mugs", occasions: ["occ-birthday", "occ-graduation", "occ-new-baby"], label: "Name Mug", featured: true, allowName: true, allowPhotoUpload: true, availability: "made_to_order", soldCount: 74 },
  { slug: "name-necklace", nameAr: "سلسال بالاسم", descriptionAr: "سلسال ستانلس ستيل مطلي ذهبي محفور بالاسم.", price: 45, categoryId: "cat-accessories", occasions: ["occ-birthday", "occ-graduation"], label: "Necklace", featured: true, allowName: true, availability: "made_to_order", soldCount: 53,
    options: [{ nameAr: "اللون", values: [{ valueAr: "ذهبي", priceDelta: 0 }, { valueAr: "فضي", priceDelta: 0 }, { valueAr: "روز جولد", priceDelta: 5 }], isRequired: true, sortOrder: 1 }] },
  { slug: "pearl-bracelet", nameAr: "إسوارة لؤلؤ", descriptionAr: "إسوارة لؤلؤ ناعمة مع قفل ذهبي.", price: 35, categoryId: "cat-accessories", occasions: ["occ-birthday", "occ-mothers-day"], label: "Bracelet", isNew: true, soldCount: 12 },
  { slug: "crystal-earrings", nameAr: "حلق كريستال", descriptionAr: "حلق كريستال لامع مناسب للسهرات.", price: 30, compareAtPrice: 40, categoryId: "cat-accessories", occasions: ["occ-wedding", "occ-birthday"], label: "Earrings", soldCount: 27 },
  { slug: "leather-handbag", nameAr: "حقيبة يد جلد", descriptionAr: "حقيبة يد أنيقة من الجلد الصناعي بعدة ألوان.", price: 110, categoryId: "cat-bags", occasions: ["occ-birthday", "occ-graduation"], label: "Handbag", isNew: true, stockQty: 6, soldCount: 9,
    options: [{ nameAr: "اللون", values: [{ valueAr: "أسود", priceDelta: 0 }, { valueAr: "بيج", priceDelta: 0 }, { valueAr: "عنابي", priceDelta: 0 }], isRequired: true, sortOrder: 1 }] },
  { slug: "wedding-fingerprint-frame", nameAr: "برواز بصمة العرس", descriptionAr: "برواز شجرة بصمات للضيوف مع اسم العروسين وتاريخ العرس.", price: 90, categoryId: "cat-wedding", occasions: ["occ-wedding"], label: "Fingerprint Frame", featured: true, allowName: true, availability: "made_to_order", soldCount: 31 },
  { slug: "wedding-giveaways", nameAr: "توزيعات أعراس (25 قطعة)", descriptionAr: "توزيعات مرتّبة بالاسم والتاريخ، 25 قطعة.", price: 75, categoryId: "cat-wedding", occasions: ["occ-wedding", "occ-new-baby"], label: "Giveaways", isNew: true, allowName: true, allowCardMessage: true, availability: "made_to_order", soldCount: 15,
    options: [{ nameAr: "الكمية", values: [{ valueAr: "25 قطعة", priceDelta: 0 }, { valueAr: "50 قطعة", priceDelta: 65 }], isRequired: true, sortOrder: 1 }] },
];

export const seedProducts: Product[] = raw.map((p, index) => {
  const id = `prd-${index + 1}`;
  const createdAt = new Date(Date.UTC(2026, 8, 1 + index * 3)).toISOString();
  return {
    id,
    nameAr: p.nameAr,
    slug: p.slug,
    descriptionAr: p.descriptionAr,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    categoryId: p.categoryId,
    stockQty: p.stockQty ?? 25,
    availability: p.availability ?? "in_stock",
    isFeatured: p.featured ?? false,
    isNew: p.isNew ?? false,
    isActive: true,
    allowName: p.allowName ?? false,
    allowCardMessage: p.allowCardMessage ?? false,
    allowPhotoUpload: p.allowPhotoUpload ?? false,
    images: [
      { id: `${id}-img-1`, productId: id, url: img(p.label), altAr: p.nameAr, sortOrder: 1, isPrimary: true },
      { id: `${id}-img-2`, productId: id, url: img(p.label, "FFF8E7", "C9A24A"), altAr: p.nameAr, sortOrder: 2, isPrimary: false },
    ],
    options: (p.options ?? []).map((o, i) => ({ ...o, id: `${id}-opt-${i + 1}`, productId: id })),
    occasionIds: p.occasions,
    soldCount: p.soldCount ?? 0,
    createdAt,
  };
});
