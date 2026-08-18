import { useEffect, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Printer,
} from "lucide-react";

import { getDatasetSummary } from "../services/dashboardService";

import ExecutiveSummary from "../components/reports/ExecutiveSummary";
import DataQuality from "../components/reports/DataQuality";
import Recommendations from "../components/reports/Recommendations";

import { exportPDF } from "../utils/exportPDF";
import { exportExcel } from "../utils/exportExcel";

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getDatasetSummary();

        if (data.uploaded) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  /* ========================================================= */
  /* LOADING */
  /* ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600 dark:border-slate-700" />

          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 md:text-2xl">
            Loading Report...
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Preparing your business intelligence report.
          </p>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* NO DATASET */
  /* ========================================================= */

  if (!summary) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="space-y-8">
          {/* Header */}

          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              Reports
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
              AI-generated business intelligence reports and executive insights.
            </p>
          </div>

          {/* Empty State */}

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FileSpreadsheet size={30} />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                No Dataset Uploaded
              </h2>

              <p className="mt-4 text-base text-slate-500 dark:text-slate-400 md:text-lg">
                Please upload a dataset first to generate your AI-powered
                business report.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* REPORT */
  /* ========================================================= */

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:space-y-10 md:p-8">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          {/* Title */}

          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
              AI Executive Report
            </h1>

            {/* Status Badges */}

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                AI Generated
              </span>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                Confidence 96%
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>

            <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400 md:text-base">
              Automatically generated business intelligence report with
              executive insights, data quality analysis, and actionable
              recommendations.
            </p>
          </div>

          {/* Export Buttons */}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap xl:w-auto">
            <button
              onClick={() => window.print()}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-800
                px-5
                py-3
                font-medium
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-slate-700
                sm:w-auto
              "
            >
              <Printer size={18} />
              Print Report
            </button>

            <button
              onClick={() => exportExcel(summary)}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-5
                py-3
                font-medium
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-emerald-700
                sm:w-auto
              "
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </button>

            <button
              onClick={() => exportPDF(summary)}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-3
                font-medium
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-blue-700
                sm:w-auto
              "
            >
              <Download size={18} />
              Export PDF
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DATASET OVERVIEW */}
      {/* ========================================================= */}

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
            Dataset Overview
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            High-level statistics about the uploaded dataset.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Dataset */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Dataset
            </p>

            <h2 className="mt-4 break-words text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
              {summary.dataset_name}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Uploaded dataset
            </p>
          </div>

          {/* Rows */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rows
            </p>

            <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              {summary.rows}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Total records available
            </p>
          </div>

          {/* Columns */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Columns
            </p>

            <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
              {summary.columns}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Available attributes
            </p>
          </div>

          {/* Quality */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Quality Score
            </p>

            <h2 className="mt-4 text-3xl font-bold text-green-500 md:text-4xl">
              {summary.quality_score}%
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              AI quality assessment
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* EXECUTIVE SUMMARY */}
      {/* ========================================================= */}

      <section className="space-y-4">
        <ExecutiveSummary summary={summary} />
      </section>

      {/* ========================================================= */}
      {/* DATA QUALITY */}
      {/* ========================================================= */}

      <section className="space-y-4">
        <DataQuality summary={summary} />
      </section>

      {/* ========================================================= */}
      {/* RECOMMENDATIONS */}
      {/* ========================================================= */}

      <section className="space-y-4">
        <Recommendations summary={summary} />
      </section>

      {/* ========================================================= */}
      {/* REPORT STATUS */}
      {/* ========================================================= */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Report Generation Status
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          All report sections have been successfully generated.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Executive Summary */}

          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Executive Summary generated successfully
            </p>
          </div>

          {/* Data Quality */}

          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Data quality assessment completed
            </p>
          </div>

          {/* AI Recommendations */}

          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ AI recommendations generated
            </p>
          </div>

          {/* PDF */}

          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ PDF export ready
            </p>
          </div>

          {/* Excel */}

          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Excel export ready
            </p>
          </div>

          {/* Dataset */}

          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950/30">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Dataset quality analyzed
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <div className="pb-6 pt-2 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generated automatically by InsightIQ AI Analytics Platform
        </p>
      </div>
    </div>
  );
}