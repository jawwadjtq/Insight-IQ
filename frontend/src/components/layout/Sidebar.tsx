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

export default function Sidebar() {
  return (
    <aside
      className="
      w-72
      min-h-screen

      bg-white
      dark:bg-slate-900

      border-r
      border-slate-200
      dark:border-slate-800

      transition-colors
      duration-300

      flex
      flex-col
      "
    >
      {/* Logo */}

      <div
        className="
        p-8
        border-b
        border-slate-200
        dark:border-slate-800
        "
      >
        <h1
          className="
          text-3xl
          font-bold

          text-slate-900
          dark:text-white
          "
        >
          InsightIQ
        </h1>

        <p
          className="
          text-sm
          mt-2

          text-slate-500
          dark:text-slate-400
          "
        >
          AI Business Intelligence
        </p>
      </div>

      {/* Navigation */}

      <nav className="flex-1 p-5 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-4

                px-5
                py-4

                rounded-xl

                transition-all
                duration-200

                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : `
                      text-slate-700
                      dark:text-slate-300

                      hover:bg-slate-100
                      dark:hover:bg-slate-800

                      hover:text-blue-600
                      dark:hover:text-white
                    `
                }
                `
              }
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}

      <div
        className="
        p-6

        border-t
        border-slate-200
        dark:border-slate-800
        "
      >
        <div
          className="
          rounded-xl

          bg-slate-100
          dark:bg-slate-800

          p-4

          transition-colors
          "
        >
          <p
            className="
            text-sm

            text-slate-600
            dark:text-slate-300
            "
          >
            Current Plan
          </p>

          <h3
            className="
            text-xl
            font-bold

            text-slate-900
            dark:text-white
            "
          >
            Free
          </h3>

          <button
            className="
            mt-4

            w-full

            rounded-lg

            bg-blue-600

            py-2

            font-medium

            text-white

            hover:bg-blue-700

            transition
            "
          >
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}