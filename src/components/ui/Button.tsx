import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  outline:
    "btn border border-primary/25 bg-transparent text-primary hover:bg-primary-light",
  danger: "btn bg-danger text-white hover:brightness-105 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "!px-4 !py-2 text-xs",
  md: "",
  lg: "!px-8 !py-3.5 text-base",
  icon: "!px-2.5 !py-2.5",
};

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonBaseProps & { className?: string } = {}) {
  return cn(
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

export type ButtonProps = React.ComponentProps<"button"> & ButtonBaseProps;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
