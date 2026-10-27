import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Store } from "lucide-react";
import { isDemo } from "@/lib/env";
import { requireAdmin } from "@/features/auth/session";
import { logout } from "@/features/auth/server/actions";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { ADMIN_ROLE_LABELS_AR } from "@/types/enums";

export const metadata: Metadata = { title: { default: "لوحة التحكم", template: "%s | لوحة التحكم" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="min-h-dvh bg-bg md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-primary/10 bg-surface p-3 md:h-dvh md:border-b-0 md:border-e md:p-4">
        <div className="mb-3 flex items-center justify-between md:mb-6 md:block">
          <Link href="/admin" className="font-heading text-xl font-bold text-primary">زُمُرّدة</Link>
          <p className="text-xs text-muted md:mt-1">{session.email} — {ADMIN_ROLE_LABELS_AR[session.role]}</p>
          <form action={logout} className="md:hidden">
            <button aria-label="خروج" className="rounded-full p-2 text-danger"><LogOut className="h-4 w-4" /></button>
          </form>
        </div>
        <AdminNav role={session.role} />
        <div className="mt-4 hidden gap-2 md:flex md:flex-col">
          <Link href="/" className="btn-ghost justify-start !px-4 text-sm"><Store className="h-4 w-4" /> عرض المتجر</Link>
          <form action={logout}>
            <button className="btn-ghost w-full justify-start !px-4 text-sm text-danger"><LogOut className="h-4 w-4" /> خروج</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        {isDemo && (
          <p className="bg-accent/15 px-4 py-2 text-center text-xs text-ink">
            وضع تجريبي — البيانات في الذاكرة وتُمسح عند إعادة التشغيل. اربطي Supabase لحفظ دائم.
          </p>
        )}
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
