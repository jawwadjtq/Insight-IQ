interface Props {
  summary: any;
}

export default function DataQuality({ summary }: Props) {

  return (

    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Data Quality Analysis
      </h2>

      <div className="space-y-5">

        <div>

          <h3 className="font-semibold">
            Missing Values
          </h3>

          <p>
            {summary.missing_values}
          </p>

        </div>

        <div>

          <h3 className="font-semibold">
            Duplicate Rows
          </h3>

          <p>
            {summary.duplicate_rows}
          </p>

        </div>

        <div>

          <h3 className="font-semibold">
            Quality Score
          </h3>

          <p className="text-3xl font-bold text-green-500">

            {summary.quality_score}%

          </p>

        </div>

      </div>

    </div>

  );

}