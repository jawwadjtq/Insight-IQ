type Props = {
  correlation: Record<string, Record<string, number>>;
};

export default function CorrelationHeatmap({
  correlation,
}: Props) {
  if (!correlation || Object.keys(correlation).length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">
          Correlation Heatmap
        </h2>

        <p className="text-slate-400">
          No correlation data available.
        </p>
      </div>
    );
  }

  const columns = Object.keys(correlation);

  function getColor(value: number) {
    if (value >= 0.8) return "#2563eb";
    if (value >= 0.5) return "#3b82f6";
    if (value >= 0.2) return "#60a5fa";
    if (value >= 0) return "#93c5fd";

    if (value <= -0.8) return "#dc2626";
    if (value <= -0.5) return "#ef4444";
    if (value <= -0.2) return "#f87171";

    return "#475569";
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-8">
        Correlation Heatmap
      </h2>

      <div className="overflow-auto">

        <table className="border-collapse">

          <thead>

            <tr>

              <th className="p-3"></th>

              {columns.map((column) => (

                <th
                  key={column}
                  className="p-3 text-sm"
                >
                  {column}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {columns.map((row) => (

              <tr key={row}>

                <th className="text-left p-3">
                  {row}
                </th>

                {columns.map((column) => {

                  const value =
                    correlation[row][column];

                  return (

                    <td
                      key={column}
                      className="w-16 h-16 text-center font-semibold text-white"
                      style={{
                        backgroundColor: getColor(value),
                      }}
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

    </div>
  );
}