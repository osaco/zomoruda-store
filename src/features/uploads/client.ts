"use client";

export const MAX_UPLOAD_MB = 5;

/** Uploads an image (receipt or print photo) and returns its storage path. */
export async function uploadImage(file: File, kind: "receipt" | "photo"): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("الملف يجب أن يكون صورة");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`الحد الأقصى ${MAX_UPLOAD_MB} ميغا`);
  const body = new FormData();
  body.set("file", file);
  body.set("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = (await res.json()) as { ok: boolean; path?: string; error?: string };
  if (!json.ok || !json.path) throw new Error(json.error ?? "تعذّر رفع الصورة");
  return json.path;
}
