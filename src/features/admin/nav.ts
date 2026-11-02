import {
  BarChart3,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  PartyPopper,
  Settings,
  ShoppingCart,
  Tags,
  TicketPercent,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@/types/enums";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; role: AdminRole };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard, role: "staff" },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart, role: "staff" },
  { href: "/admin/products", label: "المنتجات", icon: Gift, role: "staff" },
  { href: "/admin/customers", label: "الزبائن", icon: Users, role: "staff" },
  { href: "/admin/categories", label: "الأقسام", icon: Tags, role: "admin" },
  { href: "/admin/occasions", label: "المناسبات", icon: PartyPopper, role: "admin" },
  { href: "/admin/banners", label: "البانرات", icon: ImageIcon, role: "admin" },
  { href: "/admin/zones", label: "مناطق التوصيل", icon: MapPin, role: "admin" },
  { href: "/admin/coupons", label: "الكوبونات", icon: TicketPercent, role: "admin" },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3, role: "admin" },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, role: "admin" },
];
