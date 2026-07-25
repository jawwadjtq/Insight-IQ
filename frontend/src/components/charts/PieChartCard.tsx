import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import ChartCard from "./ChartCard";

interface Props {
  numeric: number;
  categorical: number;
}

export default function PieChartCard({
  numeric,
  categorical,
}: Props) {
  const data = [
    {
      name: "Numeric",
      value: numeric,
    },
    {
      name: "Categorical",
      value: categorical,
    },
  ];

  const COLORS = [
    "#3B82F6",
    "#8B5CF6",
  ];

  return (
    <ChartCard
      title="Column Distribution"
      subtitle="Numeric vs Categorical Columns"
    >
      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>
    </ChartCard>
  );
}