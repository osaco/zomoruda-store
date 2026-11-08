type BotanicalDividerProps = {
  className?: string;
};

/** A quiet botanical divider for the store's classic gift-shop presentation. */
export function BotanicalDivider({ className = "" }: BotanicalDividerProps) {
  return (
    <div className={`wrap py-9 sm:py-12 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 720 104" className="mx-auto block h-auto w-full max-w-[460px]" focusable="false">
        <g fill="none" stroke="#6a4a86" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35">
          <path d="M28 55h253c26 0 43-4 79-19 36-15 53-19 79-19h253" opacity=".58" />
          <path d="M360 36v39" opacity=".58" />
          <path d="M338 47c-20-22-46-25-61-11 15 16 40 22 61 11Z" fill="#e7daf1" />
          <path d="M382 47c20-22 46-25 61-11-15 16-40 22-61 11Z" fill="#e7daf1" />
          <path d="M328 63c-19 16-43 16-55 2 17-10 38-8 55-2Z" fill="#c7addd" />
          <path d="M392 63c19 16 43 16 55 2-17-10-38-8-55-2Z" fill="#c7addd" />
          <path d="M260 55c-16-21-35-26-48-15 13 14 31 19 48 15Zm200 0c16-21 35-26 48-15-13 14-31 19-48 15Z" />
        </g>
        <circle cx="360" cy="55" r="4" fill="#c9a24a" />
      </svg>
    </div>
  );
}
