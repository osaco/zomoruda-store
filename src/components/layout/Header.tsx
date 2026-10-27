"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { navLinks } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/site";
import { CartBadge } from "@/features/cart/components/CartBadge";
import { useCart } from "@/features/cart/store";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openCart = useCart((s) => s.open);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/5 bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3 md:h-20">
        <Link href="/" aria-label="الصفحة الرئيسية" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition duration-200",
                  active
                    ? "bg-primary-light text-primary"
                    : "text-ink/80 hover:bg-primary-light hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/search"
            aria-label="بحث"
            className="rounded-full p-2 text-ink/80 transition hover:bg-primary-light hover:text-primary"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label="سلة المشتريات"
            className="relative rounded-full p-2 text-ink/80 transition hover:bg-primary-light hover:text-primary"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            <CartBadge className="-top-0.5 end-0" />
          </button>
          <a
            href={whatsappLink(defaultWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary hidden !px-4 !py-2 text-xs md:inline-flex"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            واتساب
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            className="rounded-full p-2 text-ink/80 transition hover:bg-primary-light hover:text-primary md:hidden"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-primary/5 bg-bg px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-input px-4 py-3 text-sm font-medium text-ink/80 transition hover:bg-primary-light hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
