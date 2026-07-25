interface Props {
  summary: any;
}

export default function Recommendations({ summary }: Props) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">

      {/* Header */}

      <div className="border-b border-slate-800 p-8">

        <h2 className="text-3xl font-bold text-white">
          AI Recommendations
        </h2>

        <p className="mt-2 text-slate-400">
          Actionable recommendations generated from your dataset.
        </p>

      </div>

      <div className="p-8 space-y-6">

        {/* Recommendation */}

        {summary.missing_values > 0 && (

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-xl font-semibold text-white">
                Handle Missing Values
              </h3>

              <span className="rounded-full bg-red-600 px-4 py-1 text-sm font-semibold">
                High Priority
              </span>

            </div>

            <p className="mt-4 leading-7 text-slate-300">
              The dataset contains
              <strong> {summary.missing_values}</strong>
              missing values. Filling or removing these records will improve
              model accuracy and reporting reliability.
            </p>

          </div>

        )}

        {/* Recommendation */}

        {summary.duplicate_rows > 0 && (

          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-xl font-semibold text-white">
                Remove Duplicate Records
              </h3>

              <span className="rounded-full bg-orange-600 px-4 py-1 text-sm font-semibold">
                High Priority
              </span>

            </div>

            <p className="mt-4 leading-7 text-slate-300">
              Duplicate records can introduce bias into dashboards and machine
              learning models. Remove duplicate entries before analysis.
            </p>

          </div>

        )}

        {/* Recommendation */}

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">

          <div className="flex items-center justify-between">

            <h3 className="text-xl font-semibold text-white">
              Normalize Numeric Features
            </h3>

            <span className="rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold">
              Medium
            </span>

          </div>

          <p className="mt-4 leading-7 text-slate-300">
            Scaling numerical features improves predictive model performance and
            reduces bias caused by different value ranges.
          </p>

        </div>

        {/* Recommendation */}

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6">

          <div className="flex items-center justify-between">

            <h3 className="text-xl font-semibold text-white">
              Detect Outliers
            </h3>

            <span className="rounded-full bg-purple-600 px-4 py-1 text-sm font-semibold">
              Medium
            </span>

          </div>

          <p className="mt-4 leading-7 text-slate-300">
            Outlier detection helps identify abnormal observations that may
            distort business insights and forecasting models.
          </p>

        </div>

        {/* Recommendation */}

        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">

          <div className="flex items-center justify-between">

            <h3 className="text-xl font-semibold text-white">
              Feature Engineering
            </h3>

            <span className="rounded-full bg-green-600 px-4 py-1 text-sm font-semibold">
              Future Improvement
            </span>

          </div>

          <p className="mt-4 leading-7 text-slate-300">
            Create additional business features, aggregations, and calculated
            metrics to improve dashboard quality and AI model accuracy.
          </p>

        </div>

      </div>

    </div>
  );
}