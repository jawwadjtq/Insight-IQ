import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { quickActions } from "../../data/dashboard";

export default function QuickActions() {
  return (
    <section>
      {/* Header */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h2>

        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Jump directly into your most frequently used workflows.
        </p>
      </div>

      {/* Cards */}

      <div className="grid gap-6 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.to}
              className="
                group
                relative
                overflow-hidden

                rounded-3xl

                border
                border-slate-200
                dark:border-slate-800

                bg-white
                dark:bg-slate-900

                p-6

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-blue-500/40
                hover:shadow-xl
              "
            >
              {/* Background Glow */}

              <div
                className="
                  absolute
                  -right-10
                  -top-10
                  h-28
                  w-28
                  rounded-full
                  bg-blue-500/5
                  blur-3xl
                  transition-opacity
                  group-hover:opacity-100
                "
              />

              <div className="relative z-10">

                {/* Icon */}

                <div
                  className={`
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center

                    rounded-2xl

                    ${action.color}
                  `}
                >
                  <Icon size={26} />
                </div>

                {/* Title */}

                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  {action.title}
                </h3>

                {/* Description */}

                <p className="mt-3 leading-7 text-slate-500 dark:text-slate-400">
                  {action.description}
                </p>

                {/* Footer */}

                <div
                  className="
                    mt-8

                    flex
                    items-center
                    gap-2

                    font-semibold

                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  Open

                  <ArrowRight
                    size={18}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}