import { useEffect, useState } from "react";

import { getDatasetSummary } from "../services/dashboardService";

import KPIGrid from "../components/dashboard/KPIGrid";
import PieChartCard from "../components/charts/PieChartCard";
import BarChartCard from "../components/charts/BarChartCard";
import LineChartCard from "../components/charts/LineChartCard";
import HistogramChart from "../components/charts/HistogramChart";
import ScatterPlotChart from "../components/charts/ScatterPlotChart";
import CorrelationHeatmap from "../components/charts/CorrelationHeatmap";

import AIInsights from "../components/ai/AIInsights";
import DatasetTable from "../components/tables/DatasetTable";

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const summary = analytics?.summary;
  const numericData = summary?.numeric_data;

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getDatasetSummary();

        if (data.uploaded) {
          setAnalytics(data);
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
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm px-8 py-10">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-500 dark:text-slate-400 text-center">
            Loading Analytics...
          </h2>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            No Dataset Uploaded
          </h2>

          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base md:text-lg">
            Please upload a dataset first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10">
      {/* Header */}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Analytics Dashboard
            </h1>

            <p className="mt-3 text-base md:text-lg text-slate-500 dark:text-slate-400">
              AI-powered Business Intelligence Platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Dataset
              </p>

              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white break-all">
                {summary.dataset_name}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                File Type
              </p>

              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {summary.dataset_name.split(".").pop()?.toUpperCase()}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Quality
              </p>

              <h3 className="mt-2 text-lg font-semibold text-green-500">
                {summary.quality_score}%
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Rows
              </p>

              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {summary.rows}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Columns
              </p>

              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {summary.columns}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}

      <section>
        <KPIGrid summary={summary} />
      </section>

      {/* Charts */}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="min-w-0">
          <PieChartCard
            numeric={summary.numeric_columns}
            categorical={summary.categorical_columns}
          />
        </div>

        <div className="min-w-0">
          <BarChartCard
            rows={summary.rows}
            columns={summary.columns}
            missing={summary.missing_values}
            duplicates={summary.duplicate_rows}
          />
        </div>

        <div className="min-w-0">
          <HistogramChart numericData={numericData} />
        </div>

        <div className="min-w-0">
          <ScatterPlotChart numericData={numericData} />
        </div>

        <div className="xl:col-span-2 min-w-0">
          <LineChartCard rows={summary.rows} />
        </div>

        <div className="xl:col-span-2 min-w-0 overflow-hidden">
          <CorrelationHeatmap correlation={summary.correlation} />
        </div>
      </section>

      {/* Dataset Information */}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Dataset Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 text-slate-700 dark:text-slate-300 break-words">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="font-semibold">Dataset</span>
              <span>{summary.dataset_name}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Rows</span>
              <span>{summary.rows}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Columns</span>
              <span>{summary.columns}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Memory Usage</span>
              <span>{summary.memory_usage_mb} MB</span>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="font-semibold">Numeric Columns</span>
              <span>{summary.numeric_columns}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Categorical Columns</span>
              <span>{summary.categorical_columns}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Missing Values</span>
              <span>{summary.missing_values}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Duplicate Rows</span>
              <span>{summary.duplicate_rows}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Quality Score</span>
              <span className="font-semibold text-green-500">
                {summary.quality_score}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights */}

      <section>
        <AIInsights />
      </section>

      {/* Dataset Preview */}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 md:p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <DatasetTable preview={summary.preview} />
        </div>
      </section>
    </div>
  );
}