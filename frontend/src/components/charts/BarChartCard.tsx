import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import ChartCard from "./ChartCard";

interface Props {
  rows: number;
  columns: number;
  missing: number;
  duplicates: number;
}

export default function BarChartCard({
  rows,
  columns,
  missing,
  duplicates,
}: Props) {
  const data = [
    {
      name: "Rows",
      value: rows,
    },
    {
      name: "Columns",
      value: columns,
    },
    {
      name: "Missing",
      value: missing,
    },
    {
      name: "Duplicates",
      value: duplicates,
    },
  ];

  return (
    <ChartCard
      title="Dataset Statistics"
      subtitle="Quick overview of uploaded data"
    >
      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              fill="#3B82F6"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </ChartCard>
  );
}