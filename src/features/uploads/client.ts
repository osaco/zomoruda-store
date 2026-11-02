"use client";

import { scaleImageDimensions } from "./image-sizing";

export const MAX_UPLOAD_MB = 4;
export const MAX_CUSTOM_UPLOAD_SOURCE_MB = 15;
export const MAX_PRODUCT_SOURCE_MB = 15;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const MAX_CUSTOM_UPLOAD_SOURCE_BYTES = MAX_CUSTOM_UPLOAD_SOURCE_MB * 1024 * 1024;
const MAX_PRODUCT_SOURCE_BYTES = MAX_PRODUCT_SOURCE_MB * 1024 * 1024;

const IMAGE_PRESETS = {
  productMain: { maxDimension: 1600, minDimension: 1200, startQuality: 0.8, targetBytes: 150 * 1024 },
  productGallery: { maxDimension: 1000, minDimension: 800, startQuality: 0.78, targetBytes: 120 * 1024 },
  category: { maxDimension: 600, minDimension: 400, startQuality: 0.75, targetBytes: 40 * 1024 },
  banner: { maxDimension: 1920, minDimension: 1600, startQuality: 0.78, targetBytes: 250 * 1024 },
} as const;

function validateImageType(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("صيغة الصورة غير مدعومة");
  if (file.size <= 0) throw new Error("ملف الصورة فارغ");
}

/** Uploads an image (receipt or print photo) and returns its storage path. */
export async function uploadImage(file: File, kind: "receipt" | "photo"): Promise<string> {
  validateImageType(file);
  if (file.size > MAX_CUSTOM_UPLOAD_SOURCE_BYTES) {
    throw new Error(`الحد الأقصى للصورة الأصلية ${MAX_CUSTOM_UPLOAD_SOURCE_MB} ميجابايت`);
  }
  let uploadFile: Blob = file;
  let filename = file.name;
  const isHeic = file.type === "image/heic" || file.type === "image/heif";
  if (file.size > 1024 * 1024 || isHeic) {
    const preset = kind === "receipt"
      ? { maxDimension: 1600, targetBytes: 600 * 1024, startQuality: 0.82 }
      : { maxDimension: 2400, targetBytes: 1536 * 1024, startQuality: 0.84 };
    try {
      uploadFile = await optimizeImage(file, preset);
      const ext = uploadFile.type === "image/webp" ? "webp" : "jpg";
      filename = `${file.name.replace(/\.[^.]+$/u, "") || "image"}.${ext}`;
    } catch (error) {
      if (!(error instanceof ImageDecodeError)) throw error;
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("تعذّر قراءة الصورة. جرّبي حفظها بصيغة JPG ثم ارفعيها مرة أخرى");
      }
    }
  }
  if (uploadFile.size > MAX_UPLOAD_BYTES) {
    throw new Error("تعذّر ضغط الصورة إلى الحجم المطلوب. جرّبي صورة أصغر أو أقل دقة.");
  }
  const body = new FormData();
  body.set("file", uploadFile, filename);
  body.set("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = (await res.json()) as { ok: boolean; path?: string; error?: string };
  if (!json.ok || !json.path) throw new Error(json.error ?? "تعذّر رفع الصورة");
  return json.path;
}

/** Uploads a resized WebP product, category, or banner image. */
export async function uploadProductImage(file: File, variant: "main" | "gallery"): Promise<string> {
  return uploadOptimizedImage(file, variant === "main" ? "productMain" : "productGallery");
}

export async function uploadAdminImage(file: File, kind: "category" | "banner"): Promise<string> {
  return uploadOptimizedImage(file, kind);
}

async function uploadOptimizedImage(file: File, preset: keyof typeof IMAGE_PRESETS): Promise<string> {
  validateImageType(file);
  if (file.size <= 0 || file.size > MAX_PRODUCT_SOURCE_BYTES) {
    throw new Error(`الحد الأقصى للصورة الأصلية ${MAX_PRODUCT_SOURCE_MB} ميجابايت`);
  }

  const optimized = await optimizeImage(file, IMAGE_PRESETS[preset]);
  const body = new FormData();
  const ext = optimized.type === "image/webp" ? "webp" : "jpg";
  body.set("file", optimized, `${file.name.replace(/\.[^.]+$/u, "") || "image"}.${ext}`);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
  if (!json.ok || !json.url) throw new Error(json.error ?? "تعذّر رفع الصورة");
  return json.url;
}

async function optimizeImage(
  file: File,
  preset: { maxDimension: number; targetBytes: number; startQuality: number; minDimension?: number },
): Promise<Blob> {
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
      throw new ImageDecodeError();
    });
    source = image;
    sourceWidth = image.naturalWidth;
    sourceHeight = image.naturalHeight;
  }

  try {
    const sourceMaxDimension = Math.max(sourceWidth, sourceHeight);
    let dimension = Math.min(sourceMaxDimension, preset.maxDimension);
    const minimumDimension = Math.min(sourceMaxDimension, preset.minDimension ?? 1);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("المتصفح لا يدعم تحسين الصور");

    const render = async (maxDimension: number, quality: number) => {
      const dimensions = scaleImageDimensions(sourceWidth, sourceHeight, maxDimension);
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      return encodeImage(canvas, quality);
    };

    const qualities = [preset.startQuality, preset.startQuality - 0.05, preset.startQuality - 0.1];
    let optimized: Blob | undefined;
    while (dimension >= minimumDimension) {
      for (const quality of qualities) {
        const candidate = await render(dimension, quality);
        optimized = candidate;
        if (candidate.size <= preset.targetBytes) return candidate;
      }
      if (dimension === minimumDimension || dimension < minimumDimension) break;
      dimension = Math.max(minimumDimension, Math.round(dimension * 0.85));
    }
    if (optimized) return optimized;
    throw new Error("تعذّر ضغط الصورة");
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

class ImageDecodeError extends Error {
  constructor() {
    super("Image decoding failed");
    this.name = "ImageDecodeError";
  }
}

function encodeImage(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (webpBlob) => {
        if (webpBlob?.type === "image/webp") return resolve(webpBlob);
        canvas.toBlob(
          (jpegBlob) => jpegBlob?.type === "image/jpeg" ? resolve(jpegBlob) : reject(new Error("تعذّر ضغط الصورة")),
          "image/jpeg",
          quality,
        );
      },
      "image/webp",
      quality,
    );
  });
}
