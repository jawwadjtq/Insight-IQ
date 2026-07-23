import { useEffect, useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import { getAIInsights } from "../../services/aiService";

export default function AIInsights() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState("");

  useEffect(() => {
    async function loadInsights() {
      try {
        const data = await getAIInsights();

        if (data.success) {
          setInsights(data.insights);
        } else {
          setInsights("No dataset uploaded.");
        }
      } catch (error) {
        console.error(error);
        setInsights("Unable to generate AI insights.");
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

      <div className="flex items-center gap-3 mb-6">

        <Brain className="text-purple-400" size={28} />

        <h2 className="text-2xl font-bold">
          AI Insights
        </h2>

      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <Sparkles className="animate-pulse" />
          <span>Generating AI insights...</span>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">

          <pre className="whitespace-pre-wrap text-slate-300 leading-8 font-sans">
            {insights}
          </pre>

        </div>
      )}

    </div>
  );
}