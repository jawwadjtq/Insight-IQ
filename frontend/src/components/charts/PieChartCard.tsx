import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
];

type Props = {
  numeric: number;
  categorical: number;
};

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

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

      <h2 className="text-xl font-bold mb-6">
        Dataset Composition
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={120}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}