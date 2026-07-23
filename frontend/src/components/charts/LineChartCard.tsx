import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  rows: number;
}

export default function LineChartCard({ rows }: Props) {
  const data = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    value: Math.floor(rows / 12) + Math.floor(Math.random() * 50),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors">

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Dataset Trend
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}
