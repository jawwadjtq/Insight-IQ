import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

import { uploadFile } from "../services/uploadService";

interface UploadResult {
  rows?: number;
  columns?: number;
  missing_values?: number;
  quality_score?: number;
}

interface UploadResponse {
  type: "pdf" | "dataset";
  report?: unknown;
  filename?: string;
  summary?: UploadResult;
}

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function processFile(file: File) {
    setError(null);
    setResult(null);
    setSelectedFile(file);
    setLoading(true);

    try {
      const data = (await uploadFile(file)) as UploadResponse;

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
        setResult(data.summary ?? null);

        setTimeout(() => {
          navigate("/analytics");
        }, 1500);

        return;
      }

      setError("The server returned an unsupported response.");
    } catch (uploadError) {
      console.error(uploadError);
      setError(
        "Upload failed. Please check your file and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    await processFile(file);

    // Allow selecting the same file again.
    event.target.value = "";
  }

  async function handleDrop(
    event: DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();
    setIsDragging(false);

    if (loading) return;

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    await processFile(file);
  }

  function handleBrowse() {
    if (loading) return;

    fileInputRef.current?.click();
  }

  function clearSelection() {
    if (loading) return;

    setSelectedFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-10">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

      <section className="space-y-3">
        <div
          className="
            inline-flex
            items-center
            gap-2

            rounded-full

            border
            border-blue-200
            dark:border-blue-500/20

            bg-blue-50
            dark:bg-blue-500/10

            px-3
            py-1.5

            text-xs
            font-semibold

            text-blue-700
            dark:text-blue-400
          "
        >
          <Sparkles size={14} />
          AI-Powered Data Ingestion
        </div>

        <div
          className="
            flex
            flex-col
            gap-3

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <h1
              className="
                text-3xl
                font-bold
                tracking-tight

                text-slate-950
                dark:text-white

                sm:text-4xl
              "
            >
              Upload Dataset
            </h1>

            <p
              className="
                mt-3
                max-w-2xl

                text-sm
                leading-7

                text-slate-500
                dark:text-slate-400

                sm:text-base
              "
            >
              Upload CSV, Excel, or PDF files and let
              InsightIQ transform your raw information into
              analytics, AI insights, and professional reports.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* WORKFLOW */}
      {/* ========================================================= */}

      <section
        className="
          rounded-3xl

          border
          border-slate-200
          dark:border-slate-800

          bg-white
          dark:bg-slate-900

          p-5
          shadow-sm

          sm:p-7
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]

                text-slate-400
              "
            >
              Workflow
            </p>

            <h2
              className="
                mt-2

                text-xl
                font-bold

                text-slate-900
                dark:text-white
              "
            >
              From raw data to business intelligence
            </h2>
          </div>

          <span
            className="
              text-xs
              text-slate-400
            "
          >
            Automated pipeline
          </span>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-4">
          <WorkflowStep
            number="01"
            icon={<UploadCloud size={19} />}
            title="Upload"
            description="Choose your CSV, Excel, or PDF file."
            active
          />

          <WorkflowStep
            number="02"
            icon={<Activity size={19} />}
            title="Analyze"
            description="InsightIQ profiles and processes your data."
          />

          <WorkflowStep
            number="03"
            icon={<BrainCircuit size={19} />}
            title="Understand"
            description="AI identifies insights and recommendations."
          />

          <WorkflowStep
            number="04"
            icon={<BarChart3 size={19} />}
            title="Visualize"
            description="Explore dashboards and generate reports."
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* MAIN UPLOAD AREA */}
      {/* ========================================================= */}

      <section
        className="
          grid
          gap-6

          xl:grid-cols-[minmax(0,1fr)_340px]
        "
      >
        {/* Upload Card */}

        <div
          className="
            rounded-3xl

            border
            border-slate-200
            dark:border-slate-800

            bg-white
            dark:bg-slate-900

            p-5
            shadow-sm

            sm:p-8
          "
        >
          <div className="mb-6">
            <h2
              className="
                text-xl
                font-bold

                text-slate-900
                dark:text-white
              "
            >
              Import your data
            </h2>

            <p
              className="
                mt-1

                text-sm

                text-slate-500
                dark:text-slate-400
              "
            >
              Drag and drop a file or browse your computer.
            </p>
          </div>

          <label
            htmlFor="upload"
            onDragOver={(event) => {
              event.preventDefault();

              if (!loading) {
                setIsDragging(true);
              }
            }}
            onDragLeave={() => {
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={`
              group

              flex
              min-h-[340px]

              cursor-pointer
              flex-col
              items-center
              justify-center

              rounded-3xl

              border-2
              border-dashed

              p-8
              text-center

              transition-all
              duration-200

              ${
                isDragging
                  ? `
                    border-blue-500
                    bg-blue-50
                    dark:bg-blue-500/10
                  `
                  : `
                    border-slate-300
                    bg-slate-50/70

                    hover:border-blue-400
                    hover:bg-blue-50/50

                    dark:border-slate-700
                    dark:bg-slate-950/40

                    dark:hover:border-blue-500
                    dark:hover:bg-blue-500/5
                  `
              }

              ${loading ? "cursor-not-allowed opacity-80" : ""}
            `}
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center

                rounded-2xl

                bg-blue-600

                text-white

                shadow-lg
                shadow-blue-600/20

                transition

                group-hover:scale-105
              "
            >
              {loading ? (
                <Loader2
                  size={30}
                  className="animate-spin"
                />
              ) : (
                <UploadCloud size={30} />
              )}
            </div>

            <h3
              className="
                mt-6

                text-xl
                font-bold

                text-slate-900
                dark:text-white

                sm:text-2xl
              "
            >
              {loading
                ? "Processing your file..."
                : "Drop your file here"}
            </h3>

            <p
              className="
                mt-2

                text-sm

                text-slate-500
                dark:text-slate-400
              "
            >
              {loading
                ? "InsightIQ is analyzing your data."
                : "or click anywhere in this area to browse"}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <FileTypeBadge label="CSV" />
              <FileTypeBadge label="XLS" />
              <FileTypeBadge label="XLSX" />
              <FileTypeBadge label="PDF" />
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                handleBrowse();
              }}
              disabled={loading}
              className="
                mt-7

                inline-flex
                items-center
                gap-2

                rounded-xl

                bg-slate-900
                dark:bg-white

                px-5
                py-3

                text-sm
                font-semibold

                text-white
                dark:text-slate-900

                transition

                hover:-translate-y-0.5

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <UploadCloud size={17} />
              Choose File
            </button>

            <p
              className="
                mt-4

                text-xs

                text-slate-400
              "
            >
              Maximum file size depends on your backend configuration.
            </p>

            <input
              ref={fileInputRef}
              id="upload"
              type="file"
              accept=".csv,.xls,.xlsx,.pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={loading}
            />
          </label>

          {/* Selected File */}

          {selectedFile && !loading && !result && (
            <div
              className="
                mt-5

                flex
                items-center
                gap-4

                rounded-2xl

                border
                border-slate-200
                dark:border-slate-800

                bg-slate-50
                dark:bg-slate-950

                p-4
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  bg-blue-50
                  dark:bg-blue-500/10

                  text-blue-600
                  dark:text-blue-400
                "
              >
                <FileText size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate

                    text-sm
                    font-semibold

                    text-slate-900
                    dark:text-white
                  "
                >
                  {selectedFile.name}
                </p>

                <p
                  className="
                    mt-1

                    text-xs

                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={clearSelection}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center

                  rounded-lg

                  text-slate-400

                  transition

                  hover:bg-slate-200
                  hover:text-slate-700

                  dark:hover:bg-slate-800
                  dark:hover:text-white
                "
                aria-label="Remove selected file"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Error */}

          {error && (
            <div
              className="
                mt-5

                flex
                items-start
                gap-3

                rounded-2xl

                border
                border-red-200
                dark:border-red-500/20

                bg-red-50
                dark:bg-red-500/10

                p-4
              "
              role="alert"
            >
              <AlertCircle
                size={20}
                className="
                  mt-0.5
                  shrink-0

                  text-red-600
                  dark:text-red-400
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold

                    text-red-800
                    dark:text-red-300
                  "
                >
                  Upload failed
                </p>

                <p
                  className="
                    mt-1

                    text-sm

                    text-red-700
                    dark:text-red-400
                  "
                >
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trust / Supported Formats */}

        <div className="space-y-6">
          <div
            className="
              rounded-3xl

              border
              border-slate-200
              dark:border-slate-800

              bg-white
              dark:bg-slate-900

              p-6
              shadow-sm
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-xl

                  bg-emerald-50
                  dark:bg-emerald-500/10

                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3
                  className="
                    text-sm
                    font-bold

                    text-slate-900
                    dark:text-white
                  "
                >
                  Built for data analysis
                </h3>

                <p
                  className="
                    mt-0.5

                    text-xs

                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Automated processing pipeline
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <TrustItem text="Automatic dataset profiling" />
              <TrustItem text="Missing-value detection" />
              <TrustItem text="Statistical analysis" />
              <TrustItem text="AI-powered insights" />
              <TrustItem text="Interactive visualization" />
            </div>
          </div>

          <div
            className="
              rounded-3xl

              border
              border-slate-200
              dark:border-slate-800

              bg-white
              dark:bg-slate-900

              p-6
              shadow-sm
            "
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet
                size={21}
                className="
                  text-blue-600
                  dark:text-blue-400
                "
              />

              <h3
                className="
                  text-sm
                  font-bold

                  text-slate-900
                  dark:text-white
                "
              >
                Supported formats
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              <FormatRow
                extension="CSV"
                title="Comma-separated data"
              />

              <FormatRow
                extension="XLS"
                title="Legacy Excel workbook"
              />

              <FormatRow
                extension="XLSX"
                title="Modern Excel workbook"
              />

              <FormatRow
                extension="PDF"
                title="AI document analysis"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* LOADING / ANALYSIS */}
      {/* ========================================================= */}

      {loading && (
        <section
          className="
            overflow-hidden

            rounded-3xl

            border
            border-blue-500/20

            bg-slate-950

            p-6
            shadow-xl

            sm:p-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5

              sm:flex-row
              sm:items-center
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center

                rounded-2xl

                bg-blue-500/10

                text-blue-400
              "
            >
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="
                    text-xl
                    font-bold

                    text-white
                  "
                >
                  Analyzing your file
                </h2>

                <span
                  className="
                    rounded-full

                    bg-blue-500/10

                    px-2.5
                    py-1

                    text-[11px]
                    font-semibold

                    text-blue-300
                  "
                >
                  PROCESSING
                </span>
              </div>

              <p
                className="
                  mt-1

                  text-sm

                  text-slate-400
                "
              >
                InsightIQ is processing your data. Please
                keep this page open.
              </p>
            </div>
          </div>

          <div
            className="
              mt-7
              grid

              gap-3

              sm:grid-cols-2
              lg:grid-cols-3
          "
          >
            <ProcessingStep
              icon={<FileText size={17} />}
              text="Reading dataset"
            />

            <ProcessingStep
              icon={<Activity size={17} />}
              text="Profiling data"
            />

            <ProcessingStep
              icon={<ShieldCheck size={17} />}
              text="Checking data quality"
            />

            <ProcessingStep
              icon={<BarChart3 size={17} />}
              text="Preparing analytics"
            />

            <ProcessingStep
              icon={<BrainCircuit size={17} />}
              text="Generating AI insights"
            />

            <ProcessingStep
              icon={<FileText size={17} />}
              text="Preparing reports"
            />
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SUCCESS */}
      {/* ========================================================= */}

      {result && (
        <section
          className="
            rounded-3xl

            border
            border-emerald-500/20

            bg-emerald-50
            dark:bg-emerald-500/5

            p-6
            shadow-sm

            sm:p-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4

              sm:flex-row
              sm:items-center
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center

                rounded-2xl

                bg-emerald-100
                dark:bg-emerald-500/10

                text-emerald-600
                dark:text-emerald-400
              "
            >
              <CheckCircle2 size={26} />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold

                  text-slate-900
                  dark:text-white
                "
              >
                Dataset processed successfully
              </h2>

              <p
                className="
                  mt-1

                  text-sm

                  text-slate-600
                  dark:text-slate-400
                "
              >
                Your dataset is ready. Redirecting to
                Analytics Dashboard...
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResultMetric
              label="Rows"
              value={result.rows}
            />

            <ResultMetric
              label="Columns"
              value={result.columns}
            />

            <ResultMetric
              label="Missing Values"
              value={result.missing_values}
            />

            <ResultMetric
              label="Quality Score"
              value={
                result.quality_score !== undefined
                  ? `${result.quality_score}%`
                  : undefined
              }
              positive
            />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="
                inline-flex
                items-center
                gap-2

                rounded-xl

                bg-slate-900
                dark:bg-white

                px-5
                py-3

                text-sm
                font-semibold

                text-white
                dark:text-slate-900

                transition

                hover:-translate-y-0.5
              "
            >
              Open Analytics
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* DATASET RECOMMENDATIONS */}
      {/* ========================================================= */}

      <section
        className="
          rounded-3xl

          border
          border-slate-200
          dark:border-slate-800

          bg-white
          dark:bg-slate-900

          p-6
          shadow-sm

          sm:p-8
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.18em]

              text-slate-400
            "
          >
            Best Practices
          </p>

          <h2
            className="
              mt-2

              text-xl
              font-bold

              text-slate-900
              dark:text-white
            "
          >
            Prepare your dataset for better results
          </h2>

          <p
            className="
              mt-2

              max-w-2xl

              text-sm
              leading-6

              text-slate-500
              dark:text-slate-400
            "
          >
            InsightIQ can analyze imperfect datasets, but
            consistent data produces more reliable insights.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <BestPractice
            number="01"
            text="Include clear column headers"
          />

          <BestPractice
            number="02"
            text="Avoid merged cells"
          />

          <BestPractice
            number="03"
            text="Keep data types consistent"
          />

          <BestPractice
            number="04"
            text="Avoid unnecessary empty columns"
          />

          <BestPractice
            number="05"
            text="Use meaningful field names"
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL CTA */}
      {/* ========================================================= */}

      <section
        className="
          rounded-3xl

          bg-gradient-to-r
          from-blue-600
          to-indigo-700

          p-8
          text-center

          shadow-xl

          sm:p-10
        "
      >
        <Sparkles
          size={27}
          className="mx-auto text-blue-100"
        />

        <h2
          className="
            mt-4

            text-2xl
            font-bold

            text-white
          "
        >
          Your data. Your intelligence.
        </h2>

        <p
          className="
            mx-auto
            mt-3

            max-w-xl

            text-sm
            leading-6

            text-blue-100
          "
        >
          Upload a dataset and let InsightIQ handle the
          analysis, visualization, AI insights, and reporting.
        </p>
      </section>
    </div>
  );
}

