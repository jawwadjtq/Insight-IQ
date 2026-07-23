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
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-slate-500 dark:text-slate-400">
          Loading Report...
        </h2>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">
          Reports
        </h1>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">

          <h2 className="text-2xl font-bold">
            No Dataset Uploaded
          </h2>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Please upload a dataset first.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

        <div>

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            AI Executive Report
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Automatically generated business intelligence report.
          </p>

        </div>

        <div className="flex flex-wrap gap-4">

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl transition"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            onClick={() => exportExcel(summary)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            onClick={() => exportPDF(summary)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
          >
            <Download size={18} />
            PDF
          </button>

        </div>

      </div>

      {/* Dataset Overview */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">

          <p className="text-slate-500 dark:text-slate-400">
            Dataset
          </p>

          <h2 className="text-xl font-bold mt-3">
            {summary.dataset_name}
          </h2>

        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">

          <p className="text-slate-500 dark:text-slate-400">
            Rows
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {summary.rows}
          </h2>

        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">

          <p className="text-slate-500 dark:text-slate-400">
            Columns
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {summary.columns}
          </h2>

        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">

          <p className="text-slate-500 dark:text-slate-400">
            Quality Score
          </p>

          <h2 className="text-3xl font-bold mt-3 text-green-500">
            {summary.quality_score}%
          </h2>

        </div>

      </div>

      {/* Executive Summary */}

      <ExecutiveSummary summary={summary} />

      {/* Data Quality */}

      <DataQuality summary={summary} />

      {/* Recommendations */}

      <Recommendations summary={summary} />

      {/* Footer */}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold mb-5">
          Report Status
        </h2>

        <div className="space-y-3">

          <p>
            ✅ Executive Summary Generated
          </p>

          <p>
            ✅ Dataset Quality Analysed
          </p>

          <p>
            ✅ Business Recommendations Generated
          </p>

          <p>
            ✅ Ready for PDF Export
          </p>

          <p>
            ✅ Ready for Excel Export
          </p>

        </div>

      </div>

    </div>
  );
}