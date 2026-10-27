import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { getRepos } from "@/lib/data";

/**
 * Daily Vercel cron. A tiny query keeps the free Supabase project from
 * being paused for inactivity.
 */
export async function GET(request: Request) {
  if (serverEnv.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!isSupabaseConfigured) return NextResponse.json({ ok: true, mode: "demo" });
  const zones = await getRepos().zones.list();
  return NextResponse.json({ ok: true, mode: "supabase", zones: zones.length, at: new Date().toISOString() });
}
