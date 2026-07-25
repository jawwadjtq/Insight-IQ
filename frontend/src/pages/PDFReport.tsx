import { useLocation } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  Sparkles,
  Printer,
  Copy,
  Download,
} from "lucide-react";

export default function PDFReport() {
  const location = useLocation();

  const report = location.state?.report;
  const filename = location.state?.filename;

  if (!report) {
    return (
      <div className="min-h-full w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              No PDF Report
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              No PDF report available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
       {/* ================= HEADER ================= */}

<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-8 md:p-10 shadow-2xl">

  <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

  <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

    <div>

      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">

        <Sparkles size={18} />

        AI Generated Report

      </div>

      <h1 className="mt-6 text-4xl font-bold text-white md:text-5xl">

        Executive PDF Analysis

      </h1>

      <p className="mt-4 max-w-2xl text-blue-100">

        InsightIQ has analyzed your uploaded PDF and generated an
        AI-powered executive report containing summaries, findings,
        recommendations and business insights.

      </p>

      <div className="mt-6 flex flex-wrap gap-3">

        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white">

          <Calendar size={16} />

          {new Date().toLocaleDateString()}

        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white">

          <Clock size={16} />

          {Math.max(1, Math.ceil(report.split(" ").length / 220))} min read

        </div>

      </div>

    </div>

    <div className="flex flex-wrap gap-3">

      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:scale-105"
      >
        <Printer size={18} />
        Print
      </button>

      <button
        onClick={() => navigator.clipboard.writeText(report)}
        className="flex items-center gap-2 rounded-xl border border-white px-5 py-3 text-white transition hover:bg-white hover:text-blue-700"
      >
        <Copy size={18} />
        Copy
      </button>

      <button
        className="flex items-center gap-2 rounded-xl border border-white px-5 py-3 text-white transition hover:bg-white hover:text-blue-700"
      >
        <Download size={18} />
        Download
      </button>

    </div>

  </div>

</div>
        {/* ================= REPORT ================= */}

<div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">

  <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-8 py-6">

    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
      AI Generated Analysis
    </h2>

    <p className="mt-2 text-slate-500 dark:text-slate-400">
      Executive summary generated automatically using InsightIQ AI.
    </p>

  </div>

  <div className="px-8 py-10">

    <article
      className="
      whitespace-pre-wrap
      break-words
      leading-9

      text-slate-700
      dark:text-slate-300

      text-base
      "
    >

      {report}

    </article>

  </div>

</div>
{/* ================= REPORT SUMMARY ================= */}

<div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-8">

  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
    Report Information
  </h2>

  <div className="mt-8 grid gap-6 md:grid-cols-3">

    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-6">

      <p className="text-sm text-slate-500">
        File Name
      </p>

      <h3 className="mt-2 font-semibold text-slate-900 dark:text-white break-all">
        {filename}
      </h3>

    </div>

    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-6">

      <p className="text-sm text-slate-500">
        AI Confidence
      </p>

      <h3 className="mt-2 text-3xl font-bold text-green-500">
        96%
      </h3>

    </div>

    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-6">

      <p className="text-sm text-slate-500">
        Generated
      </p>

      <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">
        {new Date().toLocaleString()}
      </h3>

    </div>

  </div>

</div>

{/* Footer */}

<div className="pb-10 pt-4 text-center">

  <p className="text-sm text-slate-500 dark:text-slate-400">
    Generated automatically by InsightIQ AI Analytics Platform
  </p>

</div>
        </div>
      </div>
  
  );
}
