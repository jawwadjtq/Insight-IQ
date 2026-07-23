import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";

import { uploadFile } from "../services/uploadService";

export default function Upload() {
  const navigate = useNavigate();

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      const data = await uploadFile(file);

      // PDF Upload
      if (data.type === "pdf") {
        navigate("/pdf-report", {
          state: {
            report: data.report,
            filename: data.filename,
          },
        });

        return;
      }

      // CSV / Excel Upload
      if (data.type === "dataset") {
        setResult(data.summary);

        setTimeout(() => {
          navigate("/analytics");
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Upload Dataset
        </h1>

        <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
          Upload CSV, Excel, or PDF files and let InsightIQ generate
          AI-powered analytics, summaries, and reports in seconds.
        </p>
      </div>

      {/* Upload Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-8 lg:p-10">
        <label
          htmlFor="upload"
          className="group flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 p-8 text-center transition-all duration-300 hover:border-blue-500 hover:bg-slate-800/40"
        >
          <div className="rounded-full bg-blue-500/10 p-5 transition group-hover:scale-105">
            <UploadCloud className="h-12 w-12 text-blue-400 sm:h-14 sm:w-14" />
          </div>

          <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
            Click to Upload
          </h2>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            CSV • XLS • XLSX • PDF
          </p>

          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            Maximum upload size depends on your backend configuration.
          </p>

          <div className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            Choose File
          </div>

          <input
            id="upload"
            type="file"
            accept=".csv,.xls,.xlsx,.pdf"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-3xl border border-blue-600 bg-slate-900 p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />

            <div>
              <h2 className="text-2xl font-bold text-white">
                AI is analyzing your file...
              </h2>

              <p className="mt-1 text-slate-400">
                Please wait a few seconds while InsightIQ processes your data.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 rounded-2xl bg-slate-800/40 p-5 text-slate-300">
            <p>✓ Reading file...</p>
            <p>✓ Cleaning data...</p>
            <p>✓ Generating AI insights...</p>
            <p>✓ Building dashboard...</p>
            <p>✓ Preparing charts...</p>
          </div>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="rounded-3xl border border-green-600 bg-green-900/20 p-6 shadow-lg sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-400" />

            <h2 className="text-2xl font-bold text-white">
              Dataset Uploaded Successfully
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Rows</p>

              <h3 className="mt-2 text-3xl font-bold text-white">
                {result.rows}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Columns</p>

              <h3 className="mt-2 text-3xl font-bold text-white">
                {result.columns}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Missing Values</p>

              <h3 className="mt-2 text-3xl font-bold text-white">
                {result.missing_values}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Quality Score</p>

              <h3 className="mt-2 text-3xl font-bold text-green-400">
                {result.quality_score}%
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Supported Files */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-400" />

          <h2 className="text-xl font-bold text-white">
            Supported File Types
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <h3 className="font-semibold text-white">📊 CSV</h3>
            <p className="mt-2 text-sm text-slate-400">
              Analyze comma-separated datasets with AI-powered insights.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <h3 className="font-semibold text-white">📈 Excel</h3>
            <p className="mt-2 text-sm text-slate-400">
              Upload XLS and XLSX spreadsheets for automated analytics.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
            <h3 className="font-semibold text-white">📄 PDF</h3>
            <p className="mt-2 text-sm text-slate-400">
              Generate intelligent AI summaries and reports from PDF files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}