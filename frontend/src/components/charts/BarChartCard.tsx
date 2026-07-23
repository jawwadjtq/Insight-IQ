import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Props = {
  rows: number;
  columns: number;
  missing: number;
  duplicates: number;
};

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <h2 className="text-xl font-bold mb-6">
        Dataset Statistics
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="value"
            fill="#3B82F6"
          />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}