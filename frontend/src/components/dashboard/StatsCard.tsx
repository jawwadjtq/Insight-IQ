import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-400">{title}</p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <Icon
          size={40}
          className={color}
        />
      </div>
    </div>
  );
}