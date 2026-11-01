import { Reveal } from "./Reveal";
import { homeCopy } from "../constants";

/**
 * The editorial statement: large type, generous space, one emerald emphasis.
 * Sits directly under the ribbon so the page breathes between hero and index.
 */
export function Statement() {
  return (
    <Reveal as="section" className="wrap pb-16 pt-10 sm:pb-24 sm:pt-12">
      <p className="max-w-[20ch] font-display text-[clamp(26px,4.6vw,60px)] font-medium leading-[1.45]">
        {homeCopy.statement.before}
        <em className="not-italic text-emerald">{homeCopy.statement.emphasis}</em>
        {homeCopy.statement.after}
      </p>
    </Reveal>
  );
}
