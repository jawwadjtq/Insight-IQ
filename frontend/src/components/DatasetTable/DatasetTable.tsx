import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Loader2,
  Database,
} from "lucide-react";

import {
  getDatasetData,
  getDatasetInformation,
  type DatasetPageResponse,
  type DatasetInformation,
} from "../../services/datasetApi";


// =========================================================
// CONSTANTS
// =========================================================

const DEFAULT_PAGE_SIZE = 50;

const PAGE_SIZE_OPTIONS = [
  25,
  50,
  100,
  250,
];


// =========================================================
// HELPERS
// =========================================================

function formatCellValue(
  value: unknown
): string {

  if (value === null || value === undefined) {
    return "—";
  }

  if (
    typeof value === "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return String(value);
    }
  }

  return String(value);
}


// =========================================================
// COMPONENT
// =========================================================

export default function DatasetTable() {

  // =======================================================
  // DATASET INFORMATION
  // =======================================================

  const [
    datasetInformation,
    setDatasetInformation,
  ] = useState<DatasetInformation | null>(
    null
  );


  // =======================================================
  // TABLE DATA
  // =======================================================

  const [
    datasetPage,
    setDatasetPage,
  ] = useState<DatasetPageResponse | null>(
    null
  );


  // =======================================================
  // UI STATE
  // =======================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    page,
    setPage,
  ] = useState(1);


  const [
    pageSize,
    setPageSize,
  ] = useState(
    DEFAULT_PAGE_SIZE
  );


  const [
    orderBy,
    setOrderBy,
  ] = useState<string | null>(
    null
  );


  const [
    descending,
    setDescending,
  ] = useState(false);


  // =======================================================
  // LOAD DATASET INFORMATION
  // =======================================================

  const loadDatasetInformation =
    useCallback(
      async () => {

        try {

          const information =
            await getDatasetInformation();

          setDatasetInformation(
            information
          );

        } catch (error) {

          console.error(
            error
          );

        }

      },
      []
    );


  // =======================================================
  // LOAD TABLE DATA
  // =======================================================

  const loadTableData =
    useCallback(
      async () => {

        setLoading(true);

        setError(null);

        try {

          const result =
            await getDatasetData({
              page,
              pageSize,
              orderBy,
              descending,
            });

          setDatasetPage(
            result
          );

        } catch (error) {

          console.error(
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load dataset."
          );

        } finally {

          setLoading(false);

        }

      },
      [
        page,
        pageSize,
        orderBy,
        descending,
      ]
    );


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(
    () => {

      loadDatasetInformation();

    },
    [
      loadDatasetInformation,
    ]
  );


  // =======================================================
  // TABLE LOAD
  // =======================================================

  useEffect(
    () => {

      loadTableData();

    },
    [
      loadTableData,
    ]
  );


  // =======================================================
  // COLUMNS
  // =======================================================

  const columns = useMemo(
    () => {

      if (
        datasetPage?.columns &&
        datasetPage.columns.length > 0
      ) {

        return datasetPage.columns;

      }

      return (
        datasetInformation?.schema?.map(
          column =>
            column.column
        ) || []
      );

    },
    [
      datasetPage,
      datasetInformation,
    ]
  );


  // =======================================================
  // SORT
  // =======================================================

  const handleSort = (
    column: string
  ) => {

    if (orderBy === column) {

      setDescending(
        current =>
          !current
      );

      setPage(1);

      return;
    }

    setOrderBy(
      column
    );

    setDescending(
      false
    );

    setPage(1);
  };


  // =======================================================
  // PAGE SIZE
  // =======================================================

  const handlePageSizeChange = (
    value: number
  ) => {

    setPageSize(
      value
    );

    setPage(
      1
    );
  };


  // =======================================================
  // PREVIOUS PAGE
  // =======================================================

  const handlePreviousPage =
    () => {

      if (page <= 1) {
        return;
      }

      setPage(
        current =>
          current - 1
      );
    };


  // =======================================================
  // NEXT PAGE
  // =======================================================

  const handleNextPage =
    () => {

      if (
        datasetPage &&
        page >= datasetPage.total_pages
      ) {
        return;
      }

      setPage(
        current =>
          current + 1
      );
    };


  // =======================================================
  // EMPTY STATE
  // =======================================================

  if (
    !loading &&
    !datasetInformation?.available
  ) {

    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">

        <div className="text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">

            <Database
              className="h-7 w-7 text-slate-500"
            />

          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No dataset available
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Upload a CSV, Excel, or Parquet file
            to explore your data.
          </p>

        </div>

      </div>
    );
  }


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

        <div>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Dataset Explorer
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

            {datasetInformation?.filename ||
              "Current dataset"}

            {datasetInformation?.rows !== undefined && (
              <>
                {" · "}
                {datasetInformation.rows.toLocaleString()}
                {" rows"}
              </>
            )}

          </p>

        </div>


        {/* PAGE SIZE */}

        <div className="flex items-center gap-2">

          <label className="text-sm text-slate-500 dark:text-slate-400">
            Rows:
          </label>

          <select
            value={pageSize}
            onChange={event =>
              handlePageSizeChange(
                Number(
                  event.target.value
                )
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >

            {PAGE_SIZE_OPTIONS.map(
              size => (
                <option
                  key={size}
                  value={size}
                >
                  {size}
                </option>
              )
            )}

          </select>

        </div>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="border-b border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

          {error}

        </div>

      )}


      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div className="relative overflow-x-auto">

        {loading && (

          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-900/70">

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">

              <Loader2
                className="h-5 w-5 animate-spin text-indigo-500"
              />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Loading data...
              </span>

            </div>

          </div>

        )}


        <table className="min-w-full text-left text-sm">

          {/* ================================================= */}
          {/* TABLE HEADER */}
          {/* ================================================= */}

          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">

            <tr>

              {columns.map(
                column => (

                  <th
                    key={column}
                    className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700 dark:text-slate-200"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          column
                        )
                      }
                      className="flex items-center gap-2 transition hover:text-indigo-600 dark:hover:text-indigo-400"
                    >

                      <span>
                        {column}
                      </span>

                      {orderBy === column ? (

                        descending ? (

                          <ArrowDown
                            className="h-4 w-4"
                          />

                        ) : (

                          <ArrowUp
                            className="h-4 w-4"
                          />

                        )

                      ) : (

                        <ChevronsUpDown
                          className="h-4 w-4 opacity-40"
                        />

                      )}

                    </button>

                  </th>

                )
              )}

            </tr>

          </thead>


          {/* ================================================= */}
          {/* TABLE BODY */}
          {/* ================================================= */}

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

            {datasetPage?.data?.map(
              (row, rowIndex) => (

                <tr
                  key={rowIndex}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >

                  {columns.map(
                    column => (

                      <td
                        key={`${rowIndex}-${column}`}
                        className="max-w-[320px] whitespace-nowrap px-5 py-3 text-slate-600 dark:text-slate-300"
                        title={formatCellValue(
                          row[column]
                        )}
                      >

                        <span className="block max-w-[320px] overflow-hidden text-ellipsis">

                          {formatCellValue(
                            row[column]
                          )}

                        </span>

                      </td>

                    )
                  )}

                </tr>

              )
            )}


            {/* ================================================= */}
            {/* EMPTY PAGE */}
            {/* ================================================= */}

            {!loading &&
              datasetPage &&
              datasetPage.data.length === 0 && (

                <tr>

                  <td
                    colSpan={
                      Math.max(
                        columns.length,
                        1
                      )
                    }
                    className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                  >

                    No rows found.

                  </td>

                </tr>

              )}

          </tbody>

        </table>

      </div>


      {/* ================================================= */}
      {/* PAGINATION */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

        <div className="text-sm text-slate-500 dark:text-slate-400">

          {datasetPage ? (

            <>
              Showing{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {datasetPage.data.length}
              </span>
              {" of "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {datasetPage.total_rows.toLocaleString()}
              </span>
              {" rows"}
            </>

          ) : (

            "Loading..."

          )}

        </div>


        <div className="flex items-center gap-3">

          <span className="text-sm text-slate-500 dark:text-slate-400">

            Page{" "}

            <span className="font-medium text-slate-700 dark:text-slate-200">
              {datasetPage?.page || page}
            </span>

            {" of "}

            <span className="font-medium text-slate-700 dark:text-slate-200">
              {datasetPage?.total_pages || 1}
            </span>

          </span>


          <button
            type="button"
            onClick={
              handlePreviousPage
            }
            disabled={
              loading ||
              page <= 1
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Previous page"
          >

            <ChevronLeft
              className="h-4 w-4"
            />

          </button>


          <button
            type="button"
            onClick={
              handleNextPage
            }
            disabled={
              loading ||
              !datasetPage ||
              page >=
                datasetPage.total_pages
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Next page"
          >

            <ChevronRight
              className="h-4 w-4"
            />

          </button>

        </div>

      </div>

    </div>
  );
}