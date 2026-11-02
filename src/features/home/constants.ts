/**
 * Store voice — every user-facing string on the home page lives here.
 *
 * The tone is short, warm and specific ("هدية تُشبه من تُهديها"). No generic
 * marketing filler. Editing copy must never require touching a component.
 *
 * Anything that is genuinely store *data* (address, phone, payment, hours)
 * comes from settings/site instead — never duplicate it here.
 */

export const homeCopy = {
  /* Hero */
  hero: {
    eyebrow: "غزة — الرمال، مفترق البلميرا",
    wordmark: "زُمُرّدة",
    lead: "هدية تُشبه من تُهديها، تصل مغلّفة بعناية.",
    cta: "اختر مناسبتك",
    note: "طلبك يُحفظ ثم يصلنا على واتساب",
  },

  /* Editorial statement */
  statement: {
    before: "لسنا نبيع أشياء. نحن نجمع ",
    emphasis: "كلمة طيبة",
    after: " في علبة، ونوصلها في موعدها.",
  },

  /* Occasions index */
  occasions: {
    index: "المناسبات",
    hint: "اختر ما يناسب القلب",
    fallbackName: "بلا مناسبة",
  },

  /* Featured pieces */
  pieces: {
    index: "مختارات",
    all: "كل المنتجات",
    unavailable: "غير متوفر",
    empty: "نضيف قطعاً جديدة كل أسبوع. تصفّح كل المنتجات في الأثناء.",
  },

  /* How it works */
  steps: {
    index: "كيف تطلب",
    hint: "بلا تعقيد",
    items: [
      { title: "اختر", body: "تصفّحي المناسبات واختاري الهدية وخياراتها." },
      { title: "أكمل الطلب", body: "الاسم والمنطقة وطريقة الدفع: كاش أو تحويل." },
      { title: "واتساب", body: "يصلنا طلبك مرتّباً ونؤكّده معك مباشرة." },
    ],
  },

  /* Footer */
  footer: {
    wordmark: "زُمُرّدة",
    payments: "كاش عند الاستلام · أو تحويل مع إيصال",
    whatsapp: "واتساب المتجر",
  },
} as const;

/** Arabic-Indic numerals (٠١، ٠٢…) used by the editorial index rows. */
const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/**
 * Formats a 1-based index as a two-digit Arabic-Indic numeral.
 * 1 -> "٠١", 12 -> "١٢". Non-positive or non-finite input falls back to "٠١".
 */
export function arabicIndex(n: number): string {
  const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  return String(safe)
    .padStart(2, "0")
    .split("")
    .map((d) => ARABIC_INDIC[Number(d)] ?? d)
    .join("");
}

/**
 * Formats a count as Arabic-Indic numerals without zero padding.
 * 3 -> "٣". Used for the "how it works" step numbers.
 */
export function arabicNumber(n: number): string {
  const safe = Number.isFinite(n) ? Math.floor(Math.abs(n)) : 0;
  return String(safe)
    .split("")
    .map((d) => ARABIC_INDIC[Number(d)] ?? d)
    .join("");
}
