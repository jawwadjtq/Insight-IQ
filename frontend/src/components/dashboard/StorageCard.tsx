import { HardDrive, Database } from "lucide-react";

import { storageUsage } from "../../data/dashboard";

export default function StorageCard() {
  const percentage = Math.round(
    (storageUsage.used / storageUsage.total) * 100
  );

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

      <div className="flex items-center gap-4">

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center

            rounded-2xl

            bg-blue-500/10

            text-blue-600
            dark:text-blue-400
          "
        >
          <HardDrive size={28} />
        </div>

        <div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Cloud Storage
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Storage used across your workspace
          </p>

        </div>

      </div>

      {/* Storage Numbers */}

      <div className="mt-8">

        <div className="flex items-end justify-between">

          <div>

            <h3 className="text-4xl font-bold text-slate-900 dark:text-white">
              {storageUsage.used} GB
            </h3>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              of {storageUsage.total} GB used
            </p>

          </div>

          <span
            className="
              rounded-full

              bg-blue-100
              dark:bg-blue-500/10

              px-3
              py-1

              text-sm
              font-semibold

              text-blue-700
              dark:text-blue-400
            "
          >
            {percentage}%
          </span>

        </div>

        {/* Progress */}

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">

          <div
            className="
              h-full

              rounded-full

              bg-gradient-to-r
              from-blue-600
              via-indigo-600
              to-violet-600

              transition-all
              duration-700
            "
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      {/* Details */}

      <div className="mt-8 space-y-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Database
              size={18}
              className="text-blue-500"
            />

            <span className="text-slate-600 dark:text-slate-300">
              Available Storage
            </span>

          </div>

          <span className="font-semibold text-slate-900 dark:text-white">
            {(storageUsage.total - storageUsage.used).toFixed(1)} GB
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-slate-600 dark:text-slate-300">
            Storage Plan
          </span>

          <span
            className="
              rounded-full

              bg-emerald-100
              dark:bg-emerald-500/10

              px-3
              py-1

              text-sm
              font-semibold

              text-emerald-700
              dark:text-emerald-400
            "
          >
            Free Plan
          </span>

        </div>

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
          Upgrade to InsightIQ Pro for larger cloud storage,
          unlimited datasets, AI reports and collaboration features.
        </p>

      </div>

    </section>
  );
}