/* ============================================================= */
/* WORKFLOW STEP */
/* ============================================================= */

interface WorkflowStepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}

function WorkflowStep({
  number,
  icon,
  title,
  description,
  active = false,
}: WorkflowStepProps) {
  return (
    <div
      className={`
        rounded-2xl

        border

        p-5

        ${
          active
            ? `
              border-blue-200
              bg-blue-50/70

              dark:border-blue-500/20
              dark:bg-blue-500/5
            `
            : `
              border-slate-200
              bg-slate-50

              dark:border-slate-800
              dark:bg-slate-950/50
            `
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center

            rounded-xl

            ${
              active
                ? `
                  bg-blue-600
                  text-white
                `
                : `
                  bg-slate-200
                  text-slate-600

                  dark:bg-slate-800
                  dark:text-slate-300
                `
            }
          `}
        >
          {icon}
        </div>

        <span
          className="
            text-xs
            font-bold
            tracking-[0.15em]

            text-slate-300
            dark:text-slate-700
          "
        >
          {number}
        </span>
      </div>

      <h3
        className="
          mt-4

          text-sm
          font-bold

          text-slate-900
          dark:text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2

          text-xs
          leading-5

          text-slate-500
          dark:text-slate-400
        "
      >
        {description}
      </p>
    </div>
  );
}

