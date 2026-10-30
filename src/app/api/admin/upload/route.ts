import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/features/auth/session";
import { getRequestIp, isRateLimited } from "@/lib/rate-limit";
import { hasImageSignature, isBodyTooLarge } from "@/lib/image-upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"]);
const MAX_BYTES = 4 * 1024 * 1024;

/** Product image upload (admin only) -> public "products" bucket, returns a public URL. */
export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  if (isBodyTooLarge(request, MAX_BYTES)) {
    return NextResponse.json({ ok: false, error: "الحجم الأقصى 4 ميجابايت" }, { status: 413 });
  }
  try {
    const ip = await getRequestIp(request.headers);
    if (await isRateLimited("admin-upload-ip", ip, 60, 10 * 60)) {
      return NextResponse.json({ ok: false, error: "تم تجاوز حد رفع الصور" }, { status: 429 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر التحقق من طلب الرفع" }, { status: 503 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "ملف غير صالـح أو صيغة غير مدعومة" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "الحجم الأقصى 4 ميجابايت" }, { status: 400 });
  }
  if (!(await hasImageSignature(file))) {
    return NextResponse.json({ ok: false, error: "محتوى الملف لا يطابق صيغة الصورة" }, { status: 400 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { ok: false, error: "وضع العرض فقط: يتطلب Supabase. قم بتهيئة بيانات الاعتماد للرفع" },
      { status: 503 },
    );
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const ext = ALLOWED_EXTS.has(rawExt) ? rawExt : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const storage = supabaseAdmin().storage.from("products");
  const { error } = await storage.upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ ok: false, error: "فشل الرفع" }, { status: 500 });
  return NextResponse.json({ ok: true, url: storage.getPublicUrl(path).data.publicUrl });
}
