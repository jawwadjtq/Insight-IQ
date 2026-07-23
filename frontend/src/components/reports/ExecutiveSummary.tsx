interface Props {
  summary: any;
}

export default function ExecutiveSummary({ summary }: Props) {
  if (!summary) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        AI Executive Summary
      </h2>

      <div className="space-y-4 leading-8">

        <p>
          📊 The uploaded dataset contains{" "}
          <strong>{summary.rows}</strong> rows and{" "}
          <strong>{summary.columns}</strong> columns.
        </p>

        <p>
          ✅ Overall Quality Score:
          <strong> {summary.quality_score}%</strong>
        </p>

        <p>
          📈 The dataset contains{" "}
          <strong>{summary.numeric_columns}</strong> numeric columns and{" "}
          <strong>{summary.categorical_columns}</strong> categorical columns.
        </p>

        <p>
          ⚠ Missing Values:
          <strong> {summary.missing_values}</strong>
        </p>

        <p>
          🔁 Duplicate Rows:
          <strong> {summary.duplicate_rows}</strong>
        </p>

        <p>
          💾 Estimated Memory Usage:
          <strong> {summary.memory_usage_mb} MB</strong>
        </p>

      </div>

    </div>
  );
}