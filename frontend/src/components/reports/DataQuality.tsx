interface Props {
  summary: any;
}

export default function DataQuality({ summary }: Props) {
  const score = summary.quality_score;

  const status =
    score >= 90
      ? "Excellent"
      : score >= 75
      ? "Good"
      : score >= 60
      ? "Fair"
      : "Poor";

  const color =
    score >= 90
      ? "bg-green-500"
      : score >= 75
      ? "bg-blue-500"
      : score >= 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">

      {/* Header */}

      <div className="border-b border-slate-800 p-8">

        <h2 className="text-3xl font-bold text-white">
          Data Quality Analysis
        </h2>

        <p className="mt-2 text-slate-400">
          AI assessment of the uploaded dataset quality.
        </p>

      </div>

      <div className="p-8 space-y-8">

        {/* Quality Score */}

        <div>

          <div className="flex justify-between items-center mb-3">

            <h3 className="text-xl font-semibold text-white">
              Overall Quality Score
            </h3>

            <span className="text-blue-400 font-bold">
              {score}%
            </span>

          </div>

          <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden">

            <div
              className={`${color} h-full transition-all duration-700`}
              style={{
                width: `${score}%`,
              }}
            />

          </div>

          <p className="mt-3 text-slate-400">
            Dataset Health:
            <span className="font-semibold text-white">
              {" "}
              {status}
            </span>
          </p>

        </div>

        {/* Cards */}

        <div className="grid md:grid-cols-3 gap-6">

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h4 className="text-slate-400 mb-3">
              Missing Values
            </h4>

            <p className="text-4xl font-bold text-orange-400">
              {summary.missing_values}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Null or empty records detected.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h4 className="text-slate-400 mb-3">
              Duplicate Rows
            </h4>

            <p className="text-4xl font-bold text-red-400">
              {summary.duplicate_rows}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Repeated records requiring review.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <h4 className="text-slate-400 mb-3">
              Memory Usage
            </h4>

            <p className="text-4xl font-bold text-blue-400">
              {summary.memory_usage_mb} MB
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Estimated dataset memory footprint.
            </p>

          </div>

        </div>

        {/* AI Observation */}

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">

          <h3 className="text-xl font-bold text-blue-300 mb-4">
            AI Observation
          </h3>

          <p className="leading-8 text-slate-200">
            The current dataset quality score is
            <strong> {summary.quality_score}%</strong>.
            Missing values and duplicate records should be addressed before
            performing predictive analytics or business intelligence reporting
            to maximize insight accuracy.
          </p>

        </div>

      </div>

    </div>
  );
}