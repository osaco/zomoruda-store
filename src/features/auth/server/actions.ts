"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { createSession, destroySession } from "../session";

const MAX_LOGIN_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
    return false;
  }
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return true;
  }
  record.count++;
  return false;
}

const loginSchema = z.object({ email: z.string().trim().optional(), password: z.string().min(1) });

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const emailVal = form.get("email")?.toString().trim() || "global";
  if (isRateLimited(emailVal)) {
    return { error: "تم تجاوز حد محاولات تسجيل الدخول (5 محاولات كل 15 دقيقة). يرجى المحاولة لاحقاً." };
  }

  const parsed = loginSchema.safeParse({ email: form.get("email") ?? undefined, password: form.get("password") });
  if (!parsed.success) return { error: "يرجى إدخال البيانات المطلوبة" };
  const { email, password } = parsed.data;

  if (!isSupabaseConfigured) {
    if (password !== serverEnv.ADMIN_DEMO_PASSWORD) return { error: "كلمة المرور غير صحيحة التجريبية" };
    await createSession(email || "demo@zomoruda", "admin");
    redirect("/admin");
  }

  if (!email) return { error: "البريد الإلكتروني مطلوب للحسابات" };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "بيانات الدخول غير صحيحة" };

  const { data: admin } = await supabaseAdmin()
    .from("admin_users")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin || !admin.is_active) return { error: "غير مصرح لك بالدخول" };

  await createSession(data.user.email!, admin.role as "admin" | "staff");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
