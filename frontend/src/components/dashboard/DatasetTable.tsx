import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  preview: Record<string, any>[] | undefined;
};

export default function DatasetTable({ preview }: Props) {
  const [search, setSearch] = useState("");

  if (!preview || preview.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
        <h2 className="text-2xl font-bold text-white">
          Dataset Preview
        </h2>

        <p className="mt-4 text-slate-400">
          No preview data available.
        </p>
      </div>
    );
  }

  const columns = Object.keys(preview[0]);

  const filtered = useMemo(() => {
    if (!search.trim()) return preview;

    return preview.filter((row) =>
      columns.some((column) =>
        String(row[column])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, preview]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">

      {/* Header */}

      <div className="border-b border-slate-800 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Dataset Preview
          </h2>

          <p className="text-slate-400 mt-1">
            Showing uploaded dataset records.
          </p>

        </div>

        <div className="relative w-full lg:w-96">

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="
            w-full

            rounded-xl

            border
            border-slate-700

            bg-slate-950

            py-3
            pl-11
            pr-4

            text-white

            outline-none

            focus:border-blue-500
            "
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-auto max-h-[650px]">

        <table className="w-full border-collapse">

          <thead className="sticky top-0 bg-slate-950 z-20">

            <tr>

              {columns.map((column) => (

                <th
                  key={column}
                  className="
                  px-6
                  py-4

                  text-left

                  font-semibold

                  text-slate-300

                  border-b
                  border-slate-800

                  whitespace-nowrap
                  "
                >
                  {column}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {filtered.map((row, rowIndex) => (

              <tr
                key={rowIndex}
                className="
                border-b
                border-slate-800

                odd:bg-slate-900
                even:bg-slate-950

                hover:bg-slate-800

                transition
                "
              >

                {columns.map((column) => (

                  <td
                    key={column}
                    className="
                    px-6
                    py-4

                    whitespace-nowrap

                    text-slate-300
                    "
                  >
                    {String(row[column])}
                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex justify-between text-sm text-slate-400">

        <span>
          Showing {filtered.length} rows
        </span>

        <span>
          {columns.length} columns
        </span>

      </div>

    </div>
  );
}