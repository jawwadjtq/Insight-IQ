import React from "react";
import {
  Check,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Move,
  Play,
  Sparkles,
} from "lucide-react";
import { useAppSettings } from "../../context/AppSettingsContext";
import { useLanguage } from "../../context/LanguageContext";

type ViewDensity = "comfortable" | "compact";

interface DensityOption {
  value: ViewDensity;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const DENSITY_OPTIONS: DensityOption[] = [
  {
    value: "comfortable",
    label: "Comfortable",
    description:
      "More spacing between interface elements for easier reading and navigation.",
    icon: <Maximize2 size={18} strokeWidth={2} />,
  },
  {
    value: "compact",
    label: "Compact",
    description:
      "Reduced spacing to display more information and controls on screen.",
    icon: <Minimize2 size={18} strokeWidth={2} />,
  },
];

const ViewSettings: React.FC = () => {
  const { settings, updateSetting } = useAppSettings();
  const { t } = useLanguage();

  const translate = (key: string, fallback: string): string => {
    const translated = t(key);

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  };

  const density = settings.compactMode
    ? "compact"
    : "comfortable";

  const handleDensityChange = (value: ViewDensity) => {
    updateSetting("compactMode", value === "compact");
  };

  const handleAnimationsChange = (enabled: boolean) => {
    updateSetting("showAnimations", enabled);
  };

  return (
    <section
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      aria-labelledby="view-settings-title"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
            <LayoutGrid size={22} strokeWidth={2} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="view-settings-title"
              className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg"
            >
              {translate("viewSettings", "View Settings")}
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {translate(
                "viewSettingsDescription",
                "Customize the density and visual behavior of the InsightIQ workspace."
              )}
            </p>
          </div>
        </div>

        {/* Density */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {translate("viewDensity", "View Density")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {translate(
                "viewDensityDescription",
                "Choose how much information and spacing you want throughout the interface."
              )}
            </p>
          </div>

          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            role="radiogroup"
            aria-label={translate("viewDensity", "View Density")}
          >
            {DENSITY_OPTIONS.map((option) => {
              const isSelected = density === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleDensityChange(option.value)}
                  className={[
                    "relative flex min-h-[116px] items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                    "dark:focus-visible:ring-offset-slate-900",
                    isSelected
                      ? "border-cyan-500 bg-cyan-50/60 shadow-sm dark:border-cyan-500 dark:bg-cyan-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/50",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      isSelected
                        ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {option.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {option.label}
                      </p>

                      {isSelected && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white dark:bg-cyan-500">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual preview */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {translate("layoutPreview", "Layout Preview")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {translate(
                "layoutPreviewDescription",
                "Preview how the selected density affects information spacing."
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div
              className={[
                "grid grid-cols-3 transition-all duration-200",
                density === "compact" ? "gap-2" : "gap-3",
              ].join(" ")}
            >
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="h-2 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div
                  className={[
                    "mt-3 rounded-md bg-slate-100 dark:bg-slate-800",
                    density === "compact" ? "h-8" : "h-11",
                  ].join(" ")}
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="h-2 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div
                  className={[
                    "mt-3 rounded-md bg-slate-100 dark:bg-slate-800",
                    density === "compact" ? "h-8" : "h-11",
                  ].join(" ")}
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="h-2 w-1/3 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div
                  className={[
                    "mt-3 rounded-md bg-slate-100 dark:bg-slate-800",
                    density === "compact" ? "h-8" : "h-11",
                  ].join(" ")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Animation settings */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {translate("motion", "Motion & Animation")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {translate(
                "motionDescription",
                "Control interface animations and transitions throughout InsightIQ."
              )}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={[
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  settings.showAnimations
                    ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                ].join(" ")}
              >
                <Play size={17} strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {translate("showAnimations", "Interface Animations")}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {translate(
                    "showAnimationsDescription",
                    "Enable smooth transitions, hover effects, and interface motion."
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.showAnimations}
              aria-label={translate(
                "showAnimations",
                "Interface Animations"
              )}
              onClick={() =>
                handleAnimationsChange(!settings.showAnimations)
              }
              className={[
                "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                "dark:focus-visible:ring-offset-slate-900",
                settings.showAnimations
                  ? "bg-cyan-600 dark:bg-cyan-500"
                  : "bg-slate-300 dark:bg-slate-700",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  settings.showAnimations
                    ? "translate-x-5"
                    : "translate-x-0.5",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        {/* Current configuration summary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
            <Move
              size={17}
              className="shrink-0 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {translate("density", "Density")}
              </p>

              <p className="mt-0.5 truncate text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
                {density}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
            <Sparkles
              size={17}
              className="shrink-0 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {translate("animations", "Animations")}
              </p>

              <p className="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {settings.showAnimations
                  ? translate("enabled", "Enabled")
                  : translate("disabled", "Disabled")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ViewSettings;