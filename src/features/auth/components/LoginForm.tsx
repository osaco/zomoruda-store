"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { login, type LoginState } from "../server/actions";

export function LoginForm({ demo }: { demo: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="card w-full max-w-sm space-y-4 p-6">
      <h1 className="text-center font-heading text-2xl font-bold text-primary">لوحة تحكم زُمُرّدة</h1>
      <Input name="email" type="text" label="اسم المستخدم / البريد الإلكتروني" dir="ltr" autoComplete="username" required />
      {demo && <p className="rounded-input bg-accent/10 p-3 text-xs text-ink">وضع تجريبي: الدخول باسم المستخدم `admin` وكلمة المرور المحددة في ADMIN_DEMO_PASSWORD (الافتراضي `admin`).</p>}
      <Input name="password" type="password" label="كلمة المرور" dir="ltr" autoComplete="current-password" required />
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} دخول
      </button>
    </form>
  );
}
