import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/features/auth/session";

/** Product image upload (admin only) -> public "products" bucket, returns a public URL. */
export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "اختاري صورة" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ ok: false, error: "الحد الأقصى 8 ميغا" }, { status: 400 });
  if (!isSupabaseConfigured)
    return NextResponse.json({ ok: false, error: "رفع الصور يحتاج Supabase. ضعي رابط صورة مباشرة في الوضع التجريبي." }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const storage = supabaseAdmin().storage.from("products");
  const { error } = await storage.upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (error) return NextResponse.json({ ok: false, error: "تعذّر الرفع" }, { status: 500 });
  return NextResponse.json({ ok: true, url: storage.getPublicUrl(path).data.publicUrl });
}
