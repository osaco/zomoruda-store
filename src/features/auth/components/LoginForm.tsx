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
<<<<<<< HEAD
      <Input name="email" type="text" label="اسم المستخدم / البريد الإلكتروني" dir="ltr" autoComplete="username" required />
      {demo && <p className="rounded-input bg-accent/10 p-3 text-xs text-ink">وضع تجريبي: usuario `admin` y contraseña `admin` (configurable con ADMIN_DEMO_PASSWORD).</p>}
=======
      {demo && <p className="rounded-input bg-accent/10 p-3 text-xs text-ink">وضع تجريبي: الدخول بكلمة المرور المحددة في ADMIN_DEMO_PASSWORD.</p>}
      {!demo && <Input name="email" type="email" label="البريد الإلكتروني" dir="ltr" autoComplete="email" required />}
>>>>>>> b37169baf3bac8532f306104ef0cea207d720a05
      <Input name="password" type="password" label="كلمة المرور" dir="ltr" autoComplete="current-password" required />
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} دخول
      </button>
    </form>
  );
}
