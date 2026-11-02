export function isBodyTooLarge(request: Request, maxFileBytes: number): boolean {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  if (!/^\d+$/.test(raw)) return true;
  // Allow a small amount for multipart headers and boundaries.
  return Number(raw) > maxFileBytes + 64 * 1024;
}

export async function hasImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return ascii(0, 8) === "\x89PNG\r\n\x1a\n";
  if (file.type === "image/webp") return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
  if (["image/avif", "image/heic", "image/heif"].includes(file.type)) {
    if (ascii(4, 8) !== "ftyp") return false;
    const brand = ascii(8, 12);
    return /^(avif|avis|heic|heix|hevc|hevx|mif1|msf1)$/u.test(brand);
  }
  return false;
}
