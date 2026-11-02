import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/features/auth/session";

/** Opens a private customer upload (receipt / photo) through a 5-minute signed URL. */
export async function GET(request: Request) {
  if (!(await getSession())) return new Response("غير مصرح", { status: 401 });
  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!isSupabaseConfigured || path.startsWith("demo/")) return new Response("الملف غير متاح في الوضع التجريبي", { status: 404 });
  const { data, error } = await supabaseAdmin().storage.from("uploads").createSignedUrl(path, 300);
  if (error || !data) return new Response("الملف غير موجود", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
