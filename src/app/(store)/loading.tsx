import { Gem } from "lucide-react";

export default function Loading() {
  return (
    <div role="status" className="grid min-h-48 place-content-center justify-items-center gap-3 text-primary">
      <Gem aria-hidden="true" className="size-8 motion-safe:animate-pulse" />
      <span className="text-sm">جاري تحميل زمردة…</span>
    </div>
  );
}
