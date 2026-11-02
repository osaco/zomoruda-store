import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type Crumb = { href: string; label: string };

export function PageHeader({ title, description, crumbs = [] }: { title: string; description?: string | null; crumbs?: Crumb[] }) {
  return (
    <header className="bg-sparkle">
      <div className="container-page py-8 md:py-10">
        <nav aria-label="مسار التصفح" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          {crumbs.map((c) => (
            <span key={c.href} className="flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" aria-hidden="true" />
              <Link href={c.href} className="hover:text-primary">{c.label}</Link>
            </span>
          ))}
        </nav>
        {title && <h1 className="font-heading text-3xl font-bold text-ink md:text-4xl">{title}</h1>}
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
    </header>
  );
}
