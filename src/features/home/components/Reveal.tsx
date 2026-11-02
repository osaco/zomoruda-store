"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger in ms, applied as a transition-delay. */
  delay?: number;
  className?: string;
  as?: ElementType;
};

/**
 * Progressive reveal on scroll: opacity + translateY, driven by
 * IntersectionObserver.
 *
 * Never hides content when it cannot run:
 *  - the hidden state lives behind `[data-reveal-ready]` on <html>, which this
 *    component only sets once the observer is actually attached (so a failed or
 *    absent JS bundle leaves everything visible);
 *  - `prefers-reduced-motion` short-circuits to visible and skips observation;
 *  - the observer disconnects on unmount.
 */
export function Reveal({ children, delay = 0, className = "", as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No IntersectionObserver support, or motion is reduced: stay visible.
    if (reduced || typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-reveal-done", "");
      return;
    }

    // Arm the hidden state only now that we know JS + observers work.
    document.documentElement.setAttribute("data-reveal-ready", "");

    // Anything already in view on first paint shows immediately (no LCP hit).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal-done", "");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
