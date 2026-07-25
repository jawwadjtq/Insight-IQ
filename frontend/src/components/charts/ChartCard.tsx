interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div
      className="
      rounded-3xl
      border
      border-slate-800
      bg-slate-900
      shadow-xl

      transition-all
      duration-300

      hover:border-blue-500
      hover:shadow-blue-900/20
      "
    >
      <div className="border-b border-slate-800 px-6 py-5">

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">
            {subtitle}
          </p>
        )}

      </div>

      <div className="p-6">

        {children}

      </div>

    </div>
  );
}