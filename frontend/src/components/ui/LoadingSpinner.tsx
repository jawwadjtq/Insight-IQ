import type { HTMLAttributes } from "react";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface LoadingSpinnerProps
  extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-10 w-10 border-4",
};

export default function LoadingSpinner({
  size = "md",
  label,
  className = "",
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={`
        inline-flex
        items-center
        gap-2

        ${className}
      `}
      role="status"
      aria-live="polite"
      {...props}
    >
      <span
        aria-hidden="true"
        className={`
          block
          shrink-0
          animate-spin

          rounded-full

          border-slate-200
          dark:border-slate-700

          border-t-blue-600
          dark:border-t-blue-400

          ${sizeClasses[size]}
        `}
      />

      {label && (
        <span
          className="
            text-sm
            font-medium

            text-slate-600
            dark:text-slate-300
          "
        >
          {label}
        </span>
      )}

      {!label && (
        <span className="sr-only">
          Loading
        </span>
      )}
    </div>
  );
}