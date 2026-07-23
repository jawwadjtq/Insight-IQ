import { useState } from "react";
import axios from "axios";
import { Brain, Send } from "lucide-react";

export default function AIAnalyst() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/ai/ask",
        {
          prompt,
        }
      );

      setAnswer(response.data.response);
    } catch (error) {
      console.error(error);
      alert("AI request failed.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 lg:space-y-10">
      {/* Hero */}
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
              Ask intelligent questions about your uploaded dataset and receive
              AI-generated insights, recommendations, and explanations in
              seconds.
            </p>
          </div>

          <div className="hidden lg:flex h-32 w-32 items-center justify-center rounded-3xl border border-slate-700 bg-slate-900/70 backdrop-blur">
            <Brain className="h-14 w-14 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Chat Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/15">
              <Brain className="text-blue-400" size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Ask Your AI Analyst
              </h2>

              <p className="text-sm text-slate-400">
                Type any question related to your uploaded dataset.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <textarea
            rows={7}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something like: Which columns should I clean first?"
            className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:p-5 text-sm sm:text-base text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Ask anything about trends, cleaning, insights, anomalies, or
              recommendations.
            </p>

            <button
              onClick={askAI}
              disabled={loading}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-slate-900 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20">
              <Brain className="animate-pulse text-blue-400" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                AI is Thinking...
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Analyzing your request and generating insights based on your
                dataset. This may take a few moments.
              </p>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response */}
      {answer && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-900/70 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/15">
                <Brain className="text-blue-400" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  AI Response
                </h2>

                <p className="text-sm text-slate-400">
                  Generated insights from your dataset.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
              <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-200 sm:text-base">
                {answer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}