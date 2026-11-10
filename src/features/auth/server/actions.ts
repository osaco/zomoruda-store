"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { supabaseServer } from "@/lib/supabase/server";
import { getRequestIp, isRateLimited } from "@/lib/rate-limit";
import { createSession, destroySession, getSession, getStandaloneAdminUsername } from "../session";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

export type LoginState = { error?: string };

function matchesSecret(value: string, expected: string) {
  const actualBytes = Buffer.from(value);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ username: form.get("username"), password: form.get("password") });
  if (!parsed.success) return { error: "يرجى إدخال البيانات المطلوبة" };
  const { username, password } = parsed.data;

  const expectedUsername = getStandaloneAdminUsername();
  const expectedPassword = serverEnv.ADMIN_LOGIN_PASSWORD ?? serverEnv.ADMIN_DEMO_PASSWORD;
  if (!expectedPassword) {
    return { error: "أضف ADMIN_LOGIN_PASSWORD أو ADMIN_DEMO_PASSWORD في إعدادات Production على Vercel." };
  }

  try {
    const ip = await getRequestIp();
    if (await isRateLimited("login-ip", ip, 25, 15 * 60)) {
      return { error: "تم تجاوز حد محاولات تسجيل الدخول. يرجى المحاولة لاحقاً." };
    }
    const usernameMatches = matchesSecret(username, expectedUsername);
    if (usernameMatches && (await isRateLimited("login-account", expectedUsername.toLowerCase(), 10, 15 * 60))) {
      return { error: "تم تجاوز حد محاولات تسجيل الدخول لهذا الحساب. يرجى المحاولة لاحقاً." };
    }
  } catch {
    return { error: "تعذر التحقق من المحاولة. يرجى إعادة المحاولة لاحقاً." };
  }

  if (!matchesSecret(username, expectedUsername) || !matchesSecret(password, expectedPassword)) {
    return { error: "بيانات الدخول غير صحيحة" };
  }

  await createSession(expectedUsername, "admin", "standalone");
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  await destroySession();
  if (isSupabaseConfigured && session?.authProvider !== "standalone") await (await supabaseServer()).auth.signOut();
  redirect("/admin/login");
}
