import {
  Bell,
  Mail,
  BarChart3,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

import { useAppSettings } from "../../context/AppSettingsContext";

/* =========================================================
   TYPES
========================================================= */

type NotificationKey =
  | "reportNotifications"
  | "analysisNotifications"
  | "aiNotifications"
  | "securityAlerts";

interface NotificationOption {
  key: NotificationKey;
  title: string;
  description: string;
  icon: typeof Mail;
  required: boolean;
}

/* =========================================================
   NOTIFICATION SETTINGS
========================================================= */

export default function NotificationSettings() {
  const { settings, updateSetting } = useAppSettings();

  /* =======================================================
     NOTIFICATION OPTIONS
  ======================================================= */

  const notifications: NotificationOption[] = [
    {
      key: "reportNotifications",
      title: "Email Reports",
      description:
        "Receive completed reports and exported analysis by email.",
      icon: Mail,
      required: false,
    },
    {
      key: "analysisNotifications",
      title: "Analysis Completed",
      description:
        "Notify me when dataset analysis and processing is complete.",
      icon: BarChart3,
      required: false,
    },
    {
      key: "aiNotifications",
      title: "AI Insights",
      description:
        "Receive notifications when new AI-powered insights are available.",
      icon: Sparkles,
      required: false,
    },
    {
      key: "securityAlerts",
      title: "Security Alerts",
      description:
        "Always notify me about important security and account events.",
      icon: ShieldAlert,
      required: true,
    },
  ];

  /* =======================================================
     MASTER NOTIFICATION TOGGLE
  ======================================================= */

  const toggleAllNotifications = () => {
    updateSetting(
      "notifications",
      !settings.notifications
    );
  };

  /* =======================================================
     INDIVIDUAL NOTIFICATION TOGGLE
  ======================================================= */

  const toggleNotification = (
    key: NotificationKey
  ) => {
    updateSetting(
      key,
      !settings[key]
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-8

        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-8 flex items-center gap-5">
        <div
          className="
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-blue-500/10
          "
        >
          <Bell
            size={30}
            className="text-blue-500"
          />
        </div>

        <div>
          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Notifications
          </h2>

          <p
            className="
              mt-1
              text-slate-500
              dark:text-slate-400
            "
          >
            Control which InsightIQ notifications you receive.
          </p>
        </div>
      </div>

      {/* ===================================================
          MASTER SWITCH
      =================================================== */}

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
          gap-6
          rounded-2xl
          border
          border-blue-500/20
          bg-blue-500/5
          p-5
        "
      >
        <div>
          <h3
            className="
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            All Notifications
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Enable or disable non-security notifications
            across InsightIQ.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAllNotifications}
          aria-label="Toggle all notifications"
          aria-pressed={settings.notifications}
          className={`
            relative
            h-7
            w-14
            shrink-0
            rounded-full
            transition-colors
            duration-200

            ${
              settings.notifications
                ? "bg-blue-600"
                : "bg-slate-300 dark:bg-slate-700"
            }
          `}
        >
          <span
            className={`
              absolute
              top-1
              h-5
              w-5
              rounded-full
              bg-white
              shadow-sm
              transition-transform
              duration-200

              ${
                settings.notifications
                  ? "translate-x-8"
                  : "translate-x-1"
              }
            `}
          />
        </button>
      </div>

      {/* ===================================================
          NOTIFICATION OPTIONS
      =================================================== */}

      <div className="space-y-5">
        {notifications.map((notification) => {
          const Icon = notification.icon;

          const enabled =
            settings[notification.key];

          const disabled =
            !settings.notifications &&
            !notification.required;

          return (
            <div
              key={notification.key}
              className={`
                flex
                items-center
                justify-between
                gap-6
                rounded-2xl
                border
                p-5
                transition-all
                duration-200

                ${
                  disabled
                    ? `
                      border-slate-200
                      bg-slate-100
                      opacity-60

                      dark:border-slate-800
                      dark:bg-slate-950
                    `
                    : `
                      border-slate-200
                      bg-slate-50

                      hover:border-blue-400

                      dark:border-slate-800
                      dark:bg-slate-950

                      dark:hover:border-slate-700
                    `
                }
              `}
            >
              {/* =================================================
                  LEFT CONTENT
              ================================================= */}

              <div className="flex min-w-0 items-center gap-5">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-200

                    dark:bg-slate-900
                  "
                >
                  <Icon
                    size={25}
                    className="
                      text-slate-600
                      dark:text-slate-300
                    "
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className="
                        text-lg
                        font-semibold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {notification.title}
                    </h3>

                    {notification.required && (
                      <span
                        className="
                          rounded-full
                          bg-emerald-500/10
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-emerald-500
                        "
                      >
                        Required
                      </span>
                    )}
                  </div>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {notification.description}
                  </p>
                </div>
              </div>

              {/* =================================================
                  TOGGLE
              ================================================= */}

              <button
                type="button"
                disabled={
                  notification.required ||
                  disabled
                }
                onClick={() => {
                  if (
                    notification.required ||
                    disabled
                  ) {
                    return;
                  }

                  toggleNotification(
                    notification.key
                  );
                }}
                aria-label={`Toggle ${notification.title}`}
                aria-pressed={enabled}
                className={`
                  relative
                  h-7
                  w-14
                  shrink-0
                  rounded-full
                  transition-colors
                  duration-200

                  ${
                    enabled
                      ? "bg-blue-600"
                      : "bg-slate-300 dark:bg-slate-700"
                  }

                  ${
                    notification.required ||
                    disabled
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  }
                `}
              >
                <span
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-sm
                    transition-transform
                    duration-200

                    ${
                      enabled
                        ? "translate-x-8"
                        : "translate-x-1"
                    }
                  `}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* ===================================================
          SECURITY INFORMATION
      =================================================== */}

      <div
        className="
          mt-8
          rounded-2xl
          border
          border-emerald-500/20
          bg-emerald-500/5
          p-5
        "
      >
        <div className="flex items-start gap-3">
          <ShieldAlert
            size={20}
            className="
              mt-0.5
              shrink-0
              text-emerald-500
            "
          />

          <div>
            <p
              className="
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Security Alerts
            </p>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Important security and account notifications
              cannot be disabled.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================
          AUTO SAVE
      =================================================== */}

      <div
        className="
          mt-6
          rounded-xl
          border
          border-blue-500/20
          bg-blue-500/5
          px-4
          py-3
        "
      >
        <p
          className="
            text-sm
            text-slate-600
            dark:text-slate-300
          "
        >
          <span className="font-semibold text-blue-500">
            Preferences are saved automatically.
          </span>{" "}
          Your notification settings remain active across
          the InsightIQ workspace.
        </p>
      </div>
    </div>
  );
}