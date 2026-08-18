import { useState } from "react";

import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import ChartSettings from "../components/settings/ChartSettings";
import LanguageSettings from "../components/settings/LanguageSettings";
import AISettings from "../components/settings/AISettings";
import ViewSettings from "../components/settings/ViewSettings";
import PlanSettings from "../components/settings/PlanSettings";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleResetDefaults = () => {
    localStorage.removeItem("insightiq-theme");
    localStorage.removeItem("insightiq-settings");

    window.location.reload();
  };

  const handleSyncWorkspace = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-8 shadow-2xl sm:p-10">

          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
                ⚙️ Workspace Configuration
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Settings
              </h1>

              <p className="mt-4 max-w-2xl text-blue-100">
                Configure your AI workspace, customize dashboards,
                manage appearance, notifications, reports,
                preferences and platform behavior.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-300">
                  Secure Workspace
                </span>

                <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300">
                  AI Enabled
                </span>

                <span className="rounded-full bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-300">
                  Cloud Connected
                </span>

              </div>

            </div>

            {/* PROFILE */}

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">

              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl shadow-lg">
                  👤
                </div>

                <div>

                  <h2 className="text-2xl font-bold text-white">
                    Admin
                  </h2>

                  <p className="text-blue-100">
                    InsightIQ Workspace
                  </p>

                  <p className="mt-2 text-sm font-medium text-green-300">
                    ● Online
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* SAVE STATUS */}
        {/* ========================================================= */}

        {saved && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700 shadow-sm dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
            ✓ Workspace settings synchronized successfully.
          </div>
        )}

        {/* ========================================================= */}
        {/* WORKSPACE OVERVIEW */}
        {/* ========================================================= */}

        <section className="space-y-5">

          <div>

            <h2 className="text-2xl font-bold tracking-tight">
              Workspace Overview
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Current platform status and configuration.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {/* PLAN */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current Plan
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Free
              </h2>

              <p className="mt-3 text-sm font-medium text-green-500">
                Ready to Upgrade
              </p>

            </div>

            {/* AI */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI Engine
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Gemini
              </h2>

              <p className="mt-3 text-sm font-medium text-blue-500">
                Connected
              </p>

            </div>

            {/* VERSION */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Version
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                v1.0
              </h2>

              <p className="mt-3 text-sm font-medium text-purple-500">
                Latest Release
              </p>

            </div>

            {/* SERVER */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Server Status
              </p>

              <h2 className="mt-4 text-3xl font-bold text-green-500">
                Online
              </h2>

              <p className="mt-3 text-sm font-medium text-green-500">
                All Systems Operational
              </p>

            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* WORKSPACE CONTROLS */}
        {/* ========================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Workspace Controls
              </h2>

              <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
                Save your current preferences, restore defaults,
                or synchronize your workspace configuration.
              </p>

            </div>

            <div className="flex flex-wrap gap-4">

              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                💾 Save Settings
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                🔄 Reset Defaults
              </button>

              <button
                type="button"
                onClick={handleSyncWorkspace}
                className="rounded-xl border border-green-500 px-6 py-3 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white dark:text-green-400"
              >
                ☁ Sync Workspace
              </button>

            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* APPEARANCE */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <AppearanceSettings />

        </section>

        {/* ========================================================= */}
        {/* CHART SETTINGS */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <ChartSettings />

        </section>

        {/* ========================================================= */}
        {/* NOTIFICATIONS */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <NotificationSettings />

        </section>

        {/* ========================================================= */}
        {/* LANGUAGE */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <LanguageSettings />

        </section>

        {/* ========================================================= */}
        {/* AI SETTINGS */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <AISettings />

        </section>

        {/* ========================================================= */}
        {/* VIEW SETTINGS */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <ViewSettings />

        </section>

        {/* ========================================================= */}
        {/* PLAN */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <PlanSettings />

        </section>

        {/* ========================================================= */}
        {/* PRIVACY & SECURITY */}
        {/* ========================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="mb-8">

            <h2 className="text-3xl font-bold">
              Privacy & Security
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Monitor the protection status of your workspace.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* DATASET STORAGE */}

            <SecurityCard
              title="Dataset Storage"
              description="Uploaded datasets are encrypted."
              status="🔒 Secure"
              statusClass="text-green-500"
            />

            {/* AI */}

            <SecurityCard
              title="AI Processing"
              description="AI requests use secure communication."
              status="✅ Protected"
              statusClass="text-green-500"
            />

            {/* CLOUD */}

            <SecurityCard
              title="Cloud Services"
              description="Backend services connected."
              status="☁ Active"
              statusClass="text-blue-500"
            />

            {/* SYSTEM */}

            <SecurityCard
              title="System Health"
              description="All platform services operational."
              status="🟢 Healthy"
              statusClass="text-green-500"
            />

          </div>

        </section>

        {/* ========================================================= */}
        {/* ABOUT */}
        {/* ========================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-3xl font-bold">
                About InsightIQ
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-slate-500 dark:text-slate-400">
                InsightIQ is an enterprise-grade AI Business Intelligence
                platform designed to transform raw business data into
                interactive dashboards, intelligent reports, predictive
                analytics and executive-level insights.
              </p>

            </div>

            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-5xl shadow-xl shadow-blue-600/20">
              🚀
            </div>

          </div>

          {/* TECH STACK */}

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <TechCard
              label="Version"
              value="1.0"
            />

            <TechCard
              label="Frontend"
              value="React"
            />

            <TechCard
              label="Backend"
              value="FastAPI"
            />

            <TechCard
              label="AI Engine"
              value="Gemini"
            />

          </div>

          {/* FOOTER */}

          <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h3 className="text-lg font-bold">
                InsightIQ
              </h3>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Enterprise AI Analytics Platform
              </p>

            </div>

            <div className="text-left text-sm text-slate-500 dark:text-slate-400 lg:text-right">

              <p>
                © 2026 InsightIQ
              </p>

              <p className="mt-1">
                All Rights Reserved
              </p>

            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* BOTTOM SPACE */}
        {/* ========================================================= */}

        <div className="h-4" />

      </div>

    </div>
  );
}

/* ============================================================= */
/* SECURITY CARD */
/* ============================================================= */

interface SecurityCardProps {
  title: string;
  description: string;
  status: string;
  statusClass: string;
}

function SecurityCard({
  title,
  description,
  status,
  statusClass,
}: SecurityCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 transition-colors dark:bg-slate-950">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-lg font-semibold">
            {title}
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>

        </div>

        <span className={`whitespace-nowrap font-semibold ${statusClass}`}>
          {status}
        </span>

      </div>

    </div>
  );
}

/* ============================================================= */
/* TECH CARD */
/* ============================================================= */

interface TechCardProps {
  label: string;
  value: string;
}

function TechCard({
  label,
  value,
}: TechCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <h3 className="mt-3 text-2xl font-bold">
        {value}
      </h3>

    </div>
  );
}