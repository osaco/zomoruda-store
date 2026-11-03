"use client";

import { useEffect, useRef, useState } from "react";

const variants = [
  {
    id: "petite",
    label: "PETITE BOX RIBBON",
    title: "ربطة صندوق",
    d: "M76 226C145 224 201 216 251 186c36-22 39-59 8-70-29-10-56 18-52 43 4 26 41 42 70 25 29-17 27-51 4-62-25-12-52 5-51 28 1 22 25 41 58 54 42 16 80 23 132 22 52-1 69 22 45 44-20 18-49 10-55-10-6-19 9-34 27-33m-153-8c-16 32-29 63-29 93m0-1c-14-17-31-19-40-9-8 10 0 25 16 27 10 1 18-5 24-18m1-1c14-15 31-14 38-4 7 11-4 24-19 23-8-1-15-7-19-19m91-92c12 20 26 29 42 31m-40-28c-12 4-22 15-24 29m44 1c11-8 22-10 33-7",
    facts: [
      ["FINISH", "ربطة هدية"],
      ["PRESENTATION", "صندوق مرتب"],
      ["PERSONAL TOUCH", "بطاقة إهداء"],
    ],
    width: 1.5,
  },
  {
    id: "bouquet",
    label: "ROYAL BOUQUET WRAP",
    title: "تغليف باقة",
    d: "M58 238c70-1 118-11 160-41 38-28 48-65 22-77-24-11-50 12-49 37 2 29 39 47 71 31 34-17 37-55 10-69-24-12-53 1-55 26-2 26 25 47 60 63 35 16 73 26 117 26 29 0 53 12 49 31-3 16-21 23-34 13-12-9-8-26 4-32m-209-3c-1 37-12 67-34 91m0 0c-16-12-32-10-38 1-6 12 6 23 21 20 8-2 14-9 17-21m0 0c16-10 31-4 33 8 2 12-12 19-25 12-6-4-10-10-8-20m121-89c7 21 23 37 45 42m-41-40c-17 0-29 12-32 30m46 11c13-7 27-7 39 0m-159 49c-5-13-3-25 5-34m-12 24c12-3 23-1 31 6",
    facts: [
      ["FINISH", "تغليف باقة"],
      ["PRESENTATION", "تنسيق موسمي"],
      ["PERSONAL TOUCH", "بطاقة إهداء"],
    ],
    width: 2,
  },
  {
    id: "engraving",
    label: "CUSTOM NAME FLOURISH",
    title: "زخرفة بطاقة",
    d: "M67 238c79 0 136-16 177-47 32-24 40-55 18-68-20-12-44 4-46 27-2 26 28 46 59 42 34-4 50-36 30-56-20-19-50-12-57 10-8 25 13 52 48 70 35 18 75 26 121 26 38 0 53 19 38 36-13 15-34 12-39-3-4-15 9-24 25-24m-214-18c-4 36-21 63-46 79m0 0c-13-14-28-16-37-6-8 10-1 23 13 25 11 2 19-5 24-19m0 0c12-14 27-17 36-8 9 10 1 24-14 25-8 0-15-5-22-17m142-91c8 16 22 28 41 33m-36-31c-13 2-23 11-28 26m47 14c13-5 26-3 37 5m-147 41c2-14 9-25 20-33m-14 27c13-1 24 4 31 13",
    facts: [
      ["FINISH", "خط مرسوم"],
      ["PRESENTATION", "بطاقة شخصية"],
      ["PERSONAL TOUCH", "اسم أو عبارة"],
    ],
    width: 1.25,
  },
] as const;

export function AtelierCraftDemo() {
  const [selected, setSelected] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const variant = variants[selected];

  useEffect(() => {
    const frame = frameRef.current;
    const path = pathRef.current;
    if (!frame || !path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
      return;
    }

    let frameId = 0;
    let hasDrawn = false;
    const draw = () => {
      if (hasDrawn) return;
      hasDrawn = true;
      path.style.transition = "none";
      path.style.strokeDashoffset = `${length}`;
      frameId = window.requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 2s cubic-bezier(.22,.7,.25,1)";
        path.style.strokeDashoffset = "0";
      });
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        draw();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(frame);

    return () => {
      observer.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [selected]);

  return (
    <section id="demo" className="atelier-section atelier-demo" aria-labelledby="demo-heading">
      <div className="atelier-wrap">
        <div className="atelier-section-head">
          <p className="atelier-kicker">03 / THE GIFT, IN MOTION</p>
          <h2 id="demo-heading">تفصيلة صغيرة، <em>تحكي الحكاية.</em></h2>
          <p className="atelier-copy">اختاري طريقة التقديم، وشاهدي خطّاً واحداً يلتفّ كربطة، ثم يترك أثره على بطاقة الإهداء.</p>
        </div>

        <div className="atelier-variant-list" role="group" aria-label="اختيار طريقة التقديم">
          {variants.map((item, index) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={selected === index}
              className="atelier-variant"
              onClick={() => setSelected(index)}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">{selected === index ? "—" : "+"}</span>
            </button>
          ))}
        </div>

        <div className="atelier-demo-panel" id="demo-panel" ref={frameRef} aria-label={variant.title}>
          <div className="atelier-demo-meta">
            <span className="atelier-kicker">ZOMORUDA / HAND-FINISHED</span>
            <span className="atelier-kicker">{String(selected + 1).padStart(2, "0")} — 03</span>
          </div>
          <svg className="atelier-flourish" viewBox="0 0 1000 360" role="img" aria-label={`رسم توضيحي: ${variant.title}`}>
            <path ref={pathRef} d={variant.d} fill="none" stroke="var(--atelier-purple)" strokeWidth={variant.width} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="atelier-demo-title">{variant.title}</div>
        </div>

        <dl className="atelier-demo-facts">
          {variant.facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
