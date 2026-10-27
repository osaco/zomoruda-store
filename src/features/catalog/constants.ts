import {
  Coffee,
  Flower2,
  Gem,
  Gift,
  HeartHandshake,
  Palette,
  ShoppingBag,
  SprayCan,
  type LucideIcon,
} from "lucide-react";

export type CategoryCircle = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const categoryCircles: CategoryCircle[] = [
  { label: "بوكسات هدايا", href: "/categories/gift-boxes", icon: Gift },
  { label: "ورد", href: "/categories/flowers", icon: Flower2 },
  { label: "عطور", href: "/categories/perfumes", icon: SprayCan },
  { label: "مكياج", href: "/categories/cosmetics", icon: Palette },
  { label: "أكواب", href: "/categories/mugs", icon: Coffee },
  { label: "إكسسوارات", href: "/categories/accessories", icon: Gem },
  { label: "حقائب", href: "/categories/bags", icon: ShoppingBag },
  { label: "هدايا الأعراس", href: "/categories/wedding-gifts", icon: HeartHandshake },
];

export const occasionChips = [
  { label: "عيد ميلاد", href: "/occasions/birthday" },
  { label: "تخرج", href: "/occasions/graduation" },
  { label: "عرس", href: "/occasions/wedding" },
  { label: "عيد الأم", href: "/occasions/mothers-day" },
  { label: "مولود جديد", href: "/occasions/new-baby" },
];
