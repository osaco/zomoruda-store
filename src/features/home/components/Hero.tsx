import Link from "next/link";
import { GemMark } from "./GemMark";
import { homeCopy } from "../constants";

/**
 * Editorial hero. Server-rendered so the LCP is plain text — no image, no
 * layout shift, and it paints before any JS is parsed.
 *
 * Always deep-plum, regardless of the active color scheme, so the gem reads
 * the same in light and dark.
 */
export function Hero({ addressAr }: { addressAr: string }) {
  return (
    <section
      data-testid="hero"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-deep pb-12 pt-[120px] text-on-deep sm:pb-14 lg:pt-[140px]"
    >
      {/* Gold hairline grid: a static texture, not a floating gradient. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,162,74,.09) 1px, transparent 1px)",
          backgroundSize: "100% 96px",
          // Paint the texture once and never re-rasterize it on scroll.
          contain: "paint",
        }}
      />

      <div className="wrap relative grid w-full items-end gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-[clamp(24px,5vw,80px)]">
        <div className="min-w-0">
          <p className="flex items-center gap-3 text-sm text-gold">
            <span aria-hidden="true" className="h-px w-10 bg-gold" />
            {addressAr}
          </p>

          <h1 className="mt-4 font-display text-[clamp(88px,19vw,260px)] font-bold leading-[0.95] tracking-tight">
            {homeCopy.hero.wordmark}
          </h1>
          <p className="max-w-[24ch] text-[clamp(18px,2.2vw,26px)] leading-relaxed text-on-deep/90">
            {homeCopy.hero.lead}
          </p>

          <Link
            href="#occ"
            className="focus-gold group mt-8 inline-flex min-h-[48px] items-center gap-3.5 rounded-full bg-gold px-7 py-3.5 font-semibold text-deep transition-[gap,background-color] duration-300 ease-out-soft hover:gap-6 hover:bg-[#DDB95F] sm:mt-9"
          >
            {homeCopy.hero.cta}
            <span aria-hidden="true" className="text-lg leading-none">
              ←
            </span>
          </Link>
        </div>

        {/* Static and decorative on small screens; interactive from lg up. */}
        <GemMark className="mx-auto w-full max-w-[260px] drop-shadow-[0_30px_60px_rgba(0,0,0,.45)] lg:max-w-[460px]" />
      </div>

      <p className="wrap absolute inset-x-0 bottom-5 hidden text-xs text-on-deep/55 sm:block">
        <span className="block text-end">{homeCopy.hero.note}</span>
      </p>
    </section>
  );
}
