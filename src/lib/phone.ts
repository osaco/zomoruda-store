/**
 * Palestinian mobile numbers: Jawwal (059x) and Ooredoo (056x).
 * Accepts 059xxxxxxx, 59xxxxxxx, +970/00970/+972 prefixes, spaces and dashes.
 * Normalizes to the local 10-digit form "059xxxxxxx".
 */
export function normalizePsPhone(input: string): string | null {
  const digits = input
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\d+]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "");
  const local = digits.replace(/^(970|972)/, "").replace(/^0?/, "0");
  return /^05[69]\d{7}$/.test(local) ? local : null;
}

export function isValidPsPhone(input: string): boolean {
  return normalizePsPhone(input) !== null;
}

/** "0599123456" -> "970599123456" for wa.me links. */
export function toInternational(local: string): string {
  return `970${local.replace(/^0/, "")}`;
}
