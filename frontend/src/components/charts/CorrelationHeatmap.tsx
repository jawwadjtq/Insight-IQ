import ChartCard from "./ChartCard";

interface Props {
  correlation: any;
}

export default function CorrelationHeatmap({
  correlation,
}: Props) {
  if (!correlation || Object.keys(correlation).length === 0) {
    return (
      <ChartCard
        title="Correlation Heatmap"
        subtitle="Correlation Between Numeric Features"
      >
        <div className="flex h-72 items-center justify-center text-slate-400">
          Correlation matrix not available.
        </div>
      </ChartCard>
    );
  }

  const columns = Object.keys(correlation);

  function getColor(value: number) {
    if (value >= 0.8)
      return "bg-blue-700 text-white";

    if (value >= 0.6)
      return "bg-blue-500 text-white";

    if (value >= 0.3)
      return "bg-blue-300 text-slate-900";

    if (value <= -0.8)
      return "bg-red-700 text-white";

    if (value <= -0.6)
      return "bg-red-500 text-white";

    if (value <= -0.3)
      return "bg-red-300 text-slate-900";

    return "bg-slate-200 dark:bg-slate-700";
  }

  return (
    <ChartCard
      title="Correlation Heatmap"
      subtitle="Relationship Between Numeric Columns"
    >
      <div className="overflow-auto">

        <table className="min-w-full border-collapse">

          <thead>

            <tr>

              <th className="p-3"></th>

              {columns.map((col) => (

                <th
                  key={col}
                  className="p-3 text-sm font-semibold"
                >
                  {col}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {columns.map((row) => (

              <tr key={row}>

                <td className="p-3 font-semibold">
                  {row}
                </td>

                {columns.map((col) => {

                  const value = Number(
                    correlation[row]?.[col] ?? 0
                  );

                  return (

                    <td
                      key={col}
                      className={`p-3 text-center rounded ${getColor(
                        value
                      )}`}
                    >
                      {value.toFixed(2)}
                    </td>

                  );

                })}

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </ChartCard>
  );
}