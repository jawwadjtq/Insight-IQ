import { useLocation } from "react-router-dom";
import { FileText } from "lucide-react";

export default function PDFReport() {
  const location = useLocation();

  const report = location.state?.report;
  const filename = location.state?.filename;

  if (!report) {
    return (
      <div className="min-h-full w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              No PDF Report
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              No PDF report available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                AI PDF Report
              </h1>

              <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                {filename}
              </p>
            </div>
          </div>
        </div>

        {/* Report */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-8 sm:py-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
              Generated Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              AI-generated insights extracted from your uploaded PDF document.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700 dark:text-slate-300 sm:text-base">
              {report}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}