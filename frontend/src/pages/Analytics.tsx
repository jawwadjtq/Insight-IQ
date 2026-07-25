import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

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

      <div className="flex items-center justify-center min-h-[70vh]">

        <div className="text-center">

          <div className="h-12 w-12 mx-auto rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-blue-600 animate-spin mb-6"/>

          <h2 className="text-2xl font-bold">
            Loading Analytics...
          </h2>

        </div>

      </div>

    );

  }

  if (!summary) {

    return (

      <div className="max-w-7xl mx-auto p-8">

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">

          <h1 className="text-4xl font-bold mb-4">
            No Dataset Uploaded
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Upload a CSV or Excel dataset to begin exploring
            AI-powered analytics, interactive charts and reports.
          </p>

        </div>

      </div>

    );

  }

  return (

    <div className="max-w-7xl mx-auto p-8 space-y-10">

      {/* HERO */}

      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-10 shadow-xl">

       <div className="flex justify-between items-start mb-8">

  <div />

  <Link
    to="/"
    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition"
  >
    <ArrowLeft size={18} />
    Dashboard
  </Link>

</div>

        <h1 className="text-5xl font-extrabold">
          Business Intelligence Dashboard
        </h1>

        <p className="mt-5 text-lg text-slate-400 max-w-3xl">

          Monitor data quality, visualize trends,
          explore business metrics and generate
          AI-powered insights from your uploaded datasets.

        </p>

        <div className="mt-8 flex flex-wrap gap-3">

          <span className="rounded-full bg-green-500/10 border border-green-500/20 px-4 py-2 text-green-400 text-sm font-semibold">
            Dataset Ready
          </span>

          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-blue-400 text-sm font-semibold">
            AI Enabled
          </span>

          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-2 text-purple-400 text-sm font-semibold">
            Real-time Analytics
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mt-10">

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6">

            <p className="text-xs uppercase text-slate-500">
              Dataset
            </p>

            <h2 className="mt-3 text-2xl font-bold break-all">
              {summary.dataset_name}
            </h2>

          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6">

            <p className="text-xs uppercase text-slate-500">
              File Type
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {summary.dataset_name.split(".").pop()?.toUpperCase()}
            </h2>

          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6">

            <p className="text-xs uppercase text-slate-500">
              Quality
            </p>

            <h2 className="mt-3 text-2xl font-bold text-green-400">
              {summary.quality_score}%
            </h2>

          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6">

            <p className="text-xs uppercase text-slate-500">
              Rows
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {summary.rows}
            </h2>

          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6">

            <p className="text-xs uppercase text-slate-500">
              Columns
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {summary.columns}
            </h2>

          </div>

        </div>

      </section>
            {/* ================= KPI SECTION ================= */}

      <section className="space-y-5">

        <div>

          <h2 className="text-3xl font-bold">
            Key Performance Indicators
          </h2>

          <p className="mt-2 text-slate-400">
            Quick overview of your dataset health and business metrics.
          </p>

        </div>

        <KPIGrid summary={summary} />

      </section>

      {/* ================= CHARTS ================= */}

      <section className="space-y-5">

        <div>

          <h2 className="text-3xl font-bold">
            Interactive Visualizations
          </h2>

          <p className="mt-2 text-slate-400">
            Explore distributions, relationships and trends through interactive charts.
          </p>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

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

          <div className="xl:col-span-2">

            <LineChartCard
              rows={summary.rows}
            />

          </div>

          <div className="xl:col-span-2 overflow-hidden">

            <CorrelationHeatmap
              correlation={summary.correlation}
            />

          </div>

        </div>

      </section>
            {/* ================= DATASET INFORMATION ================= */}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8">

        <h2 className="text-3xl font-bold mb-8">
          Dataset Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          <div className="space-y-5">

            <div className="flex justify-between">
              <span className="font-semibold">Dataset Name</span>
              <span>{summary.dataset_name}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Rows</span>
              <span>{summary.rows}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Columns</span>
              <span>{summary.columns}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Memory Usage</span>
              <span>{summary.memory_usage_mb} MB</span>
            </div>

          </div>

          <div className="space-y-5">

            <div className="flex justify-between">
              <span className="font-semibold">Numeric Columns</span>
              <span>{summary.numeric_columns}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Categorical Columns</span>
              <span>{summary.categorical_columns}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Missing Values</span>
              <span>{summary.missing_values}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Duplicate Rows</span>
              <span>{summary.duplicate_rows}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Quality Score</span>

              <span className="font-bold text-green-500">
                {summary.quality_score}%
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* ================= AI INSIGHTS ================= */}

      <section className="space-y-5">

        <div>

          <h2 className="text-3xl font-bold">
            AI Generated Insights
          </h2>

          <p className="mt-2 text-slate-400">
            Automatically generated observations and recommendations from your uploaded data.
          </p>

        </div>

        <AIInsights />

      </section>
            {/* ================= DATASET PREVIEW ================= */}

      <section className="space-y-5">

        <div>

          <h2 className="text-3xl font-bold">
            Dataset Preview
          </h2>

          <p className="mt-2 text-slate-400">
            Preview the uploaded records before performing advanced analytics.
          </p>

        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">

          <div className="overflow-x-auto">

            <DatasetTable
              preview={summary.preview}
            />

          </div>

        </div>

      </section>

    </div>

  );

}