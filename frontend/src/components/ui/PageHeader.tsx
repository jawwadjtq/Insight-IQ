import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  badge,
  actions,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`
        mb-8

        ${className}
      `}
    >
      <div
        className="
          flex
          flex-col
          gap-5

          xl:flex-row
          xl:items-start
          xl:justify-between
        "
      >
        {/* Heading */}

        <div className="min-w-0">
          {badge && (
            <div className="mb-3">
              {badge}
            </div>
          )}

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight

              text-slate-950
              dark:text-white

              sm:text-3xl
            "
          >
            {title}
          </h1>

          {description && (
            <p
              className="
                mt-2
                max-w-3xl

                text-sm
                leading-6

                text-slate-500
                dark:text-slate-400

                sm:text-base
              "
            >
              {description}
            </p>
          )}

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {/* Actions */}

        {actions && (
          <div
            className="
              flex
              shrink-0
              flex-wrap
              items-center
              gap-2
            "
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}