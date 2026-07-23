interface Props {
  summary: any;
}

export default function Recommendations({ summary }: Props) {

  return (

    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        AI Recommendations
      </h2>

      <ul className="space-y-4 list-disc ml-6">

        {summary.missing_values > 0 && (

          <li>
            Fill or remove missing values before training models.
          </li>

        )}

        {summary.duplicate_rows > 0 && (

          <li>
            Remove duplicate rows to improve data quality.
          </li>

        )}

        <li>
          Normalize numeric features for better ML performance.
        </li>

        <li>
          Detect outliers before predictive analysis.
        </li>

        <li>
          Perform feature engineering for better business insights.
        </li>

      </ul>

    </div>

  );

}