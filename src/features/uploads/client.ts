"use client";

export const MAX_UPLOAD_MB = 4;
export const MAX_PRODUCT_SOURCE_MB = 15;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const MAX_PRODUCT_SOURCE_BYTES = MAX_PRODUCT_SOURCE_MB * 1024 * 1024;
const PRODUCT_IMAGE_TARGET_BYTES = 300 * 1024;
const PRODUCT_IMAGE_MAX_DIMENSION = 1600;

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
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("صيغة الصورة غير مدعومة");
  if (file.size <= 0 || file.size > MAX_PRODUCT_SOURCE_BYTES) {
    throw new Error(`الحد الأقصى للصورة الأصلية ${MAX_PRODUCT_SOURCE_MB} ميجابايت`);
  }

  const optimized = await optimizeProductImage(file);
  const body = new FormData();
  body.set("file", optimized, `${file.name.replace(/\.[^.]+$/u, "") || "product"}.webp`);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
  if (!json.ok || !json.url) throw new Error(json.error ?? "تعذّر رفع الصورة");
  return json.url;
}

async function optimizeProductImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap | undefined;
  let objectUrl: string | undefined;
  let source: CanvasImageSource;
  let sourceWidth: number;
  let sourceHeight: number;

  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    source = bitmap;
    sourceWidth = bitmap.width;
    sourceHeight = bitmap.height;
  } catch {
    objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = objectUrl;
    await image.decode().catch(() => {
      throw new Error("تعذّر قراءة الصورة. جرّبي حفظها بصيغة JPG أو PNG ثم ارفعيها مرة أخرى.");
    });
    source = image;
    sourceWidth = image.naturalWidth;
    sourceHeight = image.naturalHeight;
  }

  try {
    let scale = Math.min(1, PRODUCT_IMAGE_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("المتصفح لا يدعم تحسين الصور");

    const render = async (dimensionScale: number) => {
      canvas.width = Math.max(1, Math.round(sourceWidth * dimensionScale));
      canvas.height = Math.max(1, Math.round(sourceHeight * dimensionScale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      return encodeWebp(canvas, 0.84);
    };

    let optimized = await render(scale);
    if (optimized.size > PRODUCT_IMAGE_TARGET_BYTES) optimized = await encodeWebp(canvas, 0.74);
    if (optimized.size > PRODUCT_IMAGE_TARGET_BYTES && Math.max(canvas.width, canvas.height) > 1280) {
      scale *= 1280 / Math.max(canvas.width, canvas.height);
      optimized = await render(scale);
      if (optimized.size > PRODUCT_IMAGE_TARGET_BYTES) optimized = await encodeWebp(canvas, 0.74);
    }
    return optimized;
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function encodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("تعذّر ضغط الصورة"));
        if (blob.type !== "image/webp") return reject(new Error("المتصفح لا يدعم صيغة WebP. جرّبي متصفحاً أحدث."));
        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}
