import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "neutral"
  | "new"
  | "sale"
  | "gold"
  | "success"
  | "warning"
  | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-primary-light text-primary",
  new: "bg-primary text-white",
  sale: "bg-danger text-white",
  gold: "bg-accent text-white",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export type BadgeProps = React.ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold leading-5",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
