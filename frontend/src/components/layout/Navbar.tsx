export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
          J
        </div>
      </div>
    </header>
  );
}