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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed left-0 top-0 z-50 md:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="w-full md:flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <div className="md:hidden h-16 flex items-center px-4 border-b border-slate-800 bg-slate-950">

          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white"
          >
            <Menu size={28} />
          </button>

          <h1 className="ml-4 text-xl font-bold">
            InsightIQ
          </h1>

        </div>

        {/* Desktop Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}