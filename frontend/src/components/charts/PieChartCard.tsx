import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

import ChartCard from "./ChartCard";

import { useAppSettings } from "../../context/AppSettingsContext";

interface Props {
  numeric: number;
  categorical: number;
}

export default function PieChartCard({
  numeric,
  categorical,
}: Props) {
  const { chartSettings } = useAppSettings();

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

  /*
   * Pie charts don't have a natural equivalent for
   * every chart type, so the global chart type setting
   * determines the visualization used here.
   */

  return (
    <ChartCard
      title="Column Distribution"
      subtitle="Numeric vs categorical columns"
    >
      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          {chartSettings.chartType === "line" ? (
            <LineChart data={data}>
              {chartSettings.showGrid && (
                <CartesianGrid strokeDasharray="3 3" />
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
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 5 }}
                isAnimationActive={
                  chartSettings.animations
                }
              />
            </LineChart>
          ) : chartSettings.chartType === "area" ? (
            <AreaChart data={data}>
              {chartSettings.showGrid && (
                <CartesianGrid strokeDasharray="3 3" />
              )}

              <XAxis dataKey="name" />

              <YAxis />

              {chartSettings.showTooltip && (
                <Tooltip />
              )}

              {chartSettings.showLegend && (
                <Legend />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.25}
                strokeWidth={3}
                isAnimationActive={
                  chartSettings.animations
                }
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              {chartSettings.showGrid && (
                <CartesianGrid strokeDasharray="3 3" />
              )}

              <XAxis dataKey="name" />

              <YAxis />

              {chartSettings.showTooltip && (
                <Tooltip />
              )}

              {chartSettings.showLegend && (
                <Legend />
              )}

              <Bar
                dataKey="value"
                fill="#6366F1"
                radius={[8, 8, 0, 0]}
                isAnimationActive={
                  chartSettings.animations
                }
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}