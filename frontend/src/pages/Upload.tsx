import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle2, FileText } from "lucide-react";

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
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Upload Dataset
        </h1>

        <p className="text-slate-400 mt-2">
          Upload CSV, Excel or PDF files for AI-powered analysis.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10">

        <label
          htmlFor="upload"
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl py-16 hover:border-blue-500 transition"
        >

          <UploadCloud
            size={60}
            className="text-blue-400"
          />

          <h2 className="text-xl font-semibold mt-6">
            Click to Upload
          </h2>

          <p className="text-slate-400 mt-2">
            CSV • Excel • PDF
          </p>

          <input
            id="upload"
            type="file"
            accept=".csv,.xlsx,.pdf"
            className="hidden"
            onChange={handleUpload}
          />

        </label>

      </div>

     {loading && (

  <div className="bg-slate-900 border border-blue-600 rounded-2xl p-8">

    <div className="flex items-center gap-4 mb-6">

      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>

      <div>

        <h2 className="text-2xl font-bold">
          AI is analyzing your file...
        </h2>

        <p className="text-slate-400">
          Please wait a few seconds.
        </p>

      </div>

    </div>

    <div className="space-y-3 text-slate-300">

      <p>✓ Reading file...</p>

      <p>✓ Cleaning data...</p>

      <p>✓ Generating AI insights...</p>

      <p>✓ Building dashboard...</p>

      <p>✓ Preparing charts...</p>

    </div>

  </div>

)}

      {result && (

        <div className="bg-green-900/20 border border-green-600 rounded-2xl p-8 space-y-6">

          <div className="flex items-center gap-3">

            <CheckCircle2 className="text-green-400" />

            <h2 className="text-2xl font-bold">

              Dataset Uploaded Successfully

            </h2>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            <div>
              <p className="text-slate-400">
                Rows
              </p>

              <h3 className="text-3xl font-bold">
                {result.rows}
              </h3>
            </div>

            <div>
              <p className="text-slate-400">
                Columns
              </p>

              <h3 className="text-3xl font-bold">
                {result.columns}
              </h3>
            </div>

            <div>
              <p className="text-slate-400">
                Missing Values
              </p>

              <h3 className="text-3xl font-bold">
                {result.missing_values}
              </h3>
            </div>

            <div>
              <p className="text-slate-400">
                Quality Score
              </p>

              <h3 className="text-3xl font-bold text-green-400">
                {result.quality_score}%
              </h3>
            </div>

          </div>

        </div>

      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

        <div className="flex items-center gap-3 mb-4">

          <FileText className="text-blue-400" />

          <h2 className="text-xl font-bold">
            Supported File Types
          </h2>

        </div>

        <ul className="space-y-2 text-slate-400">

          <li>📊 CSV Dataset Analysis</li>

          <li>📈 Excel Dataset Analysis</li>

          <li>📄 PDF AI Report Analysis</li>

        </ul>

      </div>

    </div>
  );
}