/* ============================================================= */
/* FILE TYPE BADGE */
/* ============================================================= */

function FileTypeBadge({
  label,
}: {
  label: string;
}) {
  return (
    <span
      className="
        rounded-lg

        border
        border-slate-200
        dark:border-slate-700

        bg-white
        dark:bg-slate-900

        px-2.5
        py-1

        text-[11px]
        font-bold

        text-slate-600
        dark:text-slate-300
      "
    >
      {label}
    </span>
  );
}

/* ============================================================= */
/* TRUST ITEM */
/* ============================================================= */

function TrustItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2
        size={16}
        className="
          shrink-0

          text-emerald-500
        "
      />

      <span
        className="
          text-sm

          text-slate-600
          dark:text-slate-300
        "
      >
        {text}
      </span>
    </div>
  );
}

/* ============================================================= */
/* FORMAT ROW */
/* ============================================================= */

function FormatRow({
  extension,
  title,
}: {
  extension: string;
  title: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
      "
    >
      <div
        className="
          flex
          h-9
          w-12
          items-center
          justify-center

          rounded-lg

          bg-slate-100
          dark:bg-slate-800

          text-[10px]
          font-bold

          text-slate-600
          dark:text-slate-300
        "
      >
        {extension}
      </div>

      <span
        className="
          text-sm

          text-slate-600
          dark:text-slate-400
        "
      >
        {title}
      </span>
    </div>
  );
}

