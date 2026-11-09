import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/types/enums";
import { env, isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sign, verify } from "@/lib/signing";

export const SESSION_COOKIE = "zm_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const DEFAULT_ADMIN_USERNAME = "zomoruda2026";

export type AdminSession = { email: string; role: AdminRole; exp: number; authProvider?: "supabase" | "standalone" };

/** The same username must be used at login time and when validating a cookie. */
export function getStandaloneAdminUsername() {
  return serverEnv.ADMIN_LOGIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
}

const deactivatedUsers = new Set<string>();

export function deactivateUser(email: string) {
  deactivatedUsers.add(email.trim().toLowerCase());
}

export function activateUser(email: string) {
  deactivatedUsers.delete(email.trim().toLowerCase());
}

export async function createSession(email: string, role: AdminRole, authProvider: AdminSession["authProvider"] = "supabase") {
  const payload = Buffer.from(JSON.stringify({ email, role, authProvider, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AdminSession | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !verify(payload, signature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession;
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}

/** Returns a currently authorized admin session without redirects or cookie mutation. */
export async function getActiveSession(): Promise<AdminSession | null> {
  const session = await getSession();
  if (!session) return null;

  if (deactivatedUsers.has(session.email.trim().toLowerCase())) return null;

  if (session.authProvider === "standalone") {
    if (session.role !== "admin" || session.email !== getStandaloneAdminUsername()) return null;
    return session;
  }

  if (isSupabaseConfigured && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data: admin, error } = await supabaseAdmin()
        .from("admin_users")
        .select("role, is_active")
        .eq("email", session.email)
        .maybeSingle();

      if (error || !admin || !admin.is_active || (admin.role !== "admin" && admin.role !== "staff")) return null;
      return { ...session, role: admin.role };
    } catch {
      return null;
    }
  }

  return session;
}

/** Guard for admin pages and actions. Staff can't reach admin-only areas. */
export async function requireAdmin(role: AdminRole = "staff"): Promise<AdminSession> {
  const session = await getActiveSession();
  if (!session) redirect("/admin/login");
  if (role === "admin" && session.role !== "admin") redirect("/admin?denied=1");
  return session;
}
