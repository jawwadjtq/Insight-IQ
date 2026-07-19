import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Brain,
  FileText,
  Settings,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FolderOpen, label: "Datasets" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Brain, label: "AI Analyst" },
  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">
          InsightIQ
        </h1>

        <p className="text-xs text-slate-400 mt-1">
          AI Data Analytics Platform
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}