import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type Props = {
  preview: any[];
};

export default function DatasetTable({ preview }: Props) {
  const [search, setSearch] = useState("");

  if (!preview || preview.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        No dataset preview available.
      </div>
    );
  }

  const columns = Object.keys(preview[0]);

  const filteredRows = useMemo(() => {
    return preview.filter((row) =>
      columns.some((column) =>
        String(row[column])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [preview, search]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-6 border-b border-slate-800">

        <h2 className="text-2xl font-bold">
          Dataset Preview
        </h2>

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search dataset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-blue-500 w-72"
          />

        </div>

      </div>

      <div className="overflow-auto max-h-[500px]">

        <table className="min-w-full">

          <thead className="bg-slate-800 sticky top-0">

            <tr>

              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                >
                  {column}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>

            {filteredRows.map((row, index) => (

              <tr
                key={index}
                className="border-t border-slate-800 hover:bg-slate-800 transition"
              >

                {columns.map((column) => (

                  <td
                    key={column}
                    className="px-4 py-3 whitespace-nowrap"
                  >
                    {String(row[column])}
                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}