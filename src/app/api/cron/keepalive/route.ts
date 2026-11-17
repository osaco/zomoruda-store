import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { getRepos } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase/admin";

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

/**
 * Daily Vercel cron. A tiny query keeps the free Supabase project from
 * being paused for inactivity.
 */
export async function GET(request: Request) {
  const expectedAuthorization = serverEnv.CRON_SECRET ? `Bearer ${serverEnv.CRON_SECRET}` : "";
  const authorization = request.headers.get("authorization") ?? "";
  if (
    (process.env.NODE_ENV === "production" && !serverEnv.CRON_SECRET) ||
    (serverEnv.CRON_SECRET && !constantTimeEqual(authorization, expectedAuthorization))
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!isSupabaseConfigured) return NextResponse.json({ ok: true, mode: "demo" });
  try {
    const [{ data: expiredOrders, error }, zones] = await Promise.all([
      supabaseAdmin().rpc("expire_unconfirmed_orders"),
      getRepos().zones.list(),
    ]);
    if (error) throw error;
    return NextResponse.json({
      ok: true,
      mode: "supabase",
      zones: zones.length,
      expiredOrders: Number(expiredOrders ?? 0),
      at: new Date().toISOString(),
    });
  } catch {
    console.error("[cron] Keepalive or order expiry failed");
    return NextResponse.json({ ok: false, error: "تعذر إكمال مهمة الصيانة" }, { status: 503 });
  }
}
