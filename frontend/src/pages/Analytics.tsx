import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileBarChart,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Table2,
  UploadCloud,
} from "lucide-react";

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
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  const fileType = useMemo(() => {
    if (!summary?.dataset_name) return "DATASET";

    const extension = summary.dataset_name
      .split(".")
      .pop()
      ?.toUpperCase();

    return extension || "DATASET";
  }, [summary?.dataset_name]);

  const qualityScore = Number(summary?.quality_score ?? 0);

  const qualityLabel = useMemo(() => {
    if (qualityScore >= 90) return "Excellent";
    if (qualityScore >= 75) return "Good";
    if (qualityScore >= 50) return "Needs Attention";
    return "Poor";
  }, [qualityScore]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <RefreshCw
              size={30}
              className="animate-spin text-blue-500"
            />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Loading Analytics
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            InsightIQ is preparing your business intelligence workspace.
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-4">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-16">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10">
            <Database size={38} className="text-blue-500" />
          </div>

          <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            No Dataset Available
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
            Upload a CSV or Excel dataset to unlock interactive analytics,
            AI-powered insights, data quality analysis and business reports.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <UploadCloud size={19} />
              Upload Dataset
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">

      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-2xl">

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">

          {/* Top row */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">
                <BarChart3
                  size={24}
                  className="text-blue-400"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  InsightIQ Analytics
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Business Intelligence Workspace
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
              >
                <UploadCloud size={17} />
                New Dataset
              </Link>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <ArrowLeft size={17} />
                Dashboard
              </Link>

            </div>

          </div>

          {/* Main title */}

          <div className="mt-10 max-w-4xl">

            <div className="flex flex-wrap items-center gap-2">

              <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                <CheckCircle2 size={14} />
                Dataset Ready
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
                <BrainCircuit size={14} />
                AI Enabled
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400">
                <Sparkles size={14} />
                Intelligent Analytics
              </span>

            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Business Intelligence Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Explore your dataset through interactive visualizations,
              data-quality metrics, AI-generated insights and automated
              business intelligence.
            </p>

          </div>

          {/* Dataset identity */}

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="min-w-0">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Active Dataset
                </p>

                <h2 className="mt-2 break-all text-xl font-bold text-white sm:text-2xl">
                  {summary.dataset_name}
                </h2>

              </div>

              <div className="flex flex-wrap gap-3">

                <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">
                    File
                  </p>
                  <p className="mt-1 font-semibold text-slate-200">
                    {fileType}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">
                    Rows
                  </p>
                  <p className="mt-1 font-semibold text-slate-200">
                    {summary.rows}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">
                    Columns
                  </p>
                  <p className="mt-1 font-semibold text-slate-200">
                    {summary.columns}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* KPI SECTION */}
      {/* ========================================================= */}

      <section className="space-y-5">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <FileBarChart
                size={21}
                className="text-blue-500"
              />

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Key Performance Indicators
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              A high-level view of your dataset and its overall health.
            </p>
          </div>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            Dataset overview
          </span>

        </div>

        <KPIGrid summary={summary} />

      </section>

      {/* ========================================================= */}
      {/* DATA QUALITY */}
      {/* ========================================================= */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10">
              <ShieldCheck
                size={25}
                className="text-green-500"
              />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Data Quality
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Overall health score calculated from your dataset.
              </p>

            </div>

          </div>

          <div className="min-w-[240px]">

            <div className="flex items-end justify-between">

              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {qualityScore}%
                </p>

                <p className="mt-1 text-sm font-medium text-green-500">
                  {qualityLabel}
                </p>
              </div>

              <span className="text-xs text-slate-500">
                Quality score
              </span>

            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                style={{
                  width: `${Math.min(Math.max(qualityScore, 0), 100)}%`,
                }}
              />

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* VISUAL ANALYTICS */}
      {/* ========================================================= */}

      <section className="space-y-6">

        <div className="flex flex-col gap-2">

          <div className="flex items-center gap-2">

            <BarChart3
              size={22}
              className="text-blue-500"
            />

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Interactive Visualizations
            </h2>

          </div>

          <p className="max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Explore distributions, relationships, trends and correlations
            using InsightIQ's interactive analytical visualizations.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

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

      {/* ========================================================= */}
      {/* DATASET INFORMATION */}
      {/* ========================================================= */}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:p-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <Database
                size={22}
                className="text-blue-500"
              />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                Dataset Information
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Technical profile of the active dataset.
              </p>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">

          <div className="space-y-0 border-b border-slate-200 dark:border-slate-800 md:border-r">

            <InfoRow
              label="Dataset Name"
              value={summary.dataset_name}
            />

            <InfoRow
              label="Rows"
              value={summary.rows}
            />

            <InfoRow
              label="Columns"
              value={summary.columns}
            />

            <InfoRow
              label="Memory Usage"
              value={`${summary.memory_usage_mb} MB`}
              last
            />

          </div>

          <div className="space-y-0">

            <InfoRow
              label="Numeric Columns"
              value={summary.numeric_columns}
            />

            <InfoRow
              label="Categorical Columns"
              value={summary.categorical_columns}
            />

            <InfoRow
              label="Missing Values"
              value={summary.missing_values}
            />

            <InfoRow
              label="Duplicate Rows"
              value={summary.duplicate_rows}
            />

            <InfoRow
              label="Quality Score"
              value={`${summary.quality_score}%`}
              valueClassName="text-green-500"
              last
            />

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* AI INSIGHTS */}
      {/* ========================================================= */}

      <section className="space-y-6">

        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent p-6 dark:border-blue-500/20 sm:p-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <BrainCircuit
                  size={25}
                  className="text-white"
                />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    AI Business Insights
                  </h2>

                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-500">
                    AI Powered
                  </span>

                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Automatically generated observations, patterns,
                  recommendations and business opportunities discovered
                  from your dataset.
                </p>

              </div>

            </div>

          </div>

        </div>

        <AIInsights />

      </section>

     {/* ========================================================= */}
{/* DATASET PREVIEW */}
{/* ========================================================= */}

