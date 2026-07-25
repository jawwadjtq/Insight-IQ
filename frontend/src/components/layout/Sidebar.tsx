import {
  LayoutDashboard,
  Upload,
  BarChart3,
  BrainCircuit,
  FileText,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Upload Dataset",
    path: "/upload",
    icon: Upload,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Analyst",
    path: "/ai",
    icon: BrainCircuit,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside
      className="
      w-72
      h-screen
      flex
      flex-col
      overflow-y-auto

      bg-white
      dark:bg-slate-900

      border-r
      border-slate-200
      dark:border-slate-800
      "
    >
      {/* Logo */}

      <div
        className="
        p-6

        border-b
        border-slate-200
        dark:border-slate-800
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
            h-14
            w-14

            rounded-2xl

            bg-gradient-to-br
            from-blue-600
            to-indigo-600

            flex
            items-center
            justify-center

            text-2xl

            shadow-lg
            "
          >
            🧠
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              InsightIQ
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI Business Intelligence Platform
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Version 1.0
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Title */}

      <div className="px-6 pt-6 pb-2">
        <p
          className="
          text-xs

          uppercase

          tracking-[0.2em]

          text-slate-400
          "
        >
          Navigation
        </p>
      </div>

      {/* Navigation */}

      <nav className="flex-1 px-4 pb-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3

                px-4
                py-3

                rounded-xl

                font-medium

                transition-all
                duration-300

                ${
                  isActive
                    ? `
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600

                      text-white

                      shadow-lg
                      shadow-blue-600/30
                    `
                    : `
                      text-slate-700
                      dark:text-slate-300

                      hover:bg-blue-50
                      dark:hover:bg-slate-800

                      hover:text-blue-600
                      dark:hover:text-white

                      hover:translate-x-1
                    `
                }
                `
              }
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}

      <div
        className="
        p-5

        border-t
        border-slate-200
        dark:border-slate-800
        "
      >
        <div
          className="
          rounded-2xl

          border
          border-slate-700

          bg-gradient-to-br
          from-slate-900
          to-slate-800

          p-5
          "
        >
          <p className="text-sm text-slate-400">
            Current Plan
          </p>

          <h3
            className="
            mt-2

            text-2xl

            font-bold

            text-white
            "
          >
            Free
          </h3>

          <p
            className="
            mt-2

            text-sm

            leading-6

            text-slate-400
            "
          >
            Upgrade to unlock AI Reports,
            Advanced Analytics,
            Cloud Storage,
            and Premium Insights.
          </p>

          <button
            className="
            mt-5

            w-full

            rounded-xl

            bg-gradient-to-r
            from-blue-600
            to-indigo-600

            py-3

            font-semibold

            text-white

            transition

            hover:scale-[1.02]
            "
          >
            Upgrade to Pro
          </button>
        </div>

        <p
          className="
          mt-5

          text-center

          text-xs

          text-slate-500
          "
        >
          © 2026 InsightIQ
          <br />
          All Rights Reserved
        </p>
      </div>
    </aside>
  );
}