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
      <div className="flex items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-slate-500 dark:text-slate-400">
          Loading Analytics...
        </h2>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Dataset Uploaded
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mt-3">
            Please upload a dataset first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}

      <div className="space-y-6">

  <div>

    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
      Analytics Dashboard
    </h1>

    <p className="text-slate-500 dark:text-slate-400 mt-2">
      AI-powered Business Intelligence Platform
    </p>

  </div>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">

      <p className="text-slate-400 text-sm">
        Dataset
      </p>

      <h3 className="font-semibold truncate">
        {summary.dataset_name}
      </h3>

    </div>

    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">

      <p className="text-slate-400 text-sm">
        File Type
      </p>

      <h3 className="font-semibold">
        {summary.dataset_name.split(".").pop()?.toUpperCase()}
      </h3>

    </div>

    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">

      <p className="text-slate-400 text-sm">
        Quality
      </p>

      <h3 className="font-semibold text-green-500">
        {summary.quality_score}%
      </h3>

    </div>

    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">

      <p className="text-slate-400 text-sm">
        Rows
      </p>

      <h3 className="font-semibold">
        {summary.rows}
      </h3>

    </div>

    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">

      <p className="text-slate-400 text-sm">
        Columns
      </p>

      <h3 className="font-semibold">
        {summary.columns}
      </h3>

    </div>

  </div>

</div>

      {/* KPI Cards */}

      <KPIGrid summary={summary} />

      {/* Charts */}

<div className="grid lg:grid-cols-2 gap-8">

  <PieChartCard
    numeric={summary.numeric_columns}
    categorical={summary.categorical_columns}
  />

  <BarChartCard
    rows={summary.rows}
    columns={summary.columns}
    missing={summary.missing_values}
    duplicates={summary.duplicate_rows}
  />

  <HistogramChart
    numericData={numericData}
  />

  <ScatterPlotChart
    numericData={numericData}
  />

  <div className="lg:col-span-2">

    <LineChartCard
      rows={summary.rows}
    />

  </div>

  <div className="lg:col-span-2">

    <CorrelationHeatmap
      correlation={summary.correlation}
    />

  </div>

</div>

      {/* Dataset Information */}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Dataset Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="space-y-3 text-slate-700 dark:text-slate-300">

            <p>
              <strong>Dataset:</strong>{" "}
              {summary.dataset_name}
            </p>

            <p>
              <strong>Rows:</strong>{" "}
              {summary.rows}
            </p>

            <p>
              <strong>Columns:</strong>{" "}
              {summary.columns}
            </p>

            <p>
              <strong>Memory Usage:</strong>{" "}
              {summary.memory_usage_mb} MB
            </p>

          </div>

          <div className="space-y-3 text-slate-700 dark:text-slate-300">

            <p>
              <strong>Numeric Columns:</strong>{" "}
              {summary.numeric_columns}
            </p>

            <p>
              <strong>Categorical Columns:</strong>{" "}
              {summary.categorical_columns}
            </p>

            <p>
              <strong>Missing Values:</strong>{" "}
              {summary.missing_values}
            </p>

            <p>
              <strong>Duplicate Rows:</strong>{" "}
              {summary.duplicate_rows}
            </p>

            <p>
              <strong>Quality Score:</strong>{" "}
              {summary.quality_score}%
            </p>

          </div>

        </div>

      </div>

      {/* AI Insights */}

      <AIInsights />

      {/* Dataset Preview */}

      <DatasetTable
        preview={summary.preview}
      />

    </div>
  );
}