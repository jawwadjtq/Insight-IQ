import { Link } from "react-router-dom";
import {
  Database,
  Brain,
  FileSpreadsheet,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Hero */}

      <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 md:p-10 text-white">

        <div className="max-w-3xl">

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            AI Powered
            <br />
            Business Intelligence
          </h1>

          <p className="mt-5 text-base md:text-xl text-blue-100 leading-7">
            Upload CSV, Excel or PDF documents and instantly generate
            dashboards, AI insights, executive summaries and business reports.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">

            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-slate-100"
            >
              Upload File
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/analytics"
              className="inline-flex items-center justify-center rounded-xl border border-white px-6 py-3 font-semibold transition hover:bg-white hover:text-blue-700"
            >
              Open Dashboard
            </Link>

          </div>

        </div>

      </section>

      {/* Features */}

      <section>

        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Platform Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-500 transition">

            <Database
              size={40}
              className="text-blue-400"
            />

            <h3 className="mt-5 text-xl font-bold">
              CSV Analysis
            </h3>

            <p className="mt-3 text-slate-400 leading-7">
              Upload CSV datasets and instantly explore statistics,
              quality scores and interactive visualizations.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-green-500 transition">

            <FileSpreadsheet
              size={40}
              className="text-green-400"
            />

            <h3 className="mt-5 text-xl font-bold">
              Excel Analytics
            </h3>

            <p className="mt-3 text-slate-400 leading-7">
              Analyze Excel workbooks using AI and discover hidden
              trends in your business data.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-orange-500 transition">

            <FileText
              size={40}
              className="text-orange-400"
            />

            <h3 className="mt-5 text-xl font-bold">
              PDF Reports
            </h3>

            <p className="mt-3 text-slate-400 leading-7">
              Generate executive summaries, risks, opportunities and
              recommendations from lengthy PDF documents.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-purple-500 transition">

            <Brain
              size={40}
              className="text-purple-400"
            />

            <h3 className="mt-5 text-xl font-bold">
              AI Analyst
            </h3>

            <p className="mt-3 text-slate-400 leading-7">
              Ask natural language questions about your uploaded
              datasets and receive intelligent business insights.
            </p>

          </div>

        </div>

      </section>

      {/* Quick Stats */}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">

          <h2 className="text-4xl font-bold text-blue-400">
            CSV
          </h2>

          <p className="mt-3 text-slate-400">
            Dataset Analysis
          </p>

        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">

          <h2 className="text-4xl font-bold text-green-400">
            XLSX
          </h2>

          <p className="mt-3 text-slate-400">
            Excel Analytics
          </p>

        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">

          <h2 className="text-4xl font-bold text-orange-400">
            PDF
          </h2>

          <p className="mt-3 text-slate-400">
            AI Reports
          </p>

        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">

          <h2 className="text-4xl font-bold text-purple-400">
            AI
          </h2>

          <p className="mt-3 text-slate-400">
            Smart Assistant
          </p>

        </div>

      </section>

    </div>
  );
}