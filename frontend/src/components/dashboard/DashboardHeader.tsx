import {
  ArrowRight,
  BrainCircuit,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { Link } from "react-router-dom";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";

  return "Good Evening";
}

export default function DashboardHeader() {
  const greeting = getGreeting();

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl

        bg-gradient-to-br
        from-blue-700
        via-indigo-700
        to-slate-900

        p-8
        md:p-12

        shadow-2xl
      "
    >
      {/* Background Glow */}

      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10">

        {/* Badge */}

        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">

          <Sparkles size={16} />

          <span className="text-sm font-medium text-white">
            AI Powered Business Intelligence
          </span>

        </div>

        {/* Greeting */}

        <h1 className="mt-8 text-4xl font-bold leading-tight text-white md:text-5xl">

          {greeting},

          <br />

          Welcome to InsightIQ

        </h1>

        {/* Description */}

        <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">

          Upload datasets, generate AI-powered insights,
          explore interactive dashboards and create
          executive reports — all from one intelligent platform.

        </p>

        {/* CTA */}

        <div className="mt-10 flex flex-wrap gap-4">

          <Link
            to="/upload"
            className="
              inline-flex
              items-center
              gap-2

              rounded-2xl

              bg-white

              px-6
              py-4

              font-semibold

              text-blue-700

              transition-all

              hover:scale-105
            "
          >

            <UploadCloud size={20} />

            Upload Dataset

          </Link>

          <Link
            to="/ai"
            className="
              inline-flex
              items-center
              gap-2

              rounded-2xl

              border
              border-white/30

              bg-white/10

              px-6
              py-4

              font-semibold

              text-white

              backdrop-blur-md

              transition-all

              hover:bg-white/20
            "
          >

            <BrainCircuit size={20} />

            AI Analyst

            <ArrowRight size={18} />

          </Link>

        </div>

        {/* Stats */}

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <div>

            <h3 className="text-3xl font-bold text-white">
              20+
            </h3>

            <p className="mt-2 text-blue-200">
              Interactive Charts
            </p>

          </div>

          <div>

            <h3 className="text-3xl font-bold text-white">
              AI
            </h3>

            <p className="mt-2 text-blue-200">
              Business Recommendations
            </p>

          </div>

          <div>

            <h3 className="text-3xl font-bold text-white">
              PDF + Excel
            </h3>

            <p className="mt-2 text-blue-200">
              Professional Reports
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}