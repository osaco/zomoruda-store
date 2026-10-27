"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { createSession, destroySession } from "../session";

const loginSchema = z.object({ email: z.string().trim().optional(), password: z.string().min(1) });

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: form.get("email") ?? undefined, password: form.get("password") });
  if (!parsed.success) return { error: "أدخلي كلمة المرور" };
  const { email, password } = parsed.data;

  if (!isSupabaseConfigured) {
    if (password !== serverEnv.ADMIN_DEMO_PASSWORD) return { error: "كلمة المرور غير صحيحة" };
    await createSession(email || "demo@zomoruda", "admin");
    redirect("/admin");
  }

  if (!email) return { error: "أدخلي البريد الإلكتروني" };
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
    return { error: "هذا الحساب لا يملك صلاحية الدخول للوحة التحكم" };
  }
  await createSession(email, admin.role);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  if (isSupabaseConfigured) await (await supabaseServer()).auth.signOut();
  redirect("/admin/login");
}
