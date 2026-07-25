import {
  Bell,
  Search,
  Moon,
  Sun,
  User,
} from "lucide-react";

import { useState } from "react";

export default function TopNavbar() {
  const [dark, setDark] = useState(true);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  }

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-slate-800 bg-slate-900 shadow-lg">

      <div className="flex h-full items-center justify-between px-8">

        {/* Search */}

        <div className="relative w-full max-w-xl">

          <Search
            size={20}
            className="absolute left-4 top-3.5 text-slate-500"
          />

          <input
            placeholder="Search anything..."
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              py-3
              pl-12
              pr-4
              text-white
              outline-none
              transition
              focus:border-blue-500
            "
          />

        </div>

        {/* Right */}

        <div className="flex items-center gap-5 ml-8">

          <button
            onClick={toggleTheme}
            className="rounded-xl bg-slate-950 p-3 transition hover:bg-slate-800"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="relative rounded-xl bg-slate-950 p-3 transition hover:bg-slate-800"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-slate-950 px-4 py-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">

              <User size={18} />

            </div>

            <div>

              <h3 className="font-semibold">
                Admin
              </h3>

              <p className="text-xs text-slate-400">
                InsightIQ
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}