"use client";

import { useEffect, useRef } from "react";

/**
 * A single gold ribbon drawn by scrolling.
 *
 * The path is measured once, then `stroke-dashoffset` is animated from full
 * length to zero as the element crosses the viewport. Scroll work is coalesced
 * through requestAnimationFrame and the listener is passive; everything is torn
 * down on unmount.
 *
 * Under reduced motion the ribbon is simply drawn complete — no scroll listener.
 */
export function RibbonDivider({ className = "" }: { className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const total = path.getTotalLength();

    // Reduced motion: show the finished ribbon, skip observing entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDasharray = `${total}`;
      path.style.strokeDashoffset = "0";
      return;
    }

    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total}`;

    let frame = 0;

    const draw = () => {
      frame = 0;
      const rect = path.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (viewport - rect.top) / (viewport * 0.8)));
      path.style.strokeDashoffset = `${total * (1 - progress)}`;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={`relative h-[100px] sm:h-[140px] ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 140"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <path
          ref={pathRef}
          d="M500 0 C500 60 300 50 300 90 S 640 70 500 140"
          fill="none"
          stroke="var(--gold)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
