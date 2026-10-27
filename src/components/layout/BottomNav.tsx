"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingBag, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/site";

const items = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/categories", label: "الأقسام", icon: LayoutGrid },
  { href: "/search", label: "بحث", icon: Search },
  { href: "/cart", label: "السلة", icon: ShoppingBag, badge: 0 },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/10 bg-surface/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition duration-200",
                  active ? "text-primary" : "text-muted hover:text-primary",
                )}
              >
                <span className="relative">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  {"badge" in item && item.badge ? (
                    <span className="absolute -top-1.5 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <a
            href={whatsappLink(defaultWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-emerald transition duration-200 hover:text-emerald/80"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            واتساب
          </a>
        </li>
      </ul>
    </nav>
  );
}
