import { Search, Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header
      className="
      hidden md:flex
      h-16
      border-b
      border-slate-800
      bg-slate-950
      items-center
      justify-between
      px-6
      "
    >
      {/* Left */}

      <div>
        <h2 className="text-xl font-semibold text-white">
          Dashboard
        </h2>

        <p className="text-sm text-slate-400">
          Welcome to InsightIQ
        </p>
      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        {/* Search */}

        <div className="relative hidden lg:block">

          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="
            w-64
            rounded-xl
            bg-slate-900
            border
            border-slate-700
            py-2
            pl-10
            pr-4
            text-sm
            outline-none
            focus:border-blue-500
            "
          />

        </div>

        {/* Notification */}

        <button
          className="
          p-2
          rounded-xl
          bg-slate-900
          hover:bg-slate-800
          transition
          "
        >
          <Bell size={20} />
        </button>

        {/* User */}

        <div
          className="
          flex
          items-center
          gap-3
          "
        >

          <div
            className="
            w-10
            h-10
            rounded-full
            bg-blue-600
            flex
            items-center
            justify-center
            "
          >
            <User size={18} />
          </div>

          <div className="hidden xl:block">

            <p className="text-sm font-semibold">
              Jawad
            </p>

            <p className="text-xs text-slate-400">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}