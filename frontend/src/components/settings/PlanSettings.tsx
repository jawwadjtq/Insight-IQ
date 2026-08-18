import React from "react";
import {
  BarChart3,
  Check,
  Crown,
  Database,
  FileText,
  Infinity,
  Lock,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useAppSettings } from "../../context/AppSettingsContext";
import { useLanguage } from "../../context/LanguageContext";

type Plan = "free" | "pro" | "enterprise";

interface PlanOption {
  value: Plan;
  name: string;
  description: string;
  price: string;
  priceSuffix: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    value: "free",
    name: "Free",
    description: "A simple starting point for exploring InsightIQ.",
    price: "$0",
    priceSuffix: "forever",
    icon: <Zap size={20} strokeWidth={2} />,
    features: [
      "Basic dashboards",
      "Limited data analysis",
      "Standard visualizations",
      "Basic AI capabilities",
    ],
  },
  {
    value: "pro",
    name: "Pro",
    description: "Advanced analytics for individuals and growing teams.",
    price: "$19",
    priceSuffix: "per user / month",
    icon: <Crown size={20} strokeWidth={2} />,
    recommended: true,
    features: [
      "Advanced dashboards",
      "Expanded data analysis",
      "Advanced visualizations",
      "AI-powered insights",
      "Anomaly detection",
      "Priority processing",
    ],
  },
  {
    value: "enterprise",
    name: "Enterprise",
    description: "Advanced capabilities for organizations and larger teams.",
    price: "Custom",
    priceSuffix: "contact sales",
    icon: <Sparkles size={20} strokeWidth={2} />,
    features: [
      "Everything in Pro",
      "Large-scale data workloads",
      "Advanced workspace controls",
      "Organization-level management",
      "Enterprise support",
      "Custom requirements",
    ],
  },
];

const PLAN_FEATURE_ICONS = [
  <BarChart3 size={16} strokeWidth={2} />,
  <Database size={16} strokeWidth={2} />,
  <FileText size={16} strokeWidth={2} />,
  <Sparkles size={16} strokeWidth={2} />,
  <Users size={16} strokeWidth={2} />,
  <Infinity size={16} strokeWidth={2} />,
];

const PlanSettings: React.FC = () => {
  const { settings, updateSetting } = useAppSettings();
  const { t } = useLanguage();

  const translate = (key: string, fallback: string): string => {
    const translated = t(key);

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  };

  const currentPlan = settings.plan as Plan;

  const handlePlanSelect = (plan: Plan) => {
    updateSetting("plan", plan);
  };

  return (
    <section
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      aria-labelledby="plan-settings-title"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Crown size={22} strokeWidth={2} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="plan-settings-title"
                className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg"
              >
                {translate("planBilling", "Plan & Billing")}
              </h2>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                {translate("active", "Active")}
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {translate(
                "planBillingDescription",
                "Manage your InsightIQ workspace plan and review the capabilities available to your account."
              )}
            </p>
          </div>
        </div>

        {/* Current plan */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                {currentPlan === "free" && <Zap size={19} />}
                {currentPlan === "pro" && <Crown size={19} />}
                {currentPlan === "enterprise" && <Sparkles size={19} />}
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {translate("currentPlan", "Current plan")}
                </p>

                <p className="mt-0.5 text-base font-semibold capitalize text-slate-900 dark:text-white">
                  {currentPlan}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translate(
                  "planSelectionLocal",
                  "Plan selection is currently stored locally for this workspace."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {translate("availablePlans", "Available Plans")}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {translate(
                "availablePlansDescription",
                "Choose the plan that best matches your analytics and collaboration needs."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {PLAN_OPTIONS.map((plan) => {
              const isSelected = currentPlan === plan.value;

              return (
                <div
                  key={plan.value}
                  className={[
                    "relative flex flex-col rounded-2xl border p-5 transition-all duration-200",
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/40 shadow-sm dark:border-indigo-500 dark:bg-indigo-500/5"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
                  ].join(" ")}
                >
                  {/* Recommended badge */}
                  {plan.recommended && (
                    <div className="absolute -top-3 left-5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm dark:bg-indigo-500">
                      {translate("recommended", "Recommended")}
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isSelected
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                      ].join(" ")}
                    >
                      {plan.icon}
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                        <Check size={12} strokeWidth={3} />
                        {translate("current", "Current")}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {plan.name}
                    </h4>

                    <p className="mt-1 min-h-[40px] text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-5 border-b border-slate-200 pb-5 dark:border-slate-800">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {plan.price}
                      </span>

                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {plan.priceSuffix}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 py-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {translate("includes", "Includes")}
                    </p>

                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-xs leading-5 text-slate-600 dark:text-slate-300"
                        >
                          <span className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400">
                            {PLAN_FEATURE_ICONS[index % PLAN_FEATURE_ICONS.length]}
                          </span>

                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Plan action */}
                  <button
                    type="button"
                    disabled={isSelected}
                    onClick={() => handlePlanSelect(plan.value)}
                    className={[
                      "w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                      "dark:focus-visible:ring-offset-slate-900",
                      isSelected
                        ? "cursor-default border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500"
                        : plan.value === "pro"
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800",
                    ].join(" ")}
                  >
                    {isSelected
                      ? translate("currentPlan", "Current Plan")
                      : plan.value === "enterprise"
                        ? translate("contactSales", "Contact Sales")
                        : plan.value === "pro"
                          ? translate("selectPro", "Select Pro")
                          : translate("selectFree", "Select Free")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing status */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
              <Lock size={17} strokeWidth={2} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {translate("billingStatus", "Billing Status")}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {translate(
                  "billingStatusDescription",
                  "Online payment and subscription management are not connected to this settings screen."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
              <Database size={17} strokeWidth={2} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {translate("workspacePlan", "Workspace Plan")}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {translate(
                  "workspacePlanDescription",
                  "Your selected plan is persisted with the rest of your InsightIQ workspace settings."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise note */}
        <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 dark:border-indigo-500/20 dark:bg-indigo-500/5">
          <Sparkles
            size={18}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
              {translate(
                "enterpriseReady",
                "Built for growing teams"
              )}
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-700/80 dark:text-indigo-300/70">
              {translate(
                "enterpriseReadyDescription",
                "InsightIQ's plan structure is designed to support individual analysts, professional teams, and larger organizations as the platform evolves."
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanSettings;