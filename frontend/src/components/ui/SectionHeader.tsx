import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  description,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`
        flex
        flex-col
        gap-3

        sm:flex-row
        sm:items-start
        sm:justify-between

        ${className}
      `}
    >
      <div className="min-w-0">
        <h2
          className="
            text-lg
            font-bold
            tracking-tight

            text-slate-900
            dark:text-white

            sm:text-xl
          "
        >
          {title}
        </h2>

        {description && (
          <p
            className="
              mt-1

              max-w-2xl

              text-sm
              leading-6

              text-slate-500
              dark:text-slate-400
            "
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}