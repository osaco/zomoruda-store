import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/server-env";

/** HMAC-SHA256 signature (base64url) for short tamper-proof tokens. */
export function sign(value: string): string {
  return createHmac("sha256", serverEnv.AUTH_SECRET).update(value).digest("base64url");
}

export function verify(value: string, signature: string | undefined | null): boolean {
  if (!signature) return false;
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
