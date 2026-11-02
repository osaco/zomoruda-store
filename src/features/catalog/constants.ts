import {
  Baby,
  Cake,
  Coffee,
  Flower2,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  Palette,
  ShoppingBag,
  SprayCan,
  type LucideIcon,
} from "lucide-react";
import type { ProductSort } from "@/lib/data/repositories";

/** Icon per category slug; unknown slugs fall back to a gift. */
export const categoryIcons: Record<string, LucideIcon> = {
  "gift-boxes": Gift,
  flowers: Flower2,
  perfumes: SprayCan,
  cosmetics: Palette,
  mugs: Coffee,
  accessories: Gem,
  bags: ShoppingBag,
  "wedding-gifts": HeartHandshake,
};

export const occasionIcons: Record<string, LucideIcon> = {
  cake: Cake,
  "graduation-cap": GraduationCap,
  heart: Heart,
  flower: Flower2,
  baby: Baby,
};

export const iconFor = (map: Record<string, LucideIcon>, key: string | null | undefined): LucideIcon =>
  (key && map[key]) || Gift;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "الأحدث" },
  { value: "best_selling", label: "الأكثر مبيعاً" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" },
];

export const PER_PAGE = 12;
