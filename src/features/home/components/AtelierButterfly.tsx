type AtelierButterflyProps = {
  className?: string;
};

/**
 * A softly glowing butterfly used as a brand ornament. It replaces the old
 * scroll-tracked line drawing so the mark feels deliberate and classic.
 */
export function AtelierButterfly({ className = "" }: AtelierButterflyProps) {
  return (
    <svg viewBox="0 0 156 128" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="zomoruda-wing-l" cx="70%" cy="28%" r="86%">
          <stop offset="0" stopColor="#fff9de" />
          <stop offset=".34" stopColor="#e7c76f" />
          <stop offset=".68" stopColor="#aa7bc7" />
          <stop offset="1" stopColor="#4e2e75" />
        </radialGradient>
        <radialGradient id="zomoruda-wing-r" cx="30%" cy="28%" r="86%">
          <stop offset="0" stopColor="#fff9de" />
          <stop offset=".34" stopColor="#e7c76f" />
          <stop offset=".68" stopColor="#aa7bc7" />
          <stop offset="1" stopColor="#4e2e75" />
        </radialGradient>
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
        <path d="M78 62C67 33 47 13 26 18 6 23 8 49 25 63c13 11 32 12 52 5Z" fill="url(#zomoruda-wing-l)" stroke="#f8e7a7" strokeOpacity=".78" strokeWidth="1.15" />
        <path d="M77 64C54 63 33 72 31 91c-2 18 17 26 32 17 12-8 16-26 14-44Z" fill="url(#zomoruda-wing-l)" stroke="#f8e7a7" strokeOpacity=".62" strokeWidth="1.15" />
        <path d="M79 62c11-29 31-49 52-44 20 5 18 31 1 45-13 11-32 12-52 5Z" fill="url(#zomoruda-wing-r)" stroke="#f8e7a7" strokeOpacity=".78" strokeWidth="1.15" />
        <path d="M80 64c23-1 44 8 46 27 2 18-17 26-32 17-12-8-16-26-14-44Z" fill="url(#zomoruda-wing-r)" stroke="#f8e7a7" strokeOpacity=".62" strokeWidth="1.15" />
        <g fill="none" stroke="#fff4c9" strokeOpacity=".38" strokeWidth=".85">
          <path d="M77 63 30 29M77 63 25 48M78 64 42 90M79 63l47-34M79 63l52-15M78 64l36 26" />
        </g>
        <path d="M77 50c-3 15-3 31 1 45" stroke="url(#zomoruda-body)" strokeWidth="4.6" />
        <path d="M77 52c-5-10-11-14-17-15m18 15c5-10 11-14 17-15" fill="none" stroke="#fff1b5" strokeWidth="1.45" />
        <ellipse cx="77" cy="49" rx="3.4" ry="3.8" fill="#fff4c9" />
      </g>
    </svg>
  );
}
