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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-blue-600 animate-spin mb-6" />
          <h2 className="text-xl md:text-2xl font-semibold text-slate-600 dark:text-slate-300">
            Loading Report...
          </h2>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Reports
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              AI-generated business intelligence reports and executive insights.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              No Dataset Uploaded
            </h2>

            <p className="mt-4 text-slate-500 dark:text-slate-400 text-base md:text-lg">
              Please upload a dataset first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10">
      {/* Header */}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              AI Executive Report
            </h1>

            <p className="mt-3 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
              Automatically generated business intelligence report with executive
              insights, data quality analysis, and actionable recommendations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 font-medium transition-all duration-200 shadow-sm"
            >
              <Printer size={18} />
              Print
            </button>

            <button
              onClick={() => exportExcel(summary)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 font-medium transition-all duration-200 shadow-sm"
            >
              <FileSpreadsheet size={18} />
              Excel
            </button>

            <button
              onClick={() => exportPDF(summary)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-medium transition-all duration-200 shadow-sm"
            >
              <Download size={18} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Overview */}

      <section className="space-y-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Dataset Overview
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            High-level statistics about the uploaded dataset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow p-6">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Dataset
            </p>

            <h2 className="mt-4 text-xl md:text-2xl font-bold text-slate-900 dark:text-white break-words">
              {summary.dataset_name}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow p-6">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rows
            </p>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {summary.rows}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow p-6">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Columns
            </p>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {summary.columns}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow p-6">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Quality Score
            </p>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-green-500">
              {summary.quality_score}%
            </h2>
          </div>
        </div>
      </section>

      {/* Executive Summary */}

      <section className="space-y-4">
        <ExecutiveSummary summary={summary} />
      </section>

      {/* Data Quality */}

      <section className="space-y-4">
        <DataQuality summary={summary} />
      </section>

      {/* Recommendations */}

      <section className="space-y-4">
        <Recommendations summary={summary} />
      </section>

      {/* Report Status */}

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Report Status
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          All report sections have been successfully generated.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-5 py-4">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Executive Summary Generated
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-5 py-4">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Dataset Quality Analysed
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-5 py-4">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Business Recommendations Generated
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-5 py-4">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Ready for PDF Export
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-5 py-4">
            <p className="font-medium text-green-700 dark:text-green-400">
              ✅ Ready for Excel Export
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}