/* ============================================================= */
/* PROCESSING STEP */
/* ============================================================= */

function ProcessingStep({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3

        rounded-xl

        border
        border-slate-800

        bg-slate-900

        p-3.5
      "
    >
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center

          rounded-lg

          bg-blue-500/10

          text-blue-400
        "
      >
        {icon}
      </div>

      <span
        className="
          text-sm

          text-slate-300
        "
      >
        {text}
      </span>

      <Loader2
        size={14}
        className="
          ml-auto
          shrink-0

          animate-spin

          text-blue-400
        "
      />
    </div>
  );
}

/* ============================================================= */
/* RESULT METRIC */
/* ============================================================= */

function ResultMetric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value?: string | number;
  positive?: boolean;
}) {
  return (
    <div
      className="
        rounded-2xl

        border
        border-slate-200
        dark:border-slate-800

        bg-white
        dark:bg-slate-950

        p-5
      "
    >
      <p
        className="
          text-xs
          font-medium

          text-slate-500
          dark:text-slate-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-2

          text-2xl
          font-bold

          ${
            positive
              ? `
                text-emerald-600
                dark:text-emerald-400
              `
              : `
                text-slate-900
                dark:text-white
              `
          }
        `}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

/* ============================================================= */
/* BEST PRACTICE */
/* ============================================================= */

function BestPractice({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div
      className="
        rounded-2xl

        border
        border-slate-200
        dark:border-slate-800

        p-4
      "
    >
      <span
        className="
          text-xs
          font-bold
          tracking-[0.15em]

          text-blue-600
          dark:text-blue-400
        "
      >
        {number}
      </span>

      <p
        className="
          mt-3

          text-sm
          leading-5

          text-slate-600
          dark:text-slate-300
        "
      >
        {text}
      </p>
    </div>
  );
}

/* ============================================================= */
/* FILE SIZE */
/* ============================================================= */

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const value =
    bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}