import {
  BarChart3,
  LineChart,
  AreaChart,
  Grid3X3,
  List,
  MousePointer2,
  Sparkles,
} from "lucide-react";

import {
  useAppSettings,
  type ChartType,
} from "../../context/AppSettingsContext";

import {
  useLanguage,
} from "../../context/LanguageContext";

/* =========================================================
   CHART SETTINGS
========================================================= */

export default function ChartSettings() {
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
     CHART TYPES
  ======================================================= */

  const chartTypes: {
    value: ChartType;
    label: string;
    description: string;
    icon: typeof BarChart3;
  }[] = [
    {
      value: "bar",
      label: t("barChart"),
      description: t("barChartDescription"),
      icon: BarChart3,
    },
    {
      value: "line",
      label: t("lineChart"),
      description: t("lineChartDescription"),
      icon: LineChart,
    },
    {
      value: "area",
      label: t("areaChart"),
      description: t("areaChartDescription"),
      icon: AreaChart,
    },
  ];

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
        text-slate-900

        dark:border-slate-800
        dark:bg-slate-900
        dark:text-white
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex items-start gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-100
            text-blue-600
            dark:bg-blue-600/20
            dark:text-blue-400
          "
        >
          <BarChart3 size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            {t("chartSettings")}
          </h2>

          <p
            className="
              mt-1
              text-slate-500
              dark:text-slate-400
            "
          >
            {t("chartSettingsDescription")}
          </p>
        </div>
      </div>

      {/* =====================================================
          DEFAULT CHART TYPE
      ===================================================== */}

      <div className="mb-10">
        <h3
          className="
            mb-4
            text-lg
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          {t("defaultChartType")}
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          {chartTypes.map((chart) => {
            const Icon = chart.icon;

            const active =
              settings.chartType === chart.value;

            return (
              <button
                key={chart.value}
                type="button"
                onClick={() =>
                  updateSetting(
                    "chartType",
                    chart.value
                  )
                }
                aria-pressed={active}
                className={`
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition-all
                  duration-200

                  ${
                    active
                      ? `
                        border-blue-500
                        bg-blue-50
                        ring-2
                        ring-blue-500/20
                        dark:bg-blue-600/20
                      `
                      : `
                        border-slate-200
                        bg-slate-50
                        hover:border-blue-400
                        hover:bg-slate-100
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:hover:border-slate-500
                      `
                  }
                `}
              >
                <Icon
                  size={28}
                  className={
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500"
                  }
                />

                <h4
                  className="
                    mt-4
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {chart.label}
                </h4>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {chart.description}
                </p>

                {active && (
                  <div
                    className="
                      mt-4
                      inline-flex
                      items-center
                      rounded-full
                      bg-blue-600
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-white
                    "
                  >
                    ✓ {t("active")}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          DISPLAY OPTIONS
      ===================================================== */}

      <div>
        <h3
          className="
            mb-4
            text-lg
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          {t("displayOptions")}
        </h3>

        <div className="space-y-4">
          {/* =================================================
              GRID
          ================================================= */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-between
              gap-6
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5
              transition
              hover:border-slate-300

              dark:border-slate-700
              dark:bg-slate-800
              dark:hover:border-slate-500
            "
          >
            <div className="flex min-w-0 items-center gap-4">
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
                "
              >
                <Grid3X3
                  size={22}
                  className="
                    text-blue-600
                    dark:text-blue-400
                  "
                />
              </div>

              <div>
                <p
                  className="
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {t("showGrid")}
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
                  {t("showGridDescription")}
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(event) =>
                updateSetting(
                  "showGrid",
                  event.target.checked
                )
              }
              className="
                h-5
                w-5
                shrink-0
                cursor-pointer
                accent-blue-600
              "
            />
          </label>

          {/* =================================================
              LEGEND
          ================================================= */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-between
              gap-6
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5
              transition
              hover:border-slate-300

              dark:border-slate-700
              dark:bg-slate-800
              dark:hover:border-slate-500
            "
          >
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-500/10
                "
              >
                <List
                  size={22}
                  className="
                    text-purple-600
                    dark:text-purple-400
                  "
                />
              </div>

              <div>
                <p
                  className="
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {t("showLegend")}
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
                  {t("showLegendDescription")}
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={settings.showLegend}
              onChange={(event) =>
                updateSetting(
                  "showLegend",
                  event.target.checked
                )
              }
              className="
                h-5
                w-5
                shrink-0
                cursor-pointer
                accent-blue-600
              "
            />
          </label>

          {/* =================================================
              TOOLTIP
          ================================================= */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-between
              gap-6
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5
              transition
              hover:border-slate-300

              dark:border-slate-700
              dark:bg-slate-800
              dark:hover:border-slate-500
            "
          >
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-500/10
                "
              >
                <MousePointer2
                  size={22}
                  className="
                    text-green-600
                    dark:text-green-400
                  "
                />
              </div>

              <div>
                <p
                  className="
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {t("showTooltip")}
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
                  {t("showTooltipDescription")}
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={settings.showTooltip}
              onChange={(event) =>
                updateSetting(
                  "showTooltip",
                  event.target.checked
                )
              }
              className="
                h-5
                w-5
                shrink-0
                cursor-pointer
                accent-blue-600
              "
            />
          </label>

          {/* =================================================
              ANIMATIONS
          ================================================= */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-between
              gap-6
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-5
              transition
              hover:border-slate-300

              dark:border-slate-700
              dark:bg-slate-800
              dark:hover:border-slate-500
            "
          >
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-yellow-500/10
                "
              >
                <Sparkles
                  size={22}
                  className="
                    text-yellow-600
                    dark:text-yellow-400
                  "
                />
              </div>

              <div>
                <p
                  className="
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {t("chartAnimations")}
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
                  {t("chartAnimationsDescription")}
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={settings.animations}
              onChange={(event) =>
                updateSetting(
                  "animations",
                  event.target.checked
                )
              }
              className="
                h-5
                w-5
                shrink-0
                cursor-pointer
                accent-blue-600
              "
            />
          </label>
        </div>
      </div>

      {/* =====================================================
          AUTO SAVE INFORMATION
      ===================================================== */}

      <div
        className="
          mt-8
          rounded-2xl
          border
          border-blue-500/20
          bg-blue-500/5
          p-5
        "
      >
        <div className="flex items-start gap-3">
          <Sparkles
            size={20}
            className="
              mt-0.5
              shrink-0
              text-blue-500
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
              {t("chartPreferencesSaved")}
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
              {t("chartPreferencesSavedDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}