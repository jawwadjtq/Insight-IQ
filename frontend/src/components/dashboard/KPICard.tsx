import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string | number;
  icon: LucideIcon;
}

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
}: KPICardProps) {
  const numericTrend = trend
    ? parseFloat(String(trend).replace("%", ""))
    : null;

  const isPositive = numericTrend !== null && numericTrend >= 0;

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* Decorative glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          bg-blue-500/10
          blur-2xl
          transition-all
          duration-300
          group-hover:bg-blue-500/20
        "
      />

      {/* Header */}

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3
            className="
              mt-3
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            {value}
          </h3>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
            transition-transform
            duration-300
            group-hover:scale-110
            dark:bg-blue-500/10
            dark:text-blue-400
          "
        >
          <Icon size={21} />
        </div>
      </div>

      {/* Footer */}

      <div className="relative mt-5 flex items-center justify-between gap-3">
        {subtitle && (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}

        {trend && (
          <span
            className={`
              inline-flex
              shrink-0
              items-center
              gap-1
              rounded-full
              px-2.5
              py-1
              text-xs
              font-semibold

              ${
                isPositive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }
            `}
          >
            {isPositive ? (
              <TrendingUp size={13} />
            ) : (
              <TrendingDown size={13} />
            )}

            {trend}
          </span>
        )}
      </div>
    </div>
  );
}