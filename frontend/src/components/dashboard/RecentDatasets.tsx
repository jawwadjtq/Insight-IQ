import { ArrowRight, Database } from "lucide-react";
import { Link } from "react-router-dom";

import { datasets } from "../../data/dashboard";

export default function RecentDatasets() {
  return (
    <section
      className="
        rounded-3xl
        border
        border-slate-200
        dark:border-slate-800

        bg-white
        dark:bg-slate-900

        p-6
      "
    >
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recent Datasets
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Recently uploaded datasets available for analysis.
          </p>
        </div>

        <Link
          to="/upload"
          className="
            flex
            items-center
            gap-2

            text-sm
            font-semibold

            text-blue-600
            dark:text-blue-400

            transition
            hover:gap-3
          "
        >
          View All

          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Dataset List */}

      <div className="space-y-4">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className="
              flex
              items-center
              justify-between

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
            {/* Left */}

            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center

                  rounded-xl

                  bg-blue-500/10

                  text-blue-600
                  dark:text-blue-400
                "
              >
                <Database size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {dataset.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {dataset.rows}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Uploaded {dataset.uploaded}
                </p>
              </div>
            </div>

            {/* Status */}

            <span
              className={`
                rounded-full
                px-3
                py-1

                text-xs
                font-semibold

                ${
                  dataset.status === "Ready"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                }
              `}
            >
              {dataset.status}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}

      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload CSV, Excel or PDF files to begin AI-powered analysis.
        </p>
      </div>
    </section>
  );
}