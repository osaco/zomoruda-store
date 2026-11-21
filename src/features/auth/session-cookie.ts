import type { AdminRole } from "@/types/enums";
import { serverEnv } from "@/lib/server-env";
import { sign, verify } from "@/lib/signing";

export type AdminSessionCookie = {
  email: string;
  role: AdminRole;
  exp: number;
  credentialVersion?: string;
  authProvider?: "supabase" | "standalone";
};

/** Parse and authenticate the cookie before either Proxy or a server handler trusts it. */
export function parseAdminSessionCookie(raw: string | null | undefined): AdminSessionCookie | null {
  if (!raw) return null;
  const [payload, signature, extra] = raw.split(".");
  if (!payload || !signature || extra !== undefined || !verify(payload, signature)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as Partial<AdminSessionCookie>;
    if (
      (value.authProvider === "standalone" && value.credentialVersion !== sign("admin-credential:" + (serverEnv.ADMIN_LOGIN_PASSWORD ?? serverEnv.ADMIN_DEMO_PASSWORD))) ||
      typeof value.email !== "string" ||
      (value.role !== "admin" && value.role !== "staff") ||
      typeof value.exp !== "number" ||
      !Number.isFinite(value.exp) ||
      value.exp <= Date.now() ||
      (value.authProvider !== undefined && value.authProvider !== "supabase" && value.authProvider !== "standalone")
    ) return null;
    return value as AdminSessionCookie;
  } catch {
    return null;
  }
}
