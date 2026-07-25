import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function AIInsights() {
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

      {/* Header */}

      <div className="border-b border-slate-200 dark:border-slate-800 p-6">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

            <Brain className="text-blue-500" size={28} />

          </div>

          <div>

            <h2 className="text-2xl font-bold">
              AI Insights
            </h2>

            <p className="text-slate-500 dark:text-slate-400">
              Automatically generated business intelligence
            </p>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="p-6 space-y-6">

        {/* Insight */}

        <div className="flex gap-4">

          <Sparkles
            className="text-blue-500 mt-1"
            size={22}
          />

          <div>

            <h3 className="font-semibold text-lg">
              Executive Summary
            </h3>

            <p className="mt-2 text-slate-600 dark:text-slate-400 leading-7">
              Your uploaded dataset appears well structured and suitable for
              exploratory data analysis. Several numerical attributes are
              available for trend detection and predictive modelling.
            </p>

          </div>

        </div>

        {/* Opportunity */}

        <div className="flex gap-4">

          <TrendingUp
            className="text-green-500 mt-1"
            size={22}
          />

          <div>

            <h3 className="font-semibold text-lg">
              Opportunities
            </h3>

            <ul className="mt-2 space-y-2 text-slate-600 dark:text-slate-400">

              <li>
                • Build predictive dashboards.
              </li>

              <li>
                • Generate executive KPI reports.
              </li>

              <li>
                • Create customer segmentation models.
              </li>

              <li>
                • Detect anomalies automatically.
              </li>

            </ul>

          </div>

        </div>

        {/* Warning */}

        <div className="flex gap-4">

          <AlertTriangle
            className="text-yellow-500 mt-1"
            size={22}
          />

          <div>

            <h3 className="font-semibold text-lg">
              Recommendations
            </h3>

            <ul className="mt-2 space-y-2 text-slate-600 dark:text-slate-400">

              <li>
                • Review missing values before ML modelling.
              </li>

              <li>
                • Remove duplicate observations.
              </li>

              <li>
                • Standardize numeric columns.
              </li>

            </ul>

          </div>

        </div>

        {/* Final */}

        <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-5">

          <div className="flex items-center gap-3">

            <CheckCircle2
              className="text-green-600"
              size={24}
            />

            <div>

              <h3 className="font-semibold">
                AI Conclusion
              </h3>

              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Dataset is ready for visualization, dashboard creation,
                reporting, and AI-assisted analytics.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}