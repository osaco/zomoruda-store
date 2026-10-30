import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getRequestIp, isRateLimited } from "@/lib/rate-limit";
import { hasImageSignature, isBodyTooLarge } from "@/lib/image-upload";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"]);

const MAX_UPLOADS_PER_WINDOW = 15;

/** Customer uploads (transfer receipts, photos to print) -> private "uploads" bucket. */
export async function POST(request: Request) {
  if (isBodyTooLarge(request, MAX_BYTES)) {
    return NextResponse.json({ ok: false, error: "الحجم الأقصى 4 ميجابايت" }, { status: 413 });
  }
  let ip: string;
  try {
    ip = await getRequestIp(request.headers);
    if (await isRateLimited("upload-ip", ip, MAX_UPLOADS_PER_WINDOW, 10 * 60)) {
      return NextResponse.json(
        { ok: false, error: "تم تجاوز الحد المسموح لرفع الملفات، يرجى المحاولة لاحقاً" },
        { status: 429 },
      );
    }
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر التحقق من طلب الرفع" }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kindValue = form?.get("kind");
  if (kindValue !== "receipt" && kindValue !== "photo") {
    return NextResponse.json({ ok: false, error: "نوع الملف غير صالح" }, { status: 400 });
  }
  const kind = kindValue === "receipt" ? "receipts" : "photos";
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "ملف مرفوع غير صالـح" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: "صيغة الملف غير مدعومة" }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "الحجم الأقصى 4 ميجابايت" }, { status: 400 });
  }
  if (!(await hasImageSignature(file))) {
    return NextResponse.json({ ok: false, error: "محتوى الملف لا يطابق صيغة الصورة" }, { status: 400 });
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const ext = ALLOWED_EXTS.has(rawExt) ? rawExt : "jpg";
  const path = `${kind}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, path: `demo/${path}` });
  }

  const { error } = await supabaseAdmin()
    .storage.from("uploads")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ ok: false, error: "فشل حفظ الملف المرفق" }, { status: 500 });
  return NextResponse.json({ ok: true, path });
}
