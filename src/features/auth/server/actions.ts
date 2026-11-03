"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { getRequestIp, isRateLimited } from "@/lib/rate-limit";
import { createSession, destroySession } from "../session";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

const ADMIN_USERNAME = "zomoruda2026";

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ username: form.get("username"), password: form.get("password") });
  if (!parsed.success) return { error: "يرجى إدخال البيانات المطلوبة" };
  const { username, password } = parsed.data;

  try {
    const ip = await getRequestIp();
    const [ipLimited, accountLimited] = await Promise.all([
      isRateLimited("login-ip", ip, 25, 15 * 60),
      isRateLimited("login-account", username.toLowerCase(), 5, 15 * 60),
    ]);
    if (ipLimited || accountLimited) {
      return { error: "تم تجاوز حد محاولات تسجيل الدخول. يرجى المحاولة لاحقاً." };
    }
  } catch {
    return { error: "تعذر التحقق من المحاولة. يرجى إعادة المحاولة لاحقاً." };
  }

  if (!isSupabaseConfigured) {
    if (username !== ADMIN_USERNAME) return { error: "بيانات الدخول غير صحيحة" };
    if (password !== serverEnv.ADMIN_DEMO_PASSWORD) return { error: "كلمة المرور غير صحيحة التجريبية" };
    await createSession(username, "admin");
    redirect("/admin");
  }

  if (username !== ADMIN_USERNAME) return { error: "بيانات الدخول غير صحيحة" };
  const adminEmail = serverEnv.ADMIN_LOGIN_EMAIL;
  if (!adminEmail) return { error: "إعداد حساب المدير غير مكتمل. أضف ADMIN_LOGIN_EMAIL في إعدادات Vercel." };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail, password });
  if (error || !data.user) return { error: "بيانات الدخول غير صحيحة" };

  const { data: admin } = await supabaseAdmin()
    .from("admin_users")
    .select("role, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    await supabase.auth.signOut();
    return { error: "غير مصرح لك بالدخول" };
  }

  await createSession(data.user.email!, admin.role as "admin" | "staff");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  if (isSupabaseConfigured) await (await supabaseServer()).auth.signOut();
  redirect("/admin/login");
}
