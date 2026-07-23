import { useMemo, useState } from "react";

type Props = {
  preview: any[];
};

export default function DatasetTable({ preview }: Props) {
  const [search, setSearch] = useState("");

  if (!preview || preview.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl p-8">
        No preview available.
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
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

      <div className="flex justify-between items-center p-6 border-b border-slate-800">

        <h2 className="text-2xl font-bold">
          Dataset Preview
        </h2>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 px-4 py-2 rounded-lg outline-none border border-slate-700 w-64"
        />

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left"
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
                    className="px-4 py-3"
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