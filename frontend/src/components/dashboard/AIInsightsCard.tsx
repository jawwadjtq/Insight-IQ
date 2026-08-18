import { Sparkles } from "lucide-react";

import { aiInsights } from "../../data/dashboard";

export default function AIInsightsCard() {
  return (
    <section
      className="
        relative
        overflow-hidden

        rounded-3xl

        border
        border-slate-200
        dark:border-slate-800

        bg-white
        dark:bg-slate-900

        p-6
      "
    >
      {/* Background Glow */}

      <div
        className="
          absolute
          -right-16
          -top-16

          h-40
          w-40

          rounded-full

          bg-blue-500/5

          blur-3xl
        "
      />

      {/* Header */}

      <div className="relative flex items-center gap-4">
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center

            rounded-2xl

            bg-gradient-to-br
            from-blue-600
            to-indigo-600

            text-white

            shadow-lg
          "
        >
          <Sparkles size={26} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            AI Insights
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Automatically generated business recommendations
          </p>
        </div>
      </div>

      {/* Insights */}

      <div className="relative mt-8 space-y-4">
        {aiInsights.map((insight) => {
          const Icon = insight.icon;

          return (
            <div
              key={insight.title}
              className="
                rounded-2xl

                border
                border-slate-200
                dark:border-slate-800

                bg-slate-50
                dark:bg-slate-950/60

                p-4

                transition-all
                duration-300

                hover:border-blue-500/30
                hover:bg-blue-50/40
                dark:hover:bg-slate-800
              "
            >
              <div className="flex gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    bg-blue-500/10

                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  <Icon size={18} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {insight.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}

      <div
        className="
          mt-8

          rounded-2xl

          border
          border-blue-200
          dark:border-blue-900

          bg-blue-50
          dark:bg-blue-950/20

          p-4
        "
      >
        <p className="text-sm leading-6 text-blue-700 dark:text-blue-300">
          AI recommendations are generated from your uploaded datasets.
          As more data is analyzed, InsightIQ provides increasingly
          accurate business insights and executive recommendations.
        </p>
      </div>
    </section>
  );
}