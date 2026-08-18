import KPICard from "./KPICard";

import { kpis } from "../../data/dashboard";

interface KPIGridProps {
  summary?: any;
}

export default function KPIGrid({ summary }: KPIGridProps) {
  return (
    <section>
      {/* Section Header */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Business Overview
        </h2>

        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Key performance indicators across your workspace.
        </p>
      </div>

      {/* KPI Cards */}

      <div
        className="
          grid
          gap-6
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {kpis.map((kpi) => {
          const key = (kpi as any).key;

          const value =
            summary?.[key] !== undefined &&
            summary?.[key] !== null
              ? summary[key]
              : kpi.value;

          return (
            <KPICard
              key={kpi.title}
              title={kpi.title}
              value={value}
              subtitle={kpi.subtitle}
              trend={kpi.trend}
              icon={kpi.icon}
            />
          );
        })}
      </div>
    </section>
  );
}