import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/features/auth/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"]);

/** Product image upload (admin only) -> public "products" bucket, returns a public URL. */
export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "ملف غير صالـح أو صيغة غير مدعومة" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "الحجم الأقصى 8 ميجابايت" }, { status: 400 });
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
