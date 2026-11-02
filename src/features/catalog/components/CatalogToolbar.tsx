"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS } from "../constants";

/** Sort + filters stored in the URL so pages stay shareable and server-rendered. */
export function CatalogToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  return (
    <div className={`mb-5 flex flex-wrap items-center gap-2 ${pending ? "opacity-60" : ""}`}>
      <span className="me-auto text-sm text-muted">{total} منتج</span>
      <label className="sr-only" htmlFor="sort">ترتيب</label>
      <select
        id="sort"
        value={params.get("sort") ?? "newest"}
        onChange={(e) => update({ sort: e.target.value })}
        className="rounded-full border border-primary/15 bg-surface px-4 py-2 text-sm"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <details className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-primary/15 bg-surface px-4 py-2 text-sm">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> فلترة
        </summary>
        <form
          className="card absolute end-0 z-20 mt-2 w-64 space-y-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            update({
              min: String(data.get("min") || "") || null,
              max: String(data.get("max") || "") || null,
              avail: data.get("avail") ? "in_stock" : null,
            });
          }}
        >
          <div className="flex gap-2">
            <input name="min" type="number" min={0} placeholder="من ₪" defaultValue={params.get("min") ?? ""} className="w-full rounded-input border border-primary/15 px-3 py-2 text-sm" aria-label="أقل سعر" />
            <input name="max" type="number" min={0} placeholder="إلى ₪" defaultValue={params.get("max") ?? ""} className="w-full rounded-input border border-primary/15 px-3 py-2 text-sm" aria-label="أعلى سعر" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="avail" defaultChecked={params.get("avail") === "in_stock"} className="accent-primary" />
            المتوفر فقط
          </label>
          <button className="btn-primary w-full !py-2">تطبيق</button>
        </form>
      </details>
    </div>
  );
}
