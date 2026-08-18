import {
  BrainCircuit,
  Check,
  Lightbulb,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { useAppSettings } from "../../context/AppSettingsContext";
import { useLanguage } from "../../context/LanguageContext";

/* =========================================================
   TYPES
========================================================= */

type AIModel =
  | "gemini"
  | "gemini-fast"
  | "gemini-pro";

type AIResponseStyle =
  | "concise"
  | "balanced"
  | "detailed";

/* =========================================================
   COMPONENT
========================================================= */

export default function AISettings() {
  /* =======================================================
     CONTEXT
  ======================================================= */

  const {
    settings,
    updateSetting,
  } = useAppSettings();

  const { t } = useLanguage();

  /* =======================================================
     TRANSLATION FALLBACK
  ======================================================= */

  function translate(
    key: string,
    fallback: string
  ): string {
    const translated = t(key);

    if (
      !translated ||
      translated === key
    ) {
      return fallback;
    }

    return translated;
  }

  /* =======================================================
     AI STATUS
  ======================================================= */

  const aiEnabled = settings.aiEnabled;

  /* =======================================================
     MODEL OPTIONS
  ======================================================= */

  const models: {
    value: AIModel;
    labelKey: string;
    fallback: string;
    descriptionKey: string;
    description: string;
    icon: typeof Sparkles;
  }[] = [
    {
      value: "gemini",
      labelKey: "gemini",
      fallback: "Gemini",
      descriptionKey: "geminiDescription",
      description:
        "Balanced AI performance for everyday analysis.",
      icon: Sparkles,
    },
    {
      value: "gemini-fast",
      labelKey: "geminiFast",
      fallback: "Gemini Fast",
      descriptionKey: "geminiFastDescription",
      description:
        "Faster responses for quick analysis and insights.",
      icon: WandSparkles,
    },
    {
      value: "gemini-pro",
      labelKey: "geminiPro",
      fallback: "Gemini Pro",
      descriptionKey: "geminiProDescription",
      description:
        "Advanced reasoning for deeper business analysis.",
      icon: BrainCircuit,
    },
  ];

  /* =======================================================
     RESPONSE STYLES
  ======================================================= */

  const responseStyles: {
    value: AIResponseStyle;
    labelKey: string;
    fallback: string;
    descriptionKey: string;
    description: string;
  }[] = [
    {
      value: "concise",
      labelKey: "concise",
      fallback: "Concise",
      descriptionKey: "conciseDescription",
      description:
        "Short and direct answers focused on key points.",
    },
    {
      value: "balanced",
      labelKey: "balanced",
      fallback: "Balanced",
      descriptionKey: "balancedDescription",
      description:
        "Clear explanations with useful supporting context.",
    },
    {
      value: "detailed",
      labelKey: "detailed",
      fallback: "Detailed",
      descriptionKey: "detailedDescription",
      description:
        "More comprehensive explanations and analysis.",
    },
  ];

  /* =======================================================
     AI FEATURES
  ======================================================= */

  const aiFeatures: {
    key:
      | "aiAutoInsights"
      | "aiRecommendations"
      | "aiAnomalyDetection";
    titleKey: string;
    title: string;
    descriptionKey: string;
    description: string;
    icon: typeof Lightbulb;
  }[] = [
    {
      key: "aiAutoInsights",
      titleKey: "automaticInsights",
      title: "Automatic Insights",
      descriptionKey:
        "automaticInsightsDescription",
      description:
        "Automatically identify important patterns, trends, and business insights.",
      icon: Lightbulb,
    },
    {
      key: "aiRecommendations",
      titleKey: "aiRecommendations",
      title: "AI Recommendations",
      descriptionKey:
        "aiRecommendationsDescription",
      description:
        "Generate actionable recommendations based on your data.",
      icon: WandSparkles,
    },
    {
      key: "aiAnomalyDetection",
      titleKey: "anomalyDetection",
      title: "Anomaly Detection",
      descriptionKey:
        "anomalyDetectionDescription",
      description:
        "Identify unusual values, trends, or potential data anomalies.",
      icon: ShieldCheck,
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm

        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          border-b
          border-slate-200
          px-5
          py-5
          sm:px-6

          dark:border-slate-800
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600

                dark:bg-blue-500/10
                dark:text-blue-400
              "
            >
              <BrainCircuit size={20} />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  text-base
                  font-semibold
                  text-slate-900

                  dark:text-white
                "
              >
                {translate(
                  "aiSettings",
                  "AI Settings"
                )}
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-500

                  dark:text-slate-400
                "
              >
                {translate(
                  "aiSettingsDescription",
                  "Control how InsightIQ uses AI to analyze your data and generate insights."
                )}
              </p>
            </div>
          </div>

          {/* =================================================
              MASTER TOGGLE
          ================================================= */}

          <button
            type="button"
            role="switch"
            aria-checked={aiEnabled}
            aria-label={translate(
              "enableAI",
              "Enable AI"
            )}
            onClick={() =>
              updateSetting(
                "aiEnabled",
                !aiEnabled
              )
            }
            className={[
              "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
              aiEnabled
                ? "bg-blue-600"
                : "bg-slate-300 dark:bg-slate-700",
            ].join(" ")}
          >
            <span
              className={[
                "absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                aiEnabled
                  ? "translate-x-5"
                  : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="space-y-8 p-5 sm:p-6">
        {/* =================================================
            AI STATUS
        ================================================= */}

        <div
          className={[
            "flex items-start gap-3 rounded-xl border p-4 transition-colors",
            aiEnabled
              ? "border-blue-100 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/5"
              : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              aiEnabled
                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
            ].join(" ")}
          >
            {aiEnabled ? (
              <Sparkles size={17} />
            ) : (
              <BrainCircuit size={17} />
            )}
          </div>

          <div className="min-w-0">
            <p
              className="
                text-sm
                font-semibold
                text-slate-800

                dark:text-slate-200
              "
            >
              {aiEnabled
                ? translate(
                    "aiEnabled",
                    "AI features are enabled"
                  )
                : translate(
                    "aiDisabled",
                    "AI features are disabled"
                  )}
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500

                dark:text-slate-400
              "
            >
              {aiEnabled
                ? translate(
                    "aiEnabledDescription",
                    "InsightIQ can use AI to generate insights, recommendations, and analysis."
                  )
                : translate(
                    "aiDisabledDescription",
                    "Enable AI to use intelligent insights, recommendations, and analysis features."
                  )}
            </p>
          </div>
        </div>

        {/* =================================================
            AI MODEL
        ================================================= */}

        <div>
          <div className="mb-4">
            <h3
              className="
                text-sm
                font-semibold
                text-slate-900

                dark:text-white
              "
            >
              {translate(
                "aiModel",
                "AI Model"
              )}
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500

                dark:text-slate-400
              "
            >
              {translate(
                "aiModelDescription",
                "Choose the AI model InsightIQ should use for analysis."
              )}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {models.map((model) => {
              const selected =
                settings.aiModel ===
                model.value;

              const Icon = model.icon;

              return (
                <button
                  key={model.value}
                  type="button"
                  disabled={!aiEnabled}
                  onClick={() =>
                    updateSetting(
                      "aiModel",
                      model.value
                    )
                  }
                  className={[
                    "relative flex min-h-[132px] flex-col rounded-xl border p-4 text-left transition-all duration-200",
                    "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
                    !aiEnabled
                      ? "cursor-not-allowed opacity-50"
                      : "hover:-translate-y-0.5 hover:shadow-sm",
                    selected
                      ? "border-blue-500 bg-blue-50/60 dark:border-blue-500/50 dark:bg-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
                  ].join(" ")}
                >
                  {/* Selected indicator */}

                  {selected && (
                    <div
                      className="
                        absolute
                        right-3
                        top-3
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-600
                        text-white
                      "
                    >
                      <Check size={12} />
                    </div>
                  )}

                  <div
                    className={[
                      "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
                      selected
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    ].join(" ")}
                  >
                    <Icon size={17} />
                  </div>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-900

                      dark:text-white
                    "
                  >
                    {translate(
                      model.labelKey,
                      model.fallback
                    )}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500

                      dark:text-slate-400
                    "
                  >
                    {translate(
                      model.descriptionKey,
                      model.description
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            RESPONSE STYLE
        ================================================= */}

        <div>
          <div className="mb-4">
            <h3
              className="
                text-sm
                font-semibold
                text-slate-900

                dark:text-white
              "
            >
              {translate(
                "responseStyle",
                "Response Style"
              )}
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500

                dark:text-slate-400
              "
            >
              {translate(
                "responseStyleDescription",
                "Choose how detailed AI-generated responses should be."
              )}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {responseStyles.map(
              (style) => {
                const selected =
                  settings.aiResponseStyle ===
                  style.value;

                return (
                  <button
                    key={style.value}
                    type="button"
                    disabled={!aiEnabled}
                    onClick={() =>
                      updateSetting(
                        "aiResponseStyle",
                        style.value
                      )
                    }
                    className={[
                      "relative flex min-h-[104px] flex-col rounded-xl border p-4 text-left transition-all duration-200",
                      "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
                      !aiEnabled
                        ? "cursor-not-allowed opacity-50"
                        : "hover:border-slate-300 dark:hover:border-slate-700",
                      selected
                        ? "border-blue-500 bg-blue-50/60 dark:border-blue-500/50 dark:bg-blue-500/10"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
                    ].join(" ")}
                  >
                    {selected && (
                      <Check
                        size={15}
                        className="
                          absolute
                          right-3
                          top-3
                          text-blue-600

                          dark:text-blue-400
                        "
                      />
                    )}

                    <div
                      className="
                        mb-2
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <MessageSquareText
                        size={16}
                        className={
                          selected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400"
                        }
                      />

                      <span
                        className="
                          text-sm
                          font-semibold
                          text-slate-900

                          dark:text-white
                        "
                      >
                        {translate(
                          style.labelKey,
                          style.fallback
                        )}
                      </span>
                    </div>

                    <p
                      className="
                        text-xs
                        leading-5
                        text-slate-500

                        dark:text-slate-400
                      "
                    >
                      {translate(
                        style.descriptionKey,
                        style.description
                      )}
                    </p>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            AI FEATURES
        ================================================= */}

        <div>
          <div className="mb-4">
            <h3
              className="
                text-sm
                font-semibold
                text-slate-900

                dark:text-white
              "
            >
              {translate(
                "aiFeatures",
                "AI Features"
              )}
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500

                dark:text-slate-400
              "
            >
              {translate(
                "aiFeaturesDescription",
                "Choose which AI capabilities InsightIQ should use in your workspace."
              )}
            </p>
          </div>

          <div
            className="
              divide-y
              divide-slate-200
              overflow-hidden
              rounded-xl
              border
              border-slate-200

              dark:divide-slate-800
              dark:border-slate-800
            "
          >
            {aiFeatures.map(
              (feature) => {
                const enabled =
                  settings[
                    feature.key
                  ];

                const Icon =
                  feature.icon;

                return (
                  <div
                    key={feature.key}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      bg-white
                      px-4
                      py-4
                      transition-colors

                      dark:bg-slate-900
                    "
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-slate-500

                          dark:bg-slate-800
                          dark:text-slate-400
                        "
                      >
                        <Icon size={17} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-medium
                            text-slate-800

                            dark:text-slate-200
                          "
                        >
                          {translate(
                            feature.titleKey,
                            feature.title
                          )}
                        </p>

                        <p
                          className="
                            mt-1
                            max-w-2xl
                            text-xs
                            leading-5
                            text-slate-500

                            dark:text-slate-400
                          "
                        >
                          {translate(
                            feature.descriptionKey,
                            feature.description
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={
                        enabled
                      }
                      aria-label={translate(
                        feature.titleKey,
                        feature.title
                      )}
                      disabled={
                        !aiEnabled
                      }
                      onClick={() =>
                        updateSetting(
                          feature.key,
                          !enabled
                        )
                      }
                      className={[
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
                        !aiEnabled
                          ? "cursor-not-allowed opacity-40"
                          : "",
                        enabled
                          ? "bg-blue-600"
                          : "bg-slate-300 dark:bg-slate-700",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                          enabled
                            ? "translate-x-5"
                            : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            PRIVACY / INFORMATION NOTE
        ================================================= */}

        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            p-4

            dark:border-slate-800
            dark:bg-slate-800/40
          "
        >
          <ShieldCheck
            size={17}
            className="
              mt-0.5
              shrink-0
              text-slate-500

              dark:text-slate-400
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-slate-500

              dark:text-slate-400
            "
          >
            {translate(
              "aiPrivacyNote",
              "AI settings control how InsightIQ uses its configured AI services. Review your workspace privacy and security settings before processing sensitive business data."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}