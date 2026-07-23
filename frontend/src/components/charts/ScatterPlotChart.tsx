import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  numericData: Record<string, number[]>;
};

export default function ScatterPlotChart({
  numericData,
}: Props) {
  if (!numericData || Object.keys(numericData).length < 2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold">
          Scatter Plot
        </h2>

        <p className="text-slate-400 mt-4">
          At least two numeric columns are required.
        </p>
      </div>
    );
  }

  const columns = Object.keys(numericData);

  const xColumn = columns[0];
  const yColumn = columns[1];

  const length = Math.min(
    numericData[xColumn].length,
    numericData[yColumn].length
  );

  const data = [];

  for (let i = 0; i < length; i++) {
    data.push({
      x: numericData[xColumn][i],
      y: numericData[yColumn][i],
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Scatter Plot ({xColumn} vs {yColumn})
      </h2>

      <ResponsiveContainer
        width="100%"
        height={400}
      >

        <ScatterChart>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="x"
            name={xColumn}
          />

          <YAxis
            dataKey="y"
            name={yColumn}
          />

          <Tooltip />

          <Scatter
            data={data}
            fill="#3b82f6"
          />

        </ScatterChart>

      </ResponsiveContainer>

    </div>
  );
}
