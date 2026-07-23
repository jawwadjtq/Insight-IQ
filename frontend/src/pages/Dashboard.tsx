import { Link } from "react-router-dom";
import { Database, Brain, FileSpreadsheet, FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-10">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white">

        <h1 className="text-5xl font-bold">
          InsightIQ
        </h1>

        <p className="mt-4 text-xl text-blue-100 max-w-3xl">
          AI-powered Business Intelligence Platform for analyzing
          CSV, Excel and PDF files with interactive dashboards,
          AI insights and downloadable reports.
        </p>

        <div className="flex gap-4 mt-8">

          <Link
            to="/upload"
            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Upload File
          </Link>

          <Link
            to="/analytics"
            className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition"
          >
            Open Dashboard
          </Link>

        </div>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <Database className="text-blue-400 mb-4" size={36} />
          <h2 className="font-bold text-xl">CSV Analysis</h2>
          <p className="text-slate-400 mt-2">
            Analyze structured datasets instantly.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <FileSpreadsheet className="text-green-400 mb-4" size={36} />
          <h2 className="font-bold text-xl">Excel Analysis</h2>
          <p className="text-slate-400 mt-2">
            Upload Excel workbooks and generate insights.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <FileText className="text-orange-400 mb-4" size={36} />
          <h2 className="font-bold text-xl">PDF Reports</h2>
          <p className="text-slate-400 mt-2">
            AI summarizes and analyzes PDF documents.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <Brain className="text-purple-400 mb-4" size={36} />
          <h2 className="font-bold text-xl">AI Insights</h2>
          <p className="text-slate-400 mt-2">
            Automatically generate business recommendations.
          </p>
        </div>

      </div>

    </div>
  );
}