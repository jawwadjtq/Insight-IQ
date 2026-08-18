import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";

import Dashboard from "./pages/Dashboard/Dashboard";
import Upload from "./pages/Upload";
import Analytics from "./pages/Analytics";
import AIAnalyst from "./pages/AIAnalyst";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PDFReport from "./pages/PDFReport";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div
        className="
          flex
          min-h-screen
          bg-white
          text-slate-900
          transition-colors
          duration-300
          dark:bg-slate-950
          dark:text-white
        "
      >
        {/* =====================================================
            DESKTOP SIDEBAR
        ===================================================== */}

        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* =====================================================
            MOBILE SIDEBAR
        ===================================================== */}

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Sidebar */}

            <div
              className="
                relative
                z-50
                h-full
                w-72
                shrink-0
                bg-white
                shadow-2xl
                dark:bg-slate-900
              "
            >
              <Sidebar
                onClose={() => setSidebarOpen(false)}
              />
            </div>

            {/* Overlay */}

            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
              className="
                absolute
                inset-0
                h-full
                w-full
                cursor-default
                bg-black/50
                backdrop-blur-[2px]
              "
            />
          </div>
        )}

        {/* =====================================================
            MAIN APPLICATION AREA
        ===================================================== */}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* ===================================================
              MOBILE HEADER
          =================================================== */}

          <header
            className="
              flex
              h-16
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-200
              bg-white
              px-4
              dark:border-slate-800
              dark:bg-slate-950
              lg:hidden
            "
          >
            {/* Menu Button */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-slate-600
                transition
                hover:bg-slate-100
                hover:text-slate-900
                focus:outline-none
                focus:ring-4
                focus:ring-blue-500/10
                dark:text-slate-400
                dark:hover:bg-slate-900
                dark:hover:text-white
              "
            >
              <Menu size={23} />
            </button>

            {/* Logo */}

            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-600
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  shadow-blue-600/20
                "
              >
                I
              </div>

              <span
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                InsightIQ
              </span>
            </div>

            {/* Invisible balancing element */}

            <div
              aria-hidden="true"
              className="h-10 w-10"
            >
              <X
                size={23}
                className="opacity-0"
              />
            </div>
          </header>

          {/* ===================================================
              DESKTOP TOP NAVBAR
          =================================================== */}

          <TopNavbar />

          {/* ===================================================
              PAGE CONTENT
          =================================================== */}

          <main
            className="
              min-w-0
              flex-1
              overflow-auto
              bg-white
              text-slate-900
              transition-colors
              duration-300
              dark:bg-slate-950
              dark:text-white
            "
          >
            <Routes>
              {/* Dashboard */}

              <Route
                path="/"
                element={<Dashboard />}
              />

              {/* Upload */}

              <Route
                path="/upload"
                element={<Upload />}
              />

              {/* Analytics */}

              <Route
                path="/analytics"
                element={<Analytics />}
              />

              {/* AI Analyst */}

              <Route
                path="/ai"
                element={<AIAnalyst />}
              />

              {/* Compatibility route
                  Allows /ai-analyst to work too. */}

              <Route
                path="/ai-analyst"
                element={<AIAnalyst />}
              />

              {/* Reports */}

              <Route
                path="/reports"
                element={<Reports />}
              />

              {/* Settings */}

              <Route
                path="/settings"
                element={<Settings />}
              />

              {/* PDF Report */}

              <Route
                path="/pdf-report"
                element={<PDFReport />}
              />

              {/* Fallback */}

              <Route
                path="*"
                element={<Dashboard />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}