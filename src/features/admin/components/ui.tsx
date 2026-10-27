import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageTitle({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
      {action && <Link href={action.href} className="btn-primary !px-4 !py-2 text-sm">{action.label}</Link>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: LucideIcon; hint?: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary"><Icon className="h-6 w-6" /></span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-xl font-bold text-ink">{value}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-primary-light/60 text-start text-xs text-muted">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 text-start font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-primary/5">{children}</tbody>
      </table>
      {empty && <p className="p-8 text-center text-muted">لا توجد بيانات</p>}
    </div>
  );
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls = "w-full rounded-input border border-primary/15 bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-primary" /> {label}
    </label>
  );
}
