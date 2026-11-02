import Link from "next/link";
import { site, defaultWhatsappMessage, whatsappLink } from "@/lib/site";
import { homeCopy } from "../constants";

/**
 * Closing signature: the store name at `clamp(80px, 22vw, 320px)`, cropped by
 * the bottom edge of the footer so it reads as a stamp rather than a heading.
 *
 * Always deep-plum, like the hero. Decorative — `aria-hidden` — because the
 * accessible name already appears in the contact row above it.
 */
export function SiteFooter({ addressAr }: { addressAr: string }) {
  return (
    <footer className="mt-16 overflow-hidden bg-deep pb-[env(safe-area-inset-bottom)] text-on-deep">
      <div className="wrap pt-16 sm:pt-20">
        <div className="flex flex-wrap items-start justify-between gap-6 text-[15px] text-on-deep/80">
          <span>{addressAr}</span>
          <span>{homeCopy.footer.payments}</span>
          <a
            href={whatsappLink(defaultWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-gold rounded-sm underline-offset-4 transition-colors hover:text-gold hover:underline"
          >
            {homeCopy.footer.whatsapp}
          </a>
        </div>

        <nav aria-label="روابط الفوتر" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-deep/70">
          <Link href="/categories" className="focus-gold rounded-sm hover:text-gold">
            الأقسام
          </Link>
          <Link href="/occasions" className="focus-gold rounded-sm hover:text-gold">
            المناسبات
          </Link>
          <Link href="/track" className="focus-gold rounded-sm hover:text-gold">
            تتبّع طلبك
          </Link>
          <Link href="/policy" className="focus-gold rounded-sm hover:text-gold">
            سياسة الخصوصية والتوصيل
          </Link>
        </nav>
      </div>

      {/* The signature. Cropped from below by the negative bottom margin. */}
      <p
        data-testid="footer-wordmark"
        aria-hidden="true"
        className="wrap -mb-[0.12em] mt-5 select-none font-display text-[clamp(80px,22vw,320px)] font-bold leading-[0.9] text-on-deep/95"
      >
        {homeCopy.footer.wordmark}
      </p>

      <div className="wrap border-t border-on-deep/15 pb-8 pt-4">
        <p className="text-xs text-on-deep/60">
          © {new Date().getFullYear()} {site.nameAr} — جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
