import { Reveal } from "./Reveal";
import { arabicIndex, arabicNumber, homeCopy } from "../constants";

/**
 * Three steps, three columns, each capped by a hairline rule with an emerald
 * Reem Kufi numeral. Collapses to a single column below md.
 */
export function HowItWorks() {
  return (
    <section id="steps" className="wrap pb-24 pt-20 sm:pb-32 sm:pt-28" aria-labelledby="steps-heading">
      <Reveal>
        <div className="sec-h">
          <h2 id="steps-heading" className="text-sm font-normal">
            {`${arabicIndex(3)} — ${homeCopy.steps.index}`}
          </h2>
          <p className="text-sm">{homeCopy.steps.hint}</p>
        </div>
      </Reveal>

      <Reveal as="ol" className="mt-8 grid list-none grid-cols-1 gap-7 sm:mt-12 md:grid-cols-3 md:gap-10">
        {homeCopy.steps.items.map((step, i) => (
          <li key={step.title} className="border-t border-ink/80 pt-4">
            <span className="block font-display text-[44px] font-medium leading-tight text-emerald">
              {arabicNumber(i + 1)}
            </span>
            <h3 className="mt-1 font-display text-2xl">{step.title}</h3>
            <p className="mt-1 max-w-[30ch] text-muted">{step.body}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
