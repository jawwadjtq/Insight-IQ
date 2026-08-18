import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
  Search,
} from "lucide-react";

type DatasetRow = Record<string, any>;

type Props = {
  preview: DatasetRow[];
  totalRows?: number;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const PAGE_SIZE = 20;

export default function DatasetTable({
  preview,
  totalRows = 0,
}: Props) {
  const [rows, setRows] = useState<DatasetRow[]>(
    preview || []
  );

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [serverTotalRows, setServerTotalRows] =
    useState<number>(
      totalRows || preview?.length || 0
    );

  // =========================================================
  // LOAD DATASET PAGE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/dataset/data?page=${page}&page_size=${PAGE_SIZE}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load dataset page: ${response.status}`
          );
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        /*
         * Expected scalable backend response:
         *
         * {
         *   page: 1,
         *   page_size: 20,
         *   total_rows: 1000000,
         *   total_pages: 50000,
         *   columns: [...],
         *   data: [...]
         * }
         */

        const fetchedRows = Array.isArray(
          data.data
        )
          ? data.data
          : [];

        setRows(fetchedRows);

        if (
          typeof data.total_rows ===
          "number"
        ) {
          setServerTotalRows(
            data.total_rows
          );
        }
      } catch (err) {
        console.error(
          "Failed to load dataset page:",
          err
        );

        if (cancelled) {
          return;
        }

        setError(
          "Unable to load dataset records."
        );

        /*
         * Keep the original preview visible
         * if the pagination endpoint fails.
         */
        if (
          page === 1 &&
          preview &&
          preview.length > 0
        ) {
          setRows(preview);

          setServerTotalRows(
            totalRows || preview.length
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [page, preview, totalRows]);

  // =========================================================
  // COLUMNS
  // =========================================================

  const columns = useMemo(() => {
    if (
      rows &&
      rows.length > 0
    ) {
      return Object.keys(rows[0]);
    }

    if (
      preview &&
      preview.length > 0
    ) {
      return Object.keys(
        preview[0]
      );
    }

    return [];
  }, [rows, preview]);

  // =========================================================
  // SEARCH
  // =========================================================

  /*
   * Search is intentionally performed only on the
   * currently loaded page.
   *
   * This prevents InsightIQ from downloading the
   * entire dataset just to perform a browser search.
   */
  const filteredRows = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      columns.some((column) =>
        String(
          row[column] ?? ""
        )
          .toLowerCase()
          .includes(query)
      )
    );
  }, [
    rows,
    columns,
    search,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      serverTotalRows /
        PAGE_SIZE
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const startRow =
    serverTotalRows === 0
      ? 0
      : (safePage - 1) *
          PAGE_SIZE +
        1;

  const endRow =
    serverTotalRows === 0
      ? 0
      : Math.min(
          safePage * PAGE_SIZE,
          serverTotalRows
        );

  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  function goToPreviousPage() {
    setSearch("");

    setPage((current) =>
      Math.max(
        1,
        current - 1
      )
    );
  }

  // =========================================================
  // NEXT PAGE
  // =========================================================

  function goToNextPage() {
    setSearch("");

    setPage((current) =>
      Math.min(
        totalPages,
        current + 1
      )
    );
  }

  // =========================================================
  // EMPTY DATASET
  // =========================================================

  if (
    !loading &&
    columns.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">

        <Database
          size={32}
          className="mx-auto text-slate-400"
        />

        <p className="mt-4 font-semibold text-slate-900 dark:text-white">
          No dataset preview available.
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload a dataset to view its records.
        </p>

      </div>
    );
  }

  // =========================================================
  // MAIN TABLE
  // =========================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

      {/* =================================================== */}
      {/* HEADER */}
      {/* =================================================== */}

      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

              <Database
                size={19}
                className="text-blue-500"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Dataset Records
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">

                Showing{" "}

                {startRow.toLocaleString()}

                –

                {endRow.toLocaleString()}

                {" "}of{" "}

                {serverTotalRows.toLocaleString()}

                {" "}records

              </p>

            </div>

          </div>

        </div>

        {/* SEARCH */}

        <div className="relative w-full md:w-72">

          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search current page..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

        </div>

      </div>

      {/* =================================================== */}
      {/* ERROR */}
      {/* =================================================== */}

      {error && (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
          {error}
        </div>
      )}

      {/* =================================================== */}
      {/* TABLE */}
      {/* =================================================== */}

      <div className="relative max-h-[500px] overflow-auto">

        {/* LOADING OVERLAY */}

        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-900/70">

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">

              <Loader2
                size={18}
                className="animate-spin text-blue-500"
              />

              Loading records...

            </div>

          </div>
        )}

        <table className="min-w-full">

          {/* TABLE HEADER */}

          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800">

            <tr>

              {columns.map(
                (column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400"
                  >
                    {column}
                  </th>
                )
              )}

            </tr>

          </thead>

          {/* TABLE BODY */}

          <tbody>

            {filteredRows.length >
            0 ? (
              filteredRows.map(
                (
                  row,
                  rowIndex
                ) => (
                  <tr
                    key={`${safePage}-${rowIndex}`}
                    className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >

                    {columns.map(
                      (
                        column
                      ) => (
                        <td
                          key={column}
                          className="max-w-[320px] whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                          title={String(
                            row[
                              column
                            ] ?? ""
                          )}
                        >

                          {row[
                            column
                          ] ===
                            null ||
                          row[
                            column
                          ] ===
                            undefined ? (
                            <span className="italic text-slate-400">
                              null
                            </span>
                          ) : (
                            String(
                              row[
                                column
                              ]
                            )
                          )}

                        </td>
                      )
                    )}

                  </tr>
                )
              )
            ) : (
              <tr>

                <td
                  colSpan={Math.max(
                    columns.length,
                    1
                  )}
                  className="px-6 py-12 text-center"
                >

                  <Search
                    size={28}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                    No matching records
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Try a different search term.
                  </p>

                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* =================================================== */}
      {/* PAGINATION */}
      {/* =================================================== */}

      <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

        {/* RECORD INFORMATION */}

        <div className="text-sm text-slate-500 dark:text-slate-400">

          Page{" "}

          <span className="font-semibold text-slate-900 dark:text-white">
            {safePage}
          </span>

          {" "}of{" "}

          <span className="font-semibold text-slate-900 dark:text-white">
            {totalPages}
          </span>

        </div>

        {/* BUTTONS */}

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={
              goToPreviousPage
            }
            disabled={
              safePage <= 1 ||
              loading
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >

            <ChevronLeft
              size={17}
            />

            Previous

          </button>

          <div className="hidden rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:block">

            {safePage}

          </div>

          <button
            type="button"
            onClick={
              goToNextPage
            }
            disabled={
              safePage >=
                totalPages ||
              loading
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >

            Next

            <ChevronRight
              size={17}
            />

          </button>

        </div>

      </div>

    </div>
  );
}