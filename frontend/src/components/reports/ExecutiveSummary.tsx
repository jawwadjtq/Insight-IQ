interface Props {
  summary: any;
}

export default function ExecutiveSummary({ summary }: Props) {
  if (!summary) return null;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">

      {/* Header */}

      <div className="border-b border-slate-800 p-8">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>

            <h2 className="text-3xl font-bold text-white">
              Executive Summary
            </h2>

            <p className="mt-2 text-slate-400">
              AI-generated overview of your uploaded dataset.
            </p>

          </div>

          <div>

            <span
              className="
              inline-flex
              items-center

              rounded-full

              bg-green-500/15

              border
              border-green-500/30

              px-5
              py-2

              text-green-300
              font-medium
              "
            >
              Dataset Status : Healthy
            </span>

          </div>

        </div>

      </div>

      {/* AI Insight */}

      <div className="p-8">

        <div
          className="
          rounded-2xl

          border
          border-blue-500/20

          bg-blue-500/10

          p-6
          "
        >

          <h3 className="text-xl font-bold text-blue-300">
            AI Insight
          </h3>

          <p className="mt-4 leading-8 text-slate-200">

            The uploaded dataset contains
            <strong> {summary.rows}</strong> records across
            <strong> {summary.columns}</strong> attributes.

            The current data quality score is
            <strong> {summary.quality_score}%</strong>,
            indicating that the dataset is suitable for business analysis after
            recommended preprocessing.

          </p>

        </div>

        {/* Highlights */}

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h4 className="font-bold text-white mb-4">
              Dataset Statistics
            </h4>

            <ul className="space-y-3 text-slate-300">

              <li>
                📊 Rows:
                <strong> {summary.rows}</strong>
              </li>

              <li>
                📋 Columns:
                <strong> {summary.columns}</strong>
              </li>

              <li>
                📈 Numeric Columns:
                <strong> {summary.numeric_columns}</strong>
              </li>

              <li>
                📝 Categorical Columns:
                <strong> {summary.categorical_columns}</strong>
              </li>

            </ul>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h4 className="font-bold text-white mb-4">
              Data Quality
            </h4>

            <ul className="space-y-3 text-slate-300">

              <li>
                ✅ Quality Score:
                <strong> {summary.quality_score}%</strong>
              </li>

              <li>
                ⚠ Missing Values:
                <strong> {summary.missing_values}</strong>
              </li>

              <li>
                🔁 Duplicate Rows:
                <strong> {summary.duplicate_rows}</strong>
              </li>

              <li>
                💾 Memory Usage:
                <strong> {summary.memory_usage_mb} MB</strong>
              </li>

            </ul>

          </div>

        </div>

      </div>

    </div>
  );
}