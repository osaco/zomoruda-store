import { cn } from "@/lib/utils";

export function AnnouncementBar({ text, tone = "default" }: { text: string; tone?: "default" | "warning" }) {
  if (!text) return null;
  return (
    <div
      role={tone === "warning" ? "alert" : undefined}
      className={cn(
        "px-4 py-2 text-center text-xs font-bold md:text-sm",
        tone === "warning" ? "bg-warning text-ink" : "bg-primary-dark text-white",
      )}
    >
      {text}
    </div>
  );
}
