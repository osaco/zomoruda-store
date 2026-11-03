"use client";

import { useEffect, useRef } from "react";

type FlightStop = { at: number; x: number; y: number; rotate: number; scale: number; opacity: number };

function topOf(selector: string, fallback: number) {
  const element = document.querySelector<HTMLElement>(selector);
  return element ? element.getBoundingClientRect().top + window.scrollY : fallback;
}

export function AtelierButterfly() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const butterfly = ref.current;
    if (!butterfly) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;

    let frame = 0;

    const render = () => {
      frame = 0;
      const vh = window.innerHeight || 800;
      const heroTop = topOf("#atelier-hero", 0);
      const heroBottom = topOf("#craft", heroTop + vh);
      const craftBottom = topOf("#demo", heroBottom + vh);
      const artTop = topOf("#demo-panel", craftBottom + vh * 0.3);
      const demoBottom = craftBottom + (document.querySelector<HTMLElement>("#demo")?.offsetHeight ?? vh);
      const stops: FlightStop[] = [
        { at: heroTop, x: 80, y: 33, rotate: 10, scale: 0.84, opacity: 0.92 },
        { at: heroTop + (heroBottom - heroTop) * 0.72, x: 18, y: 61, rotate: -19, scale: 0.9, opacity: 0.92 },
        { at: craftBottom - vh * 0.18, x: 76, y: 27, rotate: 15, scale: 0.78, opacity: 0.84 },
        { at: artTop + 100, x: 86, y: 25, rotate: 3, scale: 0.76, opacity: 0.78 },
        { at: demoBottom, x: 90, y: 18, rotate: 12, scale: 0.62, opacity: 0 },
      ];

      const position = window.scrollY;
      let from = stops[0];
      let to = stops[stops.length - 1];
      for (let index = 0; index < stops.length - 1; index += 1) {
        if (position >= stops[index].at && position <= stops[index + 1].at) {
          from = stops[index];
          to = stops[index + 1];
          break;
        }
        if (position < stops[index].at) {
          from = stops[index];
          to = stops[index];
          break;
        }
      }

      const span = Math.max(1, to.at - from.at);
      const t = Math.max(0, Math.min(1, (position - from.at) / span));
      const mix = (key: Exclude<keyof FlightStop, "at">) => from[key] + (to[key] - from[key]) * t;
      const opacity = mix("opacity");
      butterfly.style.transform = `translate3d(${mix("x")}vw, ${mix("y")}vh, 0) translate(-50%, -50%) rotate(${mix("rotate")}deg) scale(${mix("scale")})`;
      butterfly.style.opacity = String(opacity);
      butterfly.style.visibility = opacity <= 0.01 ? "hidden" : "visible";
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    document.fonts?.ready.then(schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="atelier-butterfly" aria-hidden="true">
      <svg viewBox="0 0 120 100" focusable="false">
        <g className="atelier-wing atelier-wing-left">
          <path d="M60 48C51 22 30 9 13 16 1 21 5 43 20 54c11 8 23 7 40-2Z" />
          <path d="M52 51C35 47 17 52 13 68c-3 12 12 19 25 14 11-4 17-14 22-31Z" />
          <path d="M48 45 20 23M44 56 21 71" />
        </g>
        <g className="atelier-wing atelier-wing-right">
          <path d="M60 48c9-26 30-39 47-32 12 5 8 27-7 38-11 8-23 7-40-2Z" />
          <path d="M68 51c17-4 35 1 39 17 3 12-12 19-25 14-11-4-17-14-22-31Z" />
          <path d="m72 45 28-22m-24 33 23 15" />
        </g>
        <path d="M60 43c-4-10-12-15-17-12m17 12c4-10 12-15 17-12M60 39v47m0-28c-6 10-10 18-17 24m17-24c6 10 10 18 17 24" />
      </svg>
    </div>
  );
}
