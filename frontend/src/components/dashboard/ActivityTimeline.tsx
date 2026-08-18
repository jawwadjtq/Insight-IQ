import { activities } from "../../data/dashboard";

export default function ActivityTimeline() {
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

      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Latest events across your InsightIQ workspace.
        </p>
      </div>

      {/* Timeline */}

      <div className="relative">

        {/* Vertical Line */}

        <div
          className="
            absolute

            left-5

            top-2

            bottom-2

            w-px

            bg-slate-200
            dark:bg-slate-700
          "
        />

        <div className="space-y-8">

          {activities.map((activity) => {

            const Icon = activity.icon;

            return (

              <div
                key={activity.id}
                className="relative flex gap-5"
              >

                {/* Timeline Icon */}

                <div
                  className="
                    relative
                    z-10

                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    bg-blue-600

                    text-white

                    shadow-lg
                  "
                >
                  <Icon size={18} />
                </div>

                {/* Content */}

                <div className="flex-1 pb-2">

                  <div
                    className="
                      rounded-2xl

                      border
                      border-slate-200
                      dark:border-slate-800

                      bg-slate-50
                      dark:bg-slate-950/50

                      p-4

                      transition-all
                      duration-300

                      hover:border-blue-500/30
                      hover:bg-blue-50/50
                      dark:hover:bg-slate-800
                    "
                  >

                    <div className="flex items-center justify-between">

                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {activity.title}
                      </h3>

                      <span className="text-xs text-slate-400">
                        {activity.time}
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {activity.description}
                    </p>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}