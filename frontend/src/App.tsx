import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";

import Dashboard from "./pages/Dashboard";
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
      <div className="flex min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">

        {/* Desktop Sidebar */}

        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">

            <div className="w-72 bg-white dark:bg-slate-900 shadow-2xl">

              <Sidebar onClose={() => setSidebarOpen(false)} />

            </div>

            <div
              className="flex-1 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />

          </div>
        )}

        {/* Main */}

        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Mobile Header */}

          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-4 text-white lg:hidden">

            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={26} />
            </button>

            <h1 className="text-xl font-bold">
              InsightIQ
            </h1>

            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} className="opacity-0" />
            </button>

          </div>

          <TopNavbar />

          <main className="flex-1 overflow-auto p-4 md:p-8 text-slate-900 dark:text-white">

            <Routes>

              <Route path="/" element={<Dashboard />} />

              <Route path="/upload" element={<Upload />} />

              <Route path="/analytics" element={<Analytics />} />

              <Route path="/ai" element={<AIAnalyst />} />

              <Route path="/reports" element={<Reports />} />

              <Route path="/settings" element={<Settings />} />

              <Route path="/pdf-report" element={<PDFReport />} />

            </Routes>

          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}