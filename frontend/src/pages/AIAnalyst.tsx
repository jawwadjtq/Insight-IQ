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
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          AI Analyst
        </h1>

        <p className="text-slate-400 mt-2">
          Ask questions about your uploaded dataset.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

        <textarea
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something like: Which columns should I clean first?"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 outline-none"
        />

        <button
          onClick={askAI}
          className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl"
        >
          <Send size={18} />
          Ask AI
        </button>

      </div>

      {loading && (
        <div className="bg-blue-900/20 border border-blue-600 rounded-xl p-4">
          Thinking...
        </div>
      )}

      {answer && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <div className="flex items-center gap-3 mb-6">
            <Brain className="text-blue-400" />
            <h2 className="text-2xl font-bold">
              AI Response
            </h2>
          </div>

          <p className="leading-8 whitespace-pre-wrap">
            {answer}
          </p>

        </div>
      )}

    </div>
  );
}