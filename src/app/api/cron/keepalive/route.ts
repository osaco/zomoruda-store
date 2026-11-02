import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { getRepos } from "@/lib/data";

/**
 * Daily Vercel cron. A tiny query keeps the free Supabase project from
 * being paused for inactivity.
 */
export async function GET(request: Request) {
  if (
    (process.env.NODE_ENV === "production" && !serverEnv.CRON_SECRET) ||
    (serverEnv.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${serverEnv.CRON_SECRET}`)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!isSupabaseConfigured) return NextResponse.json({ ok: true, mode: "demo" });
  const repos = getRepos();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const staleNewOrders = await repos.orders.all({ status: "new", to: cutoff });
  let cancelled = 0;
  for (const order of staleNewOrders) {
    const updated = await repos.orders.updateStatus(order.id, "cancelled", "إلغاء تلقائي بعد مرور 24 ساعة دون تأكيد الطلب", "system:order-expiration");
    if (updated?.status === "cancelled") cancelled += 1;
  }
  const zones = await repos.zones.list();
  return NextResponse.json({ ok: true, mode: "supabase", zones: zones.length, expiredOrders: cancelled, at: new Date().toISOString() });
}
