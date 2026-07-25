import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "./ChartCard";

interface Props {
  numericData: any;
}

export default function HistogramChart({
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
        title="Histogram"
        subtitle="Distribution of Numeric Values"
      >
        <div className="flex h-80 items-center justify-center text-slate-400">
          No numeric data available.
        </div>
      </ChartCard>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  const bins = 8;
  const binSize = (max - min) / bins || 1;

  const histogram = Array.from(
    { length: bins },
    (_, i) => ({
      range: `${Math.round(min + i * binSize)}`,
      count: 0,
    })
  );

  values.forEach((value) => {
    let index = Math.floor(
      (value - min) / binSize
    );

    if (index >= bins) index = bins - 1;

    histogram[index].count++;
  });

  return (
    <ChartCard
      title="Histogram"
      subtitle="Distribution of Numeric Values"
    >
      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={histogram}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="range" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="count"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}