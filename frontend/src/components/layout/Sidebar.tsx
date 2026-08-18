import {
  BarChart3,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Database,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Settings,
  Upload,
  X,
} from "lucide-react";

import type { ComponentType } from "react";

import { NavLink } from "react-router-dom";

import { useState } from "react";

import { useLanguage } from "../../context/LanguageContext";

/* =========================================================
   TYPES
========================================================= */

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

interface MenuItem {
  labelKey: string;
  path: string;
  icon: ComponentType<IconProps>;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/* =========================================================
   MENU
========================================================= */

const menuItems: MenuItem[] = [
  {
    labelKey: "dashboard",
    path: "/",
    icon: LayoutDashboard,
  },

  {
    labelKey: "upload",
    path: "/upload",
    icon: Upload,
  },

  {
    labelKey: "analytics",
    path: "/analytics",
    icon: BarChart3,
  },

  {
    labelKey: "aiAnalyst",
    path: "/ai-analyst",
    icon: BrainCircuit,
  },

  {
    labelKey: "reports",
    path: "/reports",
    icon: FileBarChart,
  },
];

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({
  collapsed: controlledCollapsed,
  onToggle,
  isOpen = true,
  onClose,
}: SidebarProps) {
  /* =======================================================
     LANGUAGE
  ======================================================= */

  const { t } = useLanguage();

  /* =======================================================
     LOCAL COLLAPSE STATE
  ======================================================= */

  const [localCollapsed, setLocalCollapsed] =
    useState(false);

  const isControlled =
    controlledCollapsed !== undefined;

  const collapsed = isControlled
    ? controlledCollapsed
    : localCollapsed;

  /* =======================================================
     TOGGLE SIDEBAR
  ======================================================= */

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed(
        (current) => !current
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          flex-col

          border-r
          border-slate-200

          bg-white
          text-slate-900

          shadow-xl

          transition-all
          duration-300
          ease-in-out

          dark:border-slate-800
          dark:bg-slate-950
          dark:text-white

          lg:relative
          lg:translate-x-0
          lg:shadow-none

          ${
            collapsed
              ? "lg:w-20"
              : "lg:w-72"
          }

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className={`
            flex
            h-20
            shrink-0
            items-center
            border-b
            border-slate-200
            dark:border-slate-800

            transition-all
            duration-300

            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }
          `}
        >
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            {/* LOGO */}

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-blue-600
                to-indigo-600
                text-white
                shadow-lg
              "
            >
              <Database
                size={23}
                strokeWidth={2.2}
              />
            </div>

            {/* BRAND */}

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold">
                  InsightIQ
                </h1>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  AI Analytics Platform
                </p>
              </div>
            )}
          </NavLink>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              rounded-lg
              p-2
              text-slate-500
              hover:bg-slate-100
              hover:text-slate-900

              dark:hover:bg-slate-800
              dark:hover:text-white

              lg:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            px-3
            py-6
          "
        >
          {/* WORKSPACE */}

          {!collapsed && (
            <p
              className="
                mb-3
                px-3
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-400
                dark:text-slate-500
              "
            >
              {t("workspace")}
            </p>
          )}

          {/* MENU */}

          <div className="space-y-1">
            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={
                      item.path === "/"
                    }
                    onClick={onClose}
                    title={
                      collapsed
                        ? t(
                            item.labelKey
                          )
                        : undefined
                    }
                    className={({
                      isActive,
                    }) =>
                      `
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-medium
                      transition-all
                      duration-200

                      ${
                        collapsed
                          ? "justify-center"
                          : ""
                      }

                      ${
                        isActive
                          ? `
                            bg-blue-600
                            text-white
                            shadow-md
                            shadow-blue-600/20
                          `
                          : `
                            text-slate-600
                            hover:bg-slate-100
                            hover:text-slate-900

                            dark:text-slate-400
                            dark:hover:bg-slate-900
                            dark:hover:text-white
                          `
                      }
                      `
                    }
                  >
                    {({
                      isActive,
                    }) => (
                      <>
                        <Icon
                          size={20}
                          strokeWidth={
                            isActive
                              ? 2.5
                              : 2
                          }
                          className="shrink-0"
                        />

                        {!collapsed && (
                          <span className="truncate">
                            {t(
                              item.labelKey
                            )}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              }
            )}
          </div>

          {/* =================================================
              SETTINGS
          ================================================= */}

          <div className="mt-8">
            {!collapsed && (
              <p
                className="
                  mb-3
                  px-3
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                  dark:text-slate-500
                "
              >
                {t("settings")}
              </p>
            )}

            <NavLink
              to="/settings"
              onClick={onClose}
              title={
                collapsed
                  ? t("settings")
                  : undefined
              }
              className={({
                isActive,
              }) =>
                `
                group
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  collapsed
                    ? "justify-center"
                    : ""
                }

                ${
                  isActive
                    ? `
                      bg-blue-600
                      text-white
                      shadow-md
                      shadow-blue-600/20
                    `
                    : `
                      text-slate-600
                      hover:bg-slate-100
                      hover:text-slate-900

                      dark:text-slate-400
                      dark:hover:bg-slate-900
                      dark:hover:text-white
                    `
                }
                `
              }
            >
              {({
                isActive,
              }) => (
                <>
                  <Settings
                    size={20}
                    strokeWidth={
                      isActive
                        ? 2.5
                        : 2
                    }
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <span>
                      {t(
                        "settings"
                      )}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-slate-200
            p-3

            dark:border-slate-800
          "
        >
          {/* INSIGHTIQ INFO */}

          {!collapsed && (
            <div
              className="
                mb-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-4

                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-100
                    text-blue-600

                    dark:bg-blue-500/10
                    dark:text-blue-400
                  "
                >
                  <FileText
                    size={18}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    InsightIQ
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    AI-powered business
                    intelligence
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              COLLAPSE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleToggle}
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              py-2.5
              text-slate-500
              transition

              hover:bg-slate-100
              hover:text-slate-900

              dark:border-slate-800
              dark:bg-slate-950
              dark:text-slate-400
              dark:hover:bg-slate-900
              dark:hover:text-white
            "
          >
            {collapsed ? (
              <ChevronRight
                size={18}
              />
            ) : (
              <>
                <ChevronLeft
                  size={18}
                />

                <span className="ml-2 text-xs font-medium">
                  Collapse Sidebar
                </span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}