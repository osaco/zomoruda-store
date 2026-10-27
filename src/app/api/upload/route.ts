import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Customer uploads (transfer receipts, photos to print) -> private "uploads" bucket. */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind") === "receipt" ? "receipts" : "photos";
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "لم يتم اختيار ملف" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: "نوع الصورة غير مدعوم" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "الحد الأقصى 5 ميغا" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${kind}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

  if (!isSupabaseConfigured) {
    // Demo mode: nothing is stored, but the flow works end to end.
    return NextResponse.json({ ok: true, path: `demo/${path}` });
  }

  const { error } = await supabaseAdmin()
    .storage.from("uploads")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ ok: false, error: "تعذّر رفع الصورة" }, { status: 500 });
  return NextResponse.json({ ok: true, path });
}
