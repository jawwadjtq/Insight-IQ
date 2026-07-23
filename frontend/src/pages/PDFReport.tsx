import { useLocation } from "react-router-dom";
import { FileText } from "lucide-react";

export default function PDFReport() {
  const location = useLocation();

  const report = location.state?.report;
  const filename = location.state?.filename;

  if (!report) {
    return (
      <div className="p-10">
        No PDF report available.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

        <div className="flex items-center gap-3 mb-6">

          <FileText className="text-blue-500" />

          <div>

            <h1 className="text-3xl font-bold">
              AI PDF Report
            </h1>

            <p className="text-slate-400">
              {filename}
            </p>

          </div>

        </div>

        <div className="whitespace-pre-wrap leading-8 text-slate-300">

          {report}

        </div>

      </div>

    </div>
  );
}