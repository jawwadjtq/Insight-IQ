import type { ReactNode } from "react";

type ProgressVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "purple";

type ProgressSize =
  | "sm"
  | "md"
  | "lg";

interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: ReactNode;
  showValue?: boolean;
  className?: string;
}

const variantClasses: Record<ProgressVariant, string> = {
  default: `
    bg-gradient-to-r
    from-blue-600
    to-indigo-600
  `,

  success: `
    bg-gradient-to-r
    from-emerald-500
    to-green-600
  `,

  warning: `
    bg-gradient-to-r
    from-amber-500
    to-orange-500
  `,

  danger: `
    bg-gradient-to-r
    from-red-500
    to-rose-600
  `,

  purple: `
    bg-gradient-to-r
    from-violet-600
    to-purple-600
  `,
};

const sizeClasses: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export default function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  label,
  showValue = false,
  className = "",
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;

  const percentage = Math.min(
    Math.max((value / safeMax) * 100, 0),
    100
  );

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-4">
          {label && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}

          {showValue && (
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={`
          w-full
          overflow-hidden
          rounded-full

          bg-slate-200
          dark:bg-slate-800

          ${sizeClasses[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={
          typeof label === "string"
            ? label
            : "Progress"
        }
      >
        <div
          className={`
            h-full
            rounded-full

            transition-all
            duration-700
            ease-out

            ${variantClasses[variant]}
          `}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}