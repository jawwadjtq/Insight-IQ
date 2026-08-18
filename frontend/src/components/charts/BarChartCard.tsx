import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

import ChartCard from "./ChartCard";

import { useAppSettings } from "../../context/AppSettingsContext";

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
  const { chartSettings } = useAppSettings();

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

  const commonAxisProps = {
    stroke: "currentColor",
  };

  return (
    <ChartCard
      title="Dataset Statistics"
      subtitle="Quick overview of uploaded data"
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

              <XAxis
                dataKey="name"
                {...commonAxisProps}
              />

              <YAxis {...commonAxisProps} />

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

              <XAxis
                dataKey="name"
                {...commonAxisProps}
              />

              <YAxis {...commonAxisProps} />

              {chartSettings.showTooltip && (
                <Tooltip />
              )}

              {chartSettings.showLegend && (
                <Legend />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
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

              <XAxis
                dataKey="name"
                {...commonAxisProps}
              />

              <YAxis {...commonAxisProps} />

              {chartSettings.showTooltip && (
                <Tooltip />
              )}

              {chartSettings.showLegend && (
                <Legend />
              )}

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill="#3B82F6"
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