<section className="space-y-5">

  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

    <div>

      <div className="flex items-center gap-2">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <Table2
            size={21}
            className="text-blue-500"
          />
        </div>

        <div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Dataset Preview
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Inspect sample records from your active dataset.
          </p>

        </div>

      </div>

    </div>

    <div className="flex flex-wrap items-center gap-2">

      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <FileSpreadsheet size={14} />
        {fileType}
      </span>

      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <Database size={14} />
        {summary.rows} records
      </span>

    </div>

  </div>

  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

    {/* Table Header */}

    <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <h3 className="font-semibold text-slate-900 dark:text-white">
          Sample Records
        </h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Showing a preview of the uploaded dataset.
        </p>

      </div>

      <div className="flex items-center gap-2">

        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
          <CheckCircle2 size={13} />
          Dataset Ready
        </span>

      </div>

    </div>

    {/* Table */}

    <div className="overflow-x-auto">

      <div className="min-w-[700px] p-4 sm:p-6">

        <DatasetTable
          preview={summary.preview}
        />

      </div>

    </div>

  </div>

</section>

      {/* ========================================================= */}
      {/* BOTTOM CTA */}
      {/* ========================================================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-8 shadow-xl sm:p-10">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-2 text-blue-400">

              <Sparkles size={18} />

              <span className="text-sm font-semibold uppercase tracking-wider">
                Continue Exploring
              </span>

            </div>

            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Turn your analysis into a professional report.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Use your analytics and AI insights to create executive-ready
              reports for business decisions, meetings and presentations.
            </p>

          </div>

          <Link
            to="/reports"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <FileBarChart size={19} />
            Open Reports
          </Link>

        </div>

      </section>

    </div>
  );
}

/* ============================================================= */
/* REUSABLE INFO ROW */
/* ============================================================= */

interface InfoRowProps {
  label: string;
  value: string | number;
  valueClassName?: string;
  last?: boolean;
}

function InfoRow({
  label,
  value,
  valueClassName = "",
  last = false,
}: InfoRowProps) {
  return (
    <div
      className={`flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
        !last
          ? "border-b border-slate-200 dark:border-slate-800"
          : ""
      }`}
    >
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span
        className={`break-all text-sm font-semibold text-slate-900 dark:text-white ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}