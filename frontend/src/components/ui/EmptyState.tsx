import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex
        min-h-[280px]
        w-full
        flex-col
        items-center
        justify-center

        rounded-3xl

        border
        border-dashed
        border-slate-300
        dark:border-slate-700

        bg-slate-50/70
        dark:bg-slate-900/50

        px-6
        py-12

        text-center

        ${className}
      `}
    >
      {/* Icon */}

      {icon && (
        <div
          className="
            mb-5

            flex
            h-16
            w-16
            items-center
            justify-center

            rounded-2xl

            bg-blue-50
            dark:bg-blue-500/10

            text-blue-600
            dark:text-blue-400
          "
        >
          {icon}
        </div>
      )}

      {/* Title */}

      <h3
        className="
          text-lg
          font-bold

          text-slate-900
          dark:text-white
        "
      >
        {title}
      </h3>

      {/* Description */}

      {description && (
        <p
          className="
            mt-2
            max-w-md

            text-sm
            leading-6

            text-slate-500
            dark:text-slate-400
          "
        >
          {description}
        </p>
      )}

      {/* Actions */}

      {(action || secondaryAction) && (
        <div
          className="
            mt-6

            flex
            flex-col
            items-center
            justify-center
            gap-3

            sm:flex-row
          "
        >
          {action}

          {secondaryAction}
        </div>
      )}
    </div>
  );
}