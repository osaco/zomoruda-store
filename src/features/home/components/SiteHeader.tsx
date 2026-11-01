"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useCart, cartCount } from "@/features/cart/store";
import { useHydrated } from "@/features/cart/useHydrated";

const heroLinks = [
  { href: "#occ", label: "المناسبات" },
  { href: "#pieces", label: "المختارات" },
  { href: "#steps", label: "كيف تطلب" },
] as const;

/**
 * Storefront header.
 *
 * Over the home hero it is transparent with light text; once scrolled (or on
 * any page without a hero) it becomes a solid bar. The cart button is wired to
 * the existing zustand store, so the count is real.
 *
 * Below md the links move into a drawer that traps focus, closes on Escape and
 * on outside click, and restores focus to the trigger.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const openCart = useCart((s) => s.open);
  const count = useCart((s) => cartCount(s.lines));
  const hydrated = useHydrated();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Transparent only while the hero is still under the bar.
  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // The drawer belongs to one route: navigating away closes it by derivation,
  // which avoids a setState-in-effect round trip.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !drawer.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (drawer.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    const firstLink = drawer.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const onHero = overlay && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-out-soft",
        onHero
          ? "bg-transparent text-on-deep"
          : "border-b border-primary/10 bg-bg/90 text-ink backdrop-blur-md",
      )}
    >
      <div className="wrap flex min-h-[68px] items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="focus-gold inline-flex min-h-11 items-center rounded-sm font-display text-2xl font-bold leading-none"
        >
          زُمُرّدة
        </Link>

        <nav aria-label="التنقل الرئيسي" data-testid="desktop-store-nav" className="hidden items-center gap-8 lg:flex">
          {(overlay ? heroLinks : navLinks).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "focus-gold inline-flex min-h-11 items-center rounded-sm text-[15px] transition-opacity duration-200",
                onHero ? "opacity-75 hover:opacity-100" : "hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="cart-button"
            onClick={openCart}
            aria-label={
              hydrated && count > 0
                ? `السلة، ${count} منتجات`
                : "السلة، فارغة"
            }
            className={cn(
              "focus-gold inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border px-4 text-sm transition-colors duration-200",
              onHero
                ? "border-on-deep/35 text-on-deep hover:bg-on-deep/10"
                : "border-primary/15 text-ink hover:bg-primary-light",
            )}
          >
            <span>السلة</span>
            <span aria-hidden="true">·</span>
            <span aria-hidden="true" className="tabular-nums">
              {hydrated ? count : 0}
            </span>
          </button>

          <button
            ref={triggerRef}
            data-testid="mobile-menu-trigger"
            type="button"
            onClick={() => (open ? close() : setOpen(true))}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={cn(
              "focus-gold inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full lg:hidden",
              onHero ? "text-on-deep hover:bg-on-deep/10" : "text-ink hover:bg-primary-light",
            )}
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
          className="border-t border-primary/10 bg-bg px-5 pb-6 pt-2 lg:hidden"
        >
          <nav aria-label="التنقل في القائمة">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="focus-gold flex min-h-[48px] items-center border-b border-line text-base"
                    style={{ borderColor: "var(--color-line)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
