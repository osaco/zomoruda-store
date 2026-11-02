import Link from "next/link";
import type { Occasion } from "@/types/db";
import { Reveal } from "./Reveal";
import { arabicIndex, homeCopy } from "../constants";

/**
 * Editorial index of occasions: numbered rows ruled by hairlines, each a real
 * link to its occasion page.
 *
 * Hover/focus fills the row with plum rising from the bottom. That fill is a
 * dedicated `::before` layer scaled on the Y axis — not a background-color
 * transition — so the motion matches the mockup and stays on the compositor.
 */
export function OccasionsIndex({ occasions }: { occasions: Occasion[] }) {
  if (occasions.length === 0) return null;

  return (
    <section id="occ" className="wrap pt-10 sm:pt-10" aria-labelledby="occ-heading">
      <Reveal>
        <div className="sec-h">
          <h2 id="occ-heading" className="text-sm font-normal">
            {`${arabicIndex(1)} — ${homeCopy.occasions.index}`}
          </h2>
          <p className="text-sm">{homeCopy.occasions.hint}</p>
        </div>
      </Reveal>

      <Reveal as="ul" className="mt-0 list-none" delay={60}>
        {occasions.map((occasion, i) => (
          <li key={occasion.id}>
            <Link
              href={`/occasions/${occasion.slug}`}
              data-testid="occasion-row"
              className="group relative isolate grid min-h-[64px] grid-cols-[64px_1fr_auto] items-center gap-4 border-b py-[clamp(16px,2.4vw,30px)] transition-colors duration-300 ease-out-soft focus-visible:outline-none group-hover:text-on-deep hover:text-on-deep"
              style={{ borderColor: "var(--color-line)" }}
            >
              {/* Rising plum fill. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -inset-x-5 -z-10 origin-bottom scale-y-0 bg-plum transition-transform duration-[350ms] ease-out-soft group-hover:scale-y-100 group-focus-visible:scale-y-100"
              />
              <span
                aria-hidden="true"
                className="text-sm text-gold"
              >
                {arabicIndex(i + 1)}
              </span>
              <span className="font-display text-[clamp(28px,5vw,64px)] leading-tight">
                {occasion.nameAr}
              </span>
              {/* Arrow points to the RTL "forward" direction: left. */}
              <span
                aria-hidden="true"
                className="text-2xl transition-transform duration-300 ease-out-soft group-hover:-translate-x-2.5 group-focus-visible:-translate-x-2.5"
              >
                ←
              </span>
            </Link>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
