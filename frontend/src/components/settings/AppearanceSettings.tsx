import {
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

import {
  useAppSettings,
} from "../../context/AppSettingsContext";

import {
  useLanguage,
} from "../../context/LanguageContext";

/* =========================================================
   APPEARANCE SETTINGS
========================================================= */

export default function AppearanceSettings() {
  /* =======================================================
     THEME
  ======================================================= */

  const {
    theme,
    setTheme,
  } = useTheme();

  /* =======================================================
     APP SETTINGS
  ======================================================= */

  const {
    settings,
    updateSetting,
  } = useAppSettings();

  /* =======================================================
     LANGUAGE
  ======================================================= */

  const { t } = useLanguage();

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-8
        text-slate-900

        dark:bg-slate-900
        dark:text-white
      "
    >
      {/* =====================================================
          TITLE
      ===================================================== */}

      <h2 className="mb-6 text-2xl font-bold">
        {t("appearance")}
      </h2>

      <div className="space-y-8">
        {/* ===================================================
            THEME
        =================================================== */}

        <div>
          <h3 className="mb-4 text-lg font-semibold">
            {t("theme")}
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            {/* =================================================
                LIGHT
            ================================================= */}

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`
                rounded-xl
                border
                p-5
                text-center
                transition-all

                ${
                  theme === "light"
                    ? `
                      border-blue-500
                      bg-blue-600
                      text-white
                      shadow-lg
                      shadow-blue-500/20
                    `
                    : `
                      border-slate-200
                      bg-slate-50
                      hover:border-blue-400

                      dark:border-slate-700
                      dark:bg-slate-800
                    `
                }
              `}
            >
              <Sun
                className="mx-auto mb-3"
                size={30}
              />

              <h4 className="font-semibold">
                {t("light")}
              </h4>

              <p
                className={`
                  mt-2
                  text-sm

                  ${
                    theme === "light"
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }
                `}
              >
                {t("lightDescription")}
              </p>
            </button>

            {/* =================================================
                DARK
            ================================================= */}

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`
                rounded-xl
                border
                p-5
                text-center
                transition-all

                ${
                  theme === "dark"
                    ? `
                      border-blue-500
                      bg-blue-600
                      text-white
                      shadow-lg
                      shadow-blue-500/20
                    `
                    : `
                      border-slate-200
                      bg-slate-50
                      hover:border-blue-400

                      dark:border-slate-700
                      dark:bg-slate-800
                    `
                }
              `}
            >
              <Moon
                className="mx-auto mb-3"
                size={30}
              />

              <h4 className="font-semibold">
                {t("dark")}
              </h4>

              <p
                className={`
                  mt-2
                  text-sm

                  ${
                    theme === "dark"
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }
                `}
              >
                {t("darkDescription")}
              </p>
            </button>

            {/* =================================================
                SYSTEM
            ================================================= */}

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`
                rounded-xl
                border
                p-5
                text-center
                transition-all

                ${
                  theme === "system"
                    ? `
                      border-blue-500
                      bg-blue-600
                      text-white
                      shadow-lg
                      shadow-blue-500/20
                    `
                    : `
                      border-slate-200
                      bg-slate-50
                      hover:border-blue-400

                      dark:border-slate-700
                      dark:bg-slate-800
                    `
                }
              `}
            >
              <Monitor
                className="mx-auto mb-3"
                size={30}
              />

              <h4 className="font-semibold">
                {t("system")}
              </h4>

              <p
                className={`
                  mt-2
                  text-sm

                  ${
                    theme === "system"
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }
                `}
              >
                {t("systemDescription")}
              </p>
            </button>
          </div>
        </div>

        {/* ===================================================
            FONT SIZE
        =================================================== */}

        <div>
          <label
            htmlFor="font-size"
            className="mb-3 block font-semibold"
          >
            {t("fontSize")}
          </label>

          <select
            id="font-size"
            value={settings.fontSize}
            onChange={(event) =>
              updateSetting(
                "fontSize",
                event.target.value as
                  | "small"
                  | "medium"
                  | "large"
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              p-3
              text-slate-900
              outline-none
              transition

              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20

              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          >
            <option value="small">
              {t("small")}
            </option>

            <option value="medium">
              {t("medium")}
            </option>

            <option value="large">
              {t("large")}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}