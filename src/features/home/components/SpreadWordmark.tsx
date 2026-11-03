"use client";

import { useEffect, useRef } from "react";

export function SpreadWordmark({ motion = true }: { motion?: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const wordmark = ref.current;
    if (!wordmark || !motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = Array.from(wordmark.querySelectorAll<HTMLElement>("[data-wordmark-letter]"));
    let frame = 0;
    const render = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, window.scrollY / 700));
      const center = (letters.length - 1) / 2;
      letters.forEach((letter, index) => {
        const direction = index - center;
        letter.style.transform = `translate3d(${direction * progress * 32}px, ${progress * 30}px, 0)`;
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [motion]);

  return (
    <p ref={ref} className="atelier-wordmark" aria-hidden="true" dir="ltr">
      {"ZOMORUDA".split("").map((letter, index) => (
        <span data-wordmark-letter key={`${letter}-${index}`}>{letter}</span>
      ))}
    </p>
  );
}
