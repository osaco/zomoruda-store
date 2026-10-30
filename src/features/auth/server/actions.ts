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
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email().max(254).optional(),
  ),
  password: z.string().min(1).max(256),
});

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: form.get("email") ?? undefined, password: form.get("password") });
  if (!parsed.success) return { error: "يرجى إدخال البيانات المطلوبة" };
  const { email, password } = parsed.data;

  try {
    const ip = await getRequestIp();
    const [ipLimited, accountLimited] = await Promise.all([
      isRateLimited("login-ip", ip, 25, 15 * 60),
      isRateLimited("login-account", email ?? ip, 5, 15 * 60),
    ]);
    if (ipLimited || accountLimited) {
      return { error: "تم تجاوز حد محاولات تسجيل الدخول. يرجى المحاولة لاحقاً." };
    }
  } catch {
    return { error: "تعذر التحقق من المحاولة. يرجى إعادة المحاولة لاحقاً." };
  }

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
