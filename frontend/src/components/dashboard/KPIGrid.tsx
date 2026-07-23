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

export default function KPIGrid({
  summary,
}: Props) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatsCard
        title="Rows"
        value={summary.rows}
        icon={Database}
        color="text-blue-400"
      />

      <StatsCard
        title="Columns"
        value={summary.columns}
        icon={Table}
        color="text-green-400"
      />

      <StatsCard
        title="Quality"
        value={`${summary.quality_score}%`}
        icon={Brain}
        color="text-purple-400"
      />

      <StatsCard
        title="Missing"
        value={summary.missing_values}
        icon={TriangleAlert}
        color="text-orange-400"
      />

    </div>
  );
}