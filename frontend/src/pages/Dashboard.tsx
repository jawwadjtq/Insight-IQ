import {
  Database,
  Brain,
  FileSpreadsheet,
  FileText,
  ArrowRight,
  Sparkles,
  BarChart3,
  UploadCloud,
  Activity,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-10">

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-10 md:p-16 shadow-2xl">

        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 max-w-4xl">

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">

            <Sparkles size={18} />

            AI Powered Business Intelligence

          </div>

          <h1 className="mt-8 text-4xl md:text-6xl font-bold leading-tight">

            Transform Your Data

            <br />

            Into Business Decisions

          </h1>

          <p className="mt-6 max-w-2xl text-lg text-blue-100">

            InsightIQ helps organizations analyze CSV, Excel and PDF
            documents using Artificial Intelligence, interactive dashboards,
            visual analytics and automated business reports.

          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-blue-700 transition hover:scale-105"
            >
              <UploadCloud size={20} />
              Upload Dataset
            </Link>

            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-white px-6 py-4 transition hover:bg-white hover:text-blue-700"
            >
              Open Dashboard
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>

      {/* ================= STATS ================= */}

      <section className="grid gap-6 md:grid-cols-4">

        {[
          {
            title: "AI Analysis",
            value: "Instant",
            icon: Brain,
          },
          {
            title: "Supported Files",
            value: "CSV • XLSX • PDF",
            icon: FileSpreadsheet,
          },
          {
            title: "Interactive Charts",
            value: "20+",
            icon: BarChart3,
          },
          {
            title: "Business Reports",
            value: "Unlimited",
            icon: FileText,
          },
        ].map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
            >

              <Icon
                className="mb-4 text-blue-400"
                size={34}
              />

              <p className="text-slate-400">

                {item.title}

              </p>

              <h3 className="mt-3 text-2xl font-bold">

                {item.value}

              </h3>

            </div>

          );

        })}

      </section>

      {/* ================= FEATURES ================= */}

      <section>

        <div className="mb-8">

          <h2 className="text-3xl font-bold">

            Platform Features

          </h2>

          <p className="mt-2 text-slate-400">

            Everything required for modern AI-powered analytics.

          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {[
            {
              icon: Database,
              title: "Dataset Analysis",
              text: "Analyze structured CSV and Excel datasets instantly.",
            },
            {
              icon: Brain,
              title: "AI Insights",
              text: "Receive intelligent recommendations automatically.",
            },
            {
              icon: FileText,
              title: "Executive Reports",
              text: "Generate downloadable PDF and Excel reports.",
            },
            {
              icon: Activity,
              title: "Interactive Dashboard",
              text: "Visualize business metrics through dynamic charts.",
            },
          ].map((feature) => {

            const Icon = feature.icon;

            return (

              <div
                key={feature.title}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition duration-300 hover:-translate-y-1 hover:border-blue-500"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                  <Icon
                    className="text-blue-400"
                    size={30}
                  />

                </div>

                <h3 className="text-xl font-bold">

                  {feature.title}

                </h3>

                <p className="mt-4 text-slate-400 leading-7">

                  {feature.text}

                </p>

              </div>

            );

          })}

        </div>

      </section>

      {/* ================= ACTIVITY ================= */}

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <h2 className="text-2xl font-bold">

          Getting Started

        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-slate-950 p-6">

            <h3 className="font-semibold">

              Step 1

            </h3>

            <p className="mt-3 text-slate-400">

              Upload your CSV, Excel or PDF document.

            </p>

          </div>

          <div className="rounded-2xl bg-slate-950 p-6">

            <h3 className="font-semibold">

              Step 2

            </h3>

            <p className="mt-3 text-slate-400">

              Let InsightIQ analyze and clean the dataset.

            </p>

          </div>

          <div className="rounded-2xl bg-slate-950 p-6">

            <h3 className="font-semibold">

              Step 3

            </h3>

            <p className="mt-3 text-slate-400">

              Explore dashboards, AI insights and reports.

            </p>

          </div>

        </div>

      </section>

    </div>
  );
}