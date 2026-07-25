import {
  Database,
  Columns,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  summary: any;
}

export default function KPIGrid({ summary }: Props) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Rows",
      value: summary.rows,
      subtitle: "Records in dataset",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Columns",
      value: summary.columns,
      subtitle: "Available features",
      icon: Columns,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Missing Values",
      value: summary.missing_values,
      subtitle: "Require attention",
      icon: AlertTriangle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Quality Score",
      value: `${summary.quality_score}%`,
      subtitle: "Overall dataset health",
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-blue-500
              hover:shadow-2xl
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {card.value}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {card.subtitle}
                </p>
              </div>

              <div
                className={`
                  ${card.bg}
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                `}
              >
                <Icon
                  className={card.color}
                  size={28}
                />
              </div>
            </div>

            {/* Bottom Progress Bar */}

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{
                  width:
                    card.title === "Quality Score"
                      ? `${summary.quality_score}%`
                      : "100%",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}