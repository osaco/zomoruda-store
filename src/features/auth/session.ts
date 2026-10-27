import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/types/enums";
import { sign, verify } from "@/lib/signing";

export const SESSION_COOKIE = "zm_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = { email: string; role: AdminRole; exp: number };

export async function createSession(email: string, role: AdminRole) {
  const payload = Buffer.from(JSON.stringify({ email, role, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
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

/** Guard for admin pages and actions. Staff can't reach admin-only areas. */
export async function requireAdmin(role: AdminRole = "staff"): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (role === "admin" && session.role !== "admin") redirect("/admin?denied=1");
  return session;
}
