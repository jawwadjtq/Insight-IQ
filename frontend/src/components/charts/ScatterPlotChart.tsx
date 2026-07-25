import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import ChartCard from "./ChartCard";

interface Props {
  numericData: any;
}

export default function ScatterPlotChart({
  numericData,
}: Props) {
  let values: number[] = [];

  if (Array.isArray(numericData)) {
    values = numericData.filter(
      (v) => typeof v === "number"
    );
  } else if (numericData && typeof numericData === "object") {
    values = Object.values(numericData)
      .flat()
      .filter((v) => typeof v === "number") as number[];
  }

  if (values.length === 0) {
    return (
      <ChartCard
        title="Scatter Plot"
        subtitle="Relationship Between Numeric Values"
      >
        <div className="flex h-80 items-center justify-center text-slate-400">
          No numeric data available.
        </div>
      </ChartCard>
    );
  }

  const scatterData = values.map(
    (value, index) => ({
      x: index + 1,
      y: value,
    })
  );

  return (
    <ChartCard
      title="Scatter Plot"
      subtitle="Distribution of Numeric Values"
    >
      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="x"
              name="Index"
            />

            <YAxis
              dataKey="y"
              name="Value"
            />

            <Tooltip />

            <Scatter
              data={scatterData}
              fill="#8B5CF6"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}