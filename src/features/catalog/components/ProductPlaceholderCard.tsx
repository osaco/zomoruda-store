import { Gift } from "lucide-react";

export function ProductPlaceholderCard({ title }: { title: string }) {
  return (
    <article className="card overflow-hidden" aria-label={`${title} — قريباً`}>
      <div className="flex aspect-square items-center justify-center bg-primary-light">
        <Gift className="h-10 w-10 text-primary/40" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="p-4">
        <div className="h-4 w-3/4 rounded-full bg-primary/10" />
        <div className="mt-2 h-4 w-1/3 rounded-full bg-primary/10" />
        <p className="mt-3 text-xs font-medium text-muted">قريباً…</p>
      </div>
    </article>
  );
}
