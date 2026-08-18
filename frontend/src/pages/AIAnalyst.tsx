import { useState } from "react";
import { api } from "../services/api";
import {
  Brain,
  Send,
  Download,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";

export default function AIAnalyst() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [responseType, setResponseType] = useState<
    "answer" | "report" | ""
  >("");

  // =========================================================
  // ASK AI
  // =========================================================

  async function askAI() {
    if (!prompt.trim()) return;

    setLoading(true);
    setAnswer("");
    setResponseType("");

    try {
      const response = await api.post("/ai/ask", {
        prompt: prompt.trim(),
      });

      console.log("AI RESPONSE:", response.data);

      const returnedAnswer = response.data?.response || "";

      /*
       * The backend should return:
       *
       * {
       *   success: true,
       *   type: "report",
       *   response: "..."
       * }
       *
       * But we also detect report requests on the frontend.
       * This prevents the download button from disappearing
       * if the backend accidentally returns type: "answer".
       */

      const backendType = response.data?.type;

      const lowerPrompt = prompt.toLowerCase();

      const reportRequested =
        lowerPrompt.includes("report") ||
        lowerPrompt.includes("pdf") ||
        lowerPrompt.includes("printable") ||
        lowerPrompt.includes("downloadable");

      if (backendType === "report" || reportRequested) {
        setResponseType("report");
      } else {
        setResponseType("answer");
      }

      setAnswer(returnedAnswer);
    } catch (error) {
      console.error("AI request failed:", error);

      alert(
        "AI request failed. Please make sure a dataset is uploaded and the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // DOWNLOAD PDF REPORT
  // =========================================================

  async function downloadPDFReport() {
    if (!prompt.trim()) {
      alert("Please enter a report request first.");
      return;
    }

    setDownloading(true);

    try {
      console.log("Generating PDF report...");

      const response = await api.post(
        "/ai/report/pdf",
        {
          prompt: prompt.trim(),
        },
        {
          responseType: "blob",
        }
      );

      console.log("PDF response received.");

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "InsightIQ_AI_Report.pdf";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      console.log("PDF downloaded successfully.");
    } catch (error) {
      console.error("PDF download failed:", error);

      alert(
        "Unable to generate the PDF report. Please make sure the backend is running and a dataset is uploaded."
      );
    } finally {
      setDownloading(false);
    }
  }

  // =========================================================
  // NEW CONVERSATION
  // =========================================================

  function newConversation() {
    setPrompt("");
    setAnswer("");
    setResponseType("");
  }

  // =========================================================
  // SUGGESTED QUESTIONS
  // =========================================================

  const suggestedQuestions = [
    "Summarize this dataset",
    "Find anomalies",
    "Which columns need cleaning?",
    "Recommend visualizations",
    "Explain missing values",
    "Generate business insights",
    "Create an executive report",
    "Create a detailed business report with KPIs and recommendations",
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 lg:space-y-10">

      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-12">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_45%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">

              <Brain size={18} />

              AI Powered Analytics

            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              AI Analyst
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg">
              Ask intelligent questions about your uploaded dataset and
              receive AI-generated insights, recommendations, reports,
              and business analysis in seconds.
            </p>

          </div>

          <div className="hidden lg:flex h-32 w-32 items-center justify-center rounded-3xl border border-slate-700 bg-slate-900/70 backdrop-blur">

            <Brain className="h-14 w-14 text-blue-400" />

          </div>

        </div>
      </div>


      {/* =====================================================
          CHAT CARD
      ===================================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">

        <div className="border-b border-slate-800 px-5 py-4 sm:px-8 sm:py-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/15">

              <Brain
                className="text-blue-400"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Generate Insights with AI
              </h2>

              <p className="text-sm text-slate-400">
                Ask questions, request analysis, or create custom reports
                from your uploaded dataset.
              </p>

            </div>

          </div>

        </div>


        <div className="p-5 sm:p-8">

          {/* =================================================
              TEXTAREA
          ================================================= */}

          <textarea
            rows={7}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.ctrlKey || e.metaKey)
              ) {
                askAI();
              }
            }}
            placeholder="Ask something like: Create an executive report showing the key business insights, KPIs, trends, risks and recommendations."
            className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:p-5 text-sm sm:text-base text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />


          {/* =================================================
              SUGGESTED QUESTIONS
          ================================================= */}

          <div className="mt-5">

            <p className="text-sm text-slate-400 mb-3">
              Suggested questions
            </p>

            <div className="flex flex-wrap gap-3">

              {suggestedQuestions.map((item) => (

                <button
                  key={item}
                  onClick={() => setPrompt(item)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-500 hover:bg-slate-700"
                >
                  {item}
                </button>

              ))}

            </div>

          </div>


          {/* =================================================
              ASK BUTTON
          ================================================= */}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">
              Ask about trends, cleaning, anomalies, insights,
              recommendations, KPIs, or reports.
            </p>

            <button
              onClick={askAI}
              disabled={loading || !prompt.trim()}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}

              {loading ? "Thinking..." : "Ask AI"}

            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (

        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-slate-900 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20">

              <Brain className="animate-pulse text-blue-400" />

            </div>

            <div className="flex-1">

              <h3 className="text-lg font-semibold text-white">
                Analyzing your data...
              </h3>

              <div className="mt-3 space-y-2 text-sm text-slate-300">

                <p>✓ Understanding your request...</p>

                <p>✓ Searching uploaded dataset...</p>

                <p>✓ Running AI analysis...</p>

                <p>✓ Generating insights...</p>

                <p>✓ Preparing response...</p>

              </div>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">

                <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          RESPONSE
      ===================================================== */}

      {answer && !loading && (

        <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">

          {/* =================================================
              RESPONSE HEADER
          ================================================= */}

          <div className="border-b border-slate-800 p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10">

                    {responseType === "report" ? (
                      <FileText
                        className="text-blue-400"
                        size={22}
                      />
                    ) : (
                      <Brain
                        className="text-blue-400"
                        size={22}
                      />
                    )}

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-white">
                      {responseType === "report"
                        ? "AI Generated Report"
                        : "AI Analysis"}
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      Generated by InsightIQ AI
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  REPORT ACTIONS
              ================================================= */}

              <div className="flex flex-col sm:flex-row gap-3">

                {responseType === "report" && (

                  <button
                    onClick={downloadPDFReport}
                    disabled={downloading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {downloading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download size={18} />

                        Download PDF Report
                      </>
                    )}

                  </button>

                )}

                <button
                  onClick={newConversation}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
                >

                  <Plus size={18} />

                  New Conversation

                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              CONVERSATION
          ================================================= */}

          <div className="space-y-8 p-5 sm:p-6">

            {/* USER */}

            <div className="flex justify-end">

              <div className="max-w-3xl rounded-3xl bg-blue-600 px-6 py-4 text-white shadow-lg">

                <p className="font-semibold mb-2">
                  You
                </p>

                <p className="leading-7 whitespace-pre-wrap">
                  {prompt}
                </p>

              </div>

            </div>


            {/* AI */}

            <div className="flex justify-start">

              <div className="max-w-5xl rounded-3xl border border-slate-700 bg-slate-950 px-6 py-5">

                <div className="flex items-center gap-3 mb-5">

                  <Brain
                    className="text-blue-400"
                    size={22}
                  />

                  <h3 className="font-bold text-lg text-white">
                    InsightIQ AI
                  </h3>

                </div>

                <div className="whitespace-pre-wrap leading-8 text-slate-200">
                  {answer}
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              DOWNLOAD REPORT FOOTER
          ================================================= */}

          {responseType === "report" && (

            <div className="border-t border-slate-800 bg-slate-950/60 p-5 sm:p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5">

                    <FileText
                      size={20}
                      className="text-blue-400"
                    />

                  </div>

                  <div>

                    <p className="font-semibold text-white">
                      Your report is ready
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Download a professionally formatted,
                      printable PDF version of this AI report.
                    </p>

                  </div>

                </div>

                <button
                  onClick={downloadPDFReport}
                  disabled={downloading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {downloading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Preparing PDF...
                    </>
                  ) : (
                    <>
                      <Download size={18} />

                      Download PDF
                    </>
                  )}

                </button>

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  );
}