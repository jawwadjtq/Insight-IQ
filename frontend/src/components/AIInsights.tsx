import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { getAIInsights } from "../services/aiService";

export default function AIInsights() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAIInsights();

        if (data.success) {
          setInsights(data.insights);
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

      <div className="flex items-center gap-3 mb-6">
        <Brain className="text-purple-400" />
        <h2 className="text-2xl font-bold">
          AI Insights
        </h2>
      </div>

      {loading ? (
        <p>Generating insights...</p>
      ) : (
        <div className="whitespace-pre-wrap leading-8 text-slate-300">
          {insights}
        </div>
      )}

    </div>
  );
}