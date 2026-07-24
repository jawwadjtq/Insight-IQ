import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">

      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Drawer */}
          <div className="fixed top-0 left-0 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile Top Bar */}
        <header className="flex h-16 items-center border-b border-slate-800 bg-slate-950 px-4 md:hidden">

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-800 transition"
          >
            <Menu size={24} />
          </button>

          <h1 className="ml-4 text-xl font-bold">
            InsightIQ
          </h1>

        </header>

        {/* Desktop Navbar */}
        <Navbar />

        {/* Page */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}