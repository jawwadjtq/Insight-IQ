import {
  Database,
  Table,
  Brain,
  TriangleAlert,
} from "lucide-react";

import StatsCard from "./StatsCard";

type Props = {
  summary: any;
};

export default function KPIGrid({ summary }: Props) {
  return (
    <section className="space-y-6">

      <div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Key Performance Indicators
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Overview of your uploaded dataset.
        </p>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatsCard
          title="Rows"
          value={summary.rows}
          icon={Database}
          color="text-blue-500"
        />

        <StatsCard
          title="Columns"
          value={summary.columns}
          icon={Table}
          color="text-green-500"
        />

        <StatsCard
          title="Quality Score"
          value={`${summary.quality_score}%`}
          icon={Brain}
          color="text-purple-500"
        />

        <StatsCard
          title="Missing Values"
          value={summary.missing_values}
          icon={TriangleAlert}
          color="text-orange-500"
        />

      </div>

    </section>
  );
}