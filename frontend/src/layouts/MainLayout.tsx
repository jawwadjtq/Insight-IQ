import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed left-0 top-0 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <div className="md:hidden h-16 flex items-center px-4 border-b border-slate-800">

          <button
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={28} />
          </button>

          <h1 className="ml-4 text-xl font-bold">
            InsightIQ
          </h1>

        </div>

        <Navbar />

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}