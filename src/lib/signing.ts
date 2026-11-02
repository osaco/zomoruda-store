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

const ORDER_ACCESS_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000;

/** Short-lived access token for the post-checkout confirmation page. */
export function signOrderAccessToken(orderNumber: string, now = Date.now()): string {
  const expiresAt = now + ORDER_ACCESS_TOKEN_TTL;
  const signature = createHmac("sha256", serverEnv.AUTH_SECRET)
    .update(`${orderNumber}.${expiresAt}`)
    .digest("base64url");
  return `${expiresAt}.${signature}`;
}

export function verifyOrderAccessToken(orderNumber: string, token: string | undefined | null, now = Date.now()): boolean {
  if (!token) return false;
  const [expiresAtText, signature, extra] = token.split(".");
  if (extra !== undefined || !/^\d{13}$/u.test(expiresAtText) || !signature) return false;
  const expiresAt = Number(expiresAtText);
  if (expiresAt <= now || expiresAt > now + ORDER_ACCESS_TOKEN_TTL + 60_000) return false;
  const expected = Buffer.from(
    createHmac("sha256", serverEnv.AUTH_SECRET).update(`${orderNumber}.${expiresAt}`).digest("base64url"),
  );
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
