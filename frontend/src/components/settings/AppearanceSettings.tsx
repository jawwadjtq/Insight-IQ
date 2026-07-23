import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Appearance
      </h2>

      <div className="space-y-8">

        {/* Theme */}

        <div>

          <h3 className="text-lg font-semibold mb-4">
            Theme
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <button
              onClick={() => setTheme("light")}
              className={`rounded-xl border p-5 transition-all ${
                theme === "light"
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-800 hover:border-slate-500"
              }`}
            >
              <Sun className="mx-auto mb-3" size={30} />

              <h4 className="font-semibold">
                Light
              </h4>

              <p className="text-sm mt-2 text-slate-300">
                Bright interface for daytime work.
              </p>

            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`rounded-xl border p-5 transition-all ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-800 hover:border-slate-500"
              }`}
            >
              <Moon className="mx-auto mb-3" size={30} />

              <h4 className="font-semibold">
                Dark
              </h4>

              <p className="text-sm mt-2 text-slate-300">
                Comfortable for night-time work.
              </p>

            </button>

            <button
              onClick={() => setTheme("system")}
              className={`rounded-xl border p-5 transition-all ${
                theme === "system"
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-800 hover:border-slate-500"
              }`}
            >
              <Monitor className="mx-auto mb-3" size={30} />

              <h4 className="font-semibold">
                System
              </h4>

              <p className="text-sm mt-2 text-slate-300">
                Match your operating system theme.
              </p>

            </button>

          </div>

        </div>

        {/* Font Size */}

        <div>

          <label className="block font-semibold mb-3">
            Font Size
          </label>

          <select
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3"
            defaultValue="medium"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

        </div>

      </div>

    </div>
  );
}