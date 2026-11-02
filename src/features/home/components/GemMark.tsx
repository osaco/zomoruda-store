"use client";

import { useEffect, useRef } from "react";

/**
 * The cut emerald — the store's visual signature.
 *
 * A faceted octagon with a distinct top table facet. On pointer-capable devices
 * (and only when motion is allowed) it tilts in perspective towards the cursor
 * and the table facet brightens. Everything is written straight to the DOM
 * inside a single requestAnimationFrame callback — no React state per event, so
 * pointermove never triggers a re-render.
 *
 * Touch devices, reduced-motion users and no-JS visitors get the static gem.
 */

/** Facets: [points, fill, fillOpacity]. The table facet is handled separately. */
const FACETS: { points: string; fill: string; opacity: number }[] = [
  { points: "120,40 280,40 360,120 360,280 280,360 120,360 40,280 40,120", fill: "#1F8A70", opacity: 0.55 },
  { points: "120,40 280,40 245,115 155,115", fill: "#2FB08F", opacity: 0.55 },
  { points: "280,40 360,120 285,155 245,115", fill: "#1F8A70", opacity: 0.35 },
  { points: "360,120 360,280 285,245 285,155", fill: "#0F5E4B", opacity: 0.6 },
  { points: "360,280 280,360 245,285 285,245", fill: "#1F8A70", opacity: 0.3 },
  { points: "280,360 120,360 155,285 245,285", fill: "#0C4C3C", opacity: 0.7 },
  { points: "120,360 40,280 115,245 155,285", fill: "#1F8A70", opacity: 0.35 },
  { points: "40,280 40,120 115,155 115,245", fill: "#0F5E4B", opacity: 0.6 },
  { points: "40,120 120,40 155,115 115,155", fill: "#2FB08F", opacity: 0.35 },
];

const TABLE_POINTS = "155,115 245,115 285,155 285,245 245,285 155,285 115,245 115,155";
const TABLE_BASE_OPACITY = 0.22;
const MAX_TILT_Y = 16;
const MAX_TILT_X = 12;

export function GemMark({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tableRef = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const table = tableRef.current;
    if (!svg || !table) return;

    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverOk = window.matchMedia("(hover: hover)").matches;
    if (!motionOk || !hoverOk) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      frame = 0;
      svg.style.transform = `perspective(900px) rotateY(${(-targetX * MAX_TILT_Y).toFixed(2)}deg) rotateX(${(targetY * MAX_TILT_X).toFixed(2)}deg)`;
      // The table facet catches the light as the cursor moves off-centre.
      table.setAttribute("fill-opacity", (TABLE_BASE_OPACITY + Math.abs(targetX) * 0.35).toFixed(2));
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
      // Coalesce bursts of pointermove into one frame.
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      data-testid="gem-mark"
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ willChange: "transform", transformStyle: "preserve-3d" }}
    >
      {FACETS.map((facet) => (
        <polygon
          key={facet.points}
          points={facet.points}
          fill={facet.fill}
          fillOpacity={facet.opacity}
          stroke="rgba(243,237,247,.28)"
          strokeWidth={1}
        />
      ))}
      <polygon
        ref={tableRef}
        points={TABLE_POINTS}
        fill="#C9F2E3"
        fillOpacity={TABLE_BASE_OPACITY}
        stroke="rgba(243,237,247,.28)"
        strokeWidth={1}
      />
    </svg>
  );
}
