import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { supabaseAdmin } from "@/lib/supabase/admin";

type LocalLimit = { startedAt: number; hits: number };
const localLimits = new Map<string, LocalLimit>();
let lastCleanup = 0;

/** Get the client address from the platform proxy headers; never use the raw value as a storage key. */
export async function getRequestIp(requestHeaders?: Headers): Promise<string> {
  let source = requestHeaders;
  if (!source) {
    try {
      source = await headers();
    } catch {
      return "local";
    }
  }
  const forwarded = source.get("x-vercel-forwarded-for") ?? source.get("x-forwarded-for") ?? source.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim().slice(0, 128) || "unknown";
}

/**
 * Uses an atomic Postgres counter on hosted deployments and a bounded in-memory
 * fallback for the local demo. Returns true when the request must be rejected.
 */
export async function isRateLimited(scope: string, subject: string, maxHits: number, windowSeconds: number): Promise<boolean> {
  const key = createHmac("sha256", serverEnv.AUTH_SECRET)
    .update(`${scope}:${subject.trim().toLowerCase()}`)
    .digest("hex");

  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await supabaseAdmin().rpc("consume_request_rate_limit", {
      p_key_hash: key,
      p_max_hits: maxHits,
      p_window_seconds: windowSeconds,
    });
    if (error) throw new Error(`Rate limit check failed: ${error.message}`);
    return data !== true;
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = localLimits.get(key);
  const current = !existing || now - existing.startedAt >= windowMs ? { startedAt: now, hits: 0 } : existing;
  current.hits += 1;
  localLimits.set(key, current);

  if (now - lastCleanup > 60_000) {
    for (const [storedKey, entry] of localLimits) {
      if (now - entry.startedAt >= windowMs * 2) localLimits.delete(storedKey);
    }
    lastCleanup = now;
  }
  while (localLimits.size > 10_000) {
    const oldestKey = localLimits.keys().next().value as string | undefined;
    if (oldestKey === undefined) break;
    localLimits.delete(oldestKey);
  }
  return current.hits > maxHits;
}
