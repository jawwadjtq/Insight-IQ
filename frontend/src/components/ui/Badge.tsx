import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: `
    bg-slate-100
    text-slate-700
    dark:bg-slate-800
    dark:text-slate-300
  `,

  success: `
    bg-emerald-100
    text-emerald-700
    dark:bg-emerald-500/10
    dark:text-emerald-400
  `,

  warning: `
    bg-amber-100
    text-amber-700
    dark:bg-amber-500/10
    dark:text-amber-400
  `,

  danger: `
    bg-red-100
    text-red-700
    dark:bg-red-500/10
    dark:text-red-400
  `,

  info: `
    bg-blue-100
    text-blue-700
    dark:bg-blue-500/10
    dark:text-blue-400
  `,

  purple: `
    bg-violet-100
    text-violet-700
    dark:bg-violet-500/10
    dark:text-violet-400
  `,
};

const dotClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  purple: "bg-violet-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5

        rounded-full

        font-semibold

        ${variantClasses[variant]}
        ${sizeClasses[size]}

        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            h-1.5
            w-1.5
            rounded-full
            ${dotClasses[variant]}
          `}
          aria-hidden="true"
        />
      )}

      {children}
    </span>
  );
}