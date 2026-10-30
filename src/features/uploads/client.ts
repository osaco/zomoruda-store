"use client";

export const MAX_UPLOAD_MB = 4;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

function validateImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("صيغة الصورة غير مدعومة");
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) throw new Error(`الحد الأقصى ${MAX_UPLOAD_MB} ميجابايت`);
}

/** Uploads an image (receipt or print photo) and returns its storage path. */
export async function uploadImage(file: File, kind: "receipt" | "photo"): Promise<string> {
  validateImage(file);
  const body = new FormData();
  body.set("file", file);
  body.set("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = (await res.json()) as { ok: boolean; path?: string; error?: string };
  if (!json.ok || !json.path) throw new Error(json.error ?? "تعذّر رفع الصورة");
  return json.path;
}

/** Uploads a product image and returns its public storage URL. */
export async function uploadProductImage(file: File): Promise<string> {
  validateImage(file);
  const body = new FormData();
  body.set("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
  if (!json.ok || !json.url) throw new Error(json.error ?? "تعذّر رفع الصورة");
  return json.url;
}
