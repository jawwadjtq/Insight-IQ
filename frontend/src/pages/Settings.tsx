import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import ChartSettings from "../components/settings/ChartSettings";
import LanguageSettings from "../components/settings/LanguageSettings";
import AISettings from "../components/settings/AISettings";
import ViewSettings from "../components/settings/ViewSettings";
import PlanSettings from "../components/settings/PlanSettings";

export default function Settings() {
  return (
    <div className="min-h-full w-full">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        {/* Hero */}

        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 sm:p-8 lg:p-10">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-3xl">

              <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                Workspace Settings
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                Settings
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Customize your InsightIQ experience. Manage appearance,
                dashboard preferences, AI behavior, notifications,
                language, charts and subscription settings from one place.
              </p>

            </div>

            <div className="hidden lg:flex h-28 w-28 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl">
                ⚙️
              </div>

            </div>

          </div>

        </div>

        {/* Quick Information */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Current Plan
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              Free
            </h2>

          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI Model
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              Gemini
            </h2>

          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Version
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              v1.0
            </h2>

          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Status
            </p>

            <h2 className="mt-3 text-3xl font-bold text-green-500">
              Online
            </h2>

          </div>

        </div>

        {/* Settings Sections */}

        <div className="space-y-8">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <AppearanceSettings />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <ChartSettings />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <NotificationSettings />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <LanguageSettings />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <AISettings />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <ViewSettings />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <PlanSettings />
          </div>

        </div>

        {/* Privacy */}

        <div className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Privacy & Security
          </h2>

          <div className="mt-8 space-y-5">

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">
                Dataset Storage
              </span>

              <span className="font-semibold text-green-500">
                Encrypted
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">
                AI Processing
              </span>

              <span className="font-semibold text-green-500">
                Secure
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">
                Cloud Deployment
              </span>

              <span className="font-semibold text-green-500">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">
                Application Status
              </span>

              <span className="font-semibold text-green-500">
                Operational
              </span>
            </div>

          </div>

        </div>

        {/* About */}

        <div className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            About InsightIQ
          </h2>

          <p className="mt-6 leading-8 text-slate-600 dark:text-slate-400">

            InsightIQ is an AI-powered Business Intelligence platform designed
            to help organizations transform raw datasets into meaningful
            insights through intelligent analytics, interactive dashboards,
            automated reporting, and AI-generated recommendations.

          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-5">

              <p className="text-sm text-slate-500">
                Version
              </p>

              <h3 className="mt-2 text-xl font-bold">
                1.0
              </h3>

            </div>

            <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-5">

              <p className="text-sm text-slate-500">
                Framework
              </p>

              <h3 className="mt-2 text-xl font-bold">
                React + FastAPI
              </h3>

            </div>

            <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-5">

              <p className="text-sm text-slate-500">
                License
              </p>

              <h3 className="mt-2 text-xl font-bold">
                MIT
              </h3>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}