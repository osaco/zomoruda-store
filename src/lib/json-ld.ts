/**
 * Serializes structured data for a <script type="application/ld+json"> tag.
 *
 * JSON.stringify alone is not safe inside HTML: a product name containing
 * "</script>" would close the element and allow injected markup. Escape the
 * characters that can terminate or confuse the script context.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
