import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import ChartCard from "./ChartCard";

import { useAppSettings } from "../../context/AppSettingsContext";

interface DataPoint {
  name: string;
  value: number;
}

interface Props {
  data?: DataPoint[];
  title?: string;
  subtitle?: string;
}

export default function LineChartCard({
  data = [],
  title = "Trend Analysis",
  subtitle = "Data trend over time",
}: Props) {
  const { chartSettings } = useAppSettings();

  const chartData =
    data.length > 0
      ? data
      : [
          { name: "Jan", value: 0 },
          { name: "Feb", value: 0 },
          { name: "Mar", value: 0 },
          { name: "Apr", value: 0 },
        ];

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
    >
      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={chartData}>
            {chartSettings.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="opacity-50"
              />
            )}

            <XAxis dataKey="name" />

            <YAxis />

            {chartSettings.showTooltip && (
              <Tooltip />
            )}

            {chartSettings.showLegend && (
              <Legend />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
              isAnimationActive={
                chartSettings.animations
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}