import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  numericData: Record<string, number[]>;
};

export default function HistogramChart({
  numericData,
}: Props) {
  if (!numericData || Object.keys(numericData).length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold">
          Histogram
        </h2>

        <p className="text-slate-400 mt-4">
          No numeric data available.
        </p>
      </div>
    );
  }

  const firstColumn = Object.keys(numericData)[0];

  const values = numericData[firstColumn];

  const histogram = values.map((value, index) => ({
    index: index + 1,
    value,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Histogram ({firstColumn})
      </h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <BarChart data={histogram}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="index" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="value"
            fill="#3b82f6"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}