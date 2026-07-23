import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Analytics from "./pages/Analytics";
import AIAnalyst from "./pages/AIAnalyst";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PDFReport from "./pages/PDFReport";

export default function App() {
  return (
    <BrowserRouter>

      <div
        className="
        flex
        min-h-screen

        bg-white
        text-slate-900

        dark:bg-slate-950
        dark:text-white

        transition-colors
        duration-300
      "
      >

        <Sidebar />

        <main className="flex-1 p-8 overflow-auto">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/upload"
              element={<Upload />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/ai"
              element={<AIAnalyst />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/pdf-report"
              element={<PDFReport />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  );
}