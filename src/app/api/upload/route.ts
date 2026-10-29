import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

const WINDOW_MS = 10 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 15;
const uploadLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (uploadLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_UPLOADS_PER_WINDOW) {
    uploadLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  uploadLog.set(ip, recent);
  return false;
}

/** Customer uploads (transfer receipts, photos to print) -> private "uploads" bucket. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "تم تجاوز الحد المسموح لرفع الملفات، يرجى المحاولة لاحقاً" },
      { status: 429 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind") === "receipt" ? "receipts" : "photos";
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "ملف مرفوع غير صالـح" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: "صيغة الملف غير مدعومة" }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "الحجم الأقصى 5 ميجابايت" }, { status: 400 });
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
