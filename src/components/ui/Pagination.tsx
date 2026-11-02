import Link from "next/link";
import { cn } from "@/lib/utils";

/** Server-rendered pagination that preserves the current query string. */
export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;
  const href = (p: number) => {
    const next = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    next.set("page", String(p));
    return `${basePath}?${next.toString()}`;
  };
  return (
    <nav aria-label="الصفحات" className="mt-8 flex justify-center gap-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "flex h-10 min-w-10 items-center justify-center rounded-full text-sm font-bold",
            p === page ? "bg-primary text-white" : "bg-surface text-ink shadow-soft hover:bg-primary-light",
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
