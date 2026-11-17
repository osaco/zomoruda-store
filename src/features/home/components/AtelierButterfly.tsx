type AtelierButterflyProps = {
  className?: string;
};

/**
 * A softly glowing butterfly used as a brand ornament. It replaces the old
 * scroll-tracked line drawing so the mark feels deliberate and classic.
 */
export function AtelierButterfly({ className = "" }: AtelierButterflyProps) {
  return (
    <svg viewBox="0 0 156 128" className={`zomoruda-butterfly ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="zomoruda-wing-l" cx="70%" cy="28%" r="86%">
          <stop offset="0" stopColor="#fffdf1" />
          <stop offset=".24" stopColor="#f1d88a" />
          <stop offset=".52" stopColor="#c28dcf" />
          <stop offset=".82" stopColor="#754d9a" />
          <stop offset="1" stopColor="#39244a" />
        </radialGradient>
        <radialGradient id="zomoruda-wing-r" cx="30%" cy="28%" r="86%">
          <stop offset="0" stopColor="#fffdf1" />
          <stop offset=".24" stopColor="#f1d88a" />
          <stop offset=".52" stopColor="#c28dcf" />
          <stop offset=".82" stopColor="#754d9a" />
          <stop offset="1" stopColor="#39244a" />
        </radialGradient>
        <linearGradient id="zomoruda-wing-sheen" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#fff8d8" stopOpacity=".08" />
          <stop offset=".48" stopColor="#fffdf1" stopOpacity=".62" />
          <stop offset=".56" stopColor="#fffdf1" stopOpacity=".04" />
          <stop offset="1" stopColor="#fffdf1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="zomoruda-body" x1="0" x2="1">
          <stop stopColor="#f6df91" />
          <stop offset=".5" stopColor="#fff5cf" />
          <stop offset="1" stopColor="#b78339" />
        </linearGradient>
        <filter id="zomoruda-butterfly-glow" x="-30%" y="-35%" width="160%" height="175%">
          <feGaussianBlur stdDeviation="5" result="softGlow" />
          <feColorMatrix in="softGlow" type="matrix" values="1 0 0 0 .25  0 1 0 0 .16  0 0 1 0 .5  0 0 0 .48 0" result="violetGlow" />
          <feMerge>
            <feMergeNode in="violetGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#zomoruda-butterfly-glow)" strokeLinejoin="round" strokeLinecap="round">
        <g className="zomoruda-butterfly-wing zomoruda-butterfly-wing-left">
          <path d="M78 62C67 33 47 13 26 18 6 23 8 49 25 63c13 11 32 12 52 5Z" fill="url(#zomoruda-wing-l)" stroke="#fff0b6" strokeOpacity=".92" strokeWidth="1.25" />
          <path d="M77 64C54 63 33 72 31 91c-2 18 17 26 32 17 12-8 16-26 14-44Z" fill="url(#zomoruda-wing-l)" stroke="#fff0b6" strokeOpacity=".76" strokeWidth="1.25" />
          <path d="M28 25c11-4 23 0 31 8-8 4-17 5-26 2-4-3-6-6-5-10Z" fill="#fff6d8" fillOpacity=".58" />
          <path d="M38 83c7-6 17-7 27-4-5 8-12 13-22 14-4-2-6-5-5-10Z" fill="#f5e5ff" fillOpacity=".42" />
          <path d="M77 63 30 29M77 63 25 48M78 64 42 90" fill="none" stroke="#fff9e5" strokeOpacity=".58" strokeWidth=".9" />
          <circle cx="49" cy="47" r="2" fill="#fff8dc" fillOpacity=".88" />
          <circle cx="59" cy="56" r="1.3" fill="#fff8dc" fillOpacity=".76" />
        </g>
        <g className="zomoruda-butterfly-wing zomoruda-butterfly-wing-right">
          <path d="M79 62c11-29 31-49 52-44 20 5 18 31 1 45-13 11-32 12-52 5Z" fill="url(#zomoruda-wing-r)" stroke="#fff0b6" strokeOpacity=".92" strokeWidth="1.25" />
          <path d="M80 64c23-1 44 8 46 27 2 18-17 26-32 17-12-8-16-26-14-44Z" fill="url(#zomoruda-wing-r)" stroke="#fff0b6" strokeOpacity=".76" strokeWidth="1.25" />
          <path d="M128 25c-11-4-23 0-31 8 8 4 17 5 26 2 4-3 6-6 5-10Z" fill="#fff6d8" fillOpacity=".58" />
          <path d="M118 83c-7-6-17-7-27-4 5 8 12 13 22 14 4-2 6-5 5-10Z" fill="#f5e5ff" fillOpacity=".42" />
          <path d="m79 63 47-34m-47 34 52-15m-53 16 36 26" fill="none" stroke="#fff9e5" strokeOpacity=".58" strokeWidth=".9" />
          <circle cx="107" cy="47" r="2" fill="#fff8dc" fillOpacity=".88" />
          <circle cx="97" cy="56" r="1.3" fill="#fff8dc" fillOpacity=".76" />
        </g>
        <path className="zomoruda-butterfly-sheen" d="M20 44c5-18 19-31 35-28 9 2 16 8 22 17-13-8-26-10-39-3-7 4-12 9-18 14Zm116 0c-5-18-19-31-35-28-9 2-16 8-22 17 13-8 26-10 39-3 7 4 12 9 18 14Z" fill="url(#zomoruda-wing-sheen)" />
        <g fill="none" stroke="#fff4c9" strokeOpacity=".38" strokeWidth=".85">
          <path d="M77 50c-3-10-8-16-15-20m17 20c3-10 8-16 15-20" />
        </g>
        <path d="M77 50c-3 15-3 31 1 45" stroke="url(#zomoruda-body)" strokeWidth="4.6" />
        <path d="M77 52c-5-10-11-14-17-15m18 15c5-10 11-14 17-15" fill="none" stroke="#fff1b5" strokeWidth="1.45" />
        <ellipse cx="77" cy="49" rx="3.4" ry="3.8" fill="#fff4c9" />
        <path className="zomoruda-butterfly-glint" d="m20 20 1.3 3.6 3.7 1.3-3.7 1.2L20 30l-1.2-3.9-3.8-1.2 3.8-1.3L20 20Zm116 35 1 2.7 2.8 1-2.8.9-1 2.9-.9-2.9-2.8-.9 2.8-1L136 55Z" fill="#fff8dc" />
      </g>
    </svg>
  );
}
