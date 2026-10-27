"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/types/enums";
import { ADMIN_NAV } from "../nav";

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((i) => role === "admin" || i.role === "staff");
  return (
    <nav aria-label="قائمة لوحة التحكم" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium md:rounded-input",
              active ? "bg-primary text-white" : "text-ink/80 hover:bg-primary-light",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
