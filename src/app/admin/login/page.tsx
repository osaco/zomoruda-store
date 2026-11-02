import type { Metadata } from "next";
import { isDemo } from "@/lib/env";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "تسجيل الدخول", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-sparkle p-4">
      <LoginForm demo={isDemo} />
    </main>
  );
}
