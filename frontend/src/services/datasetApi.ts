/**
 * InsightIQ Dataset API
 *
 * Handles communication with the backend dataset endpoints.
 *
 * IMPORTANT:
 * The frontend never downloads the complete dataset.
 * Dataset rows are requested page-by-page from the backend.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


// =========================================================
// TYPES
// =========================================================

export interface DatasetSchemaColumn {
  column: string;
  type: string;
}


export interface DatasetInformation {
  available: boolean;
  filename: string | null;
  file_type: string | null;
  rows: number;
  columns: number;
  schema: DatasetSchemaColumn[];
}


export interface DatasetPageResponse {
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
  columns: string[];
  data: Record<string, unknown>[];
}


// =========================================================
// GET DATASET INFORMATION
// =========================================================

export async function getDatasetInformation(): Promise<DatasetInformation> {
  const response = await fetch(
    `${API_BASE_URL}/dataset/`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load dataset information."
    );
  }

  return response.json();
}


// =========================================================
// GET DATASET SCHEMA
// =========================================================

export async function getDatasetSchema(): Promise<DatasetSchemaColumn[]> {
  const response = await fetch(
    `${API_BASE_URL}/dataset/schema`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load dataset schema."
    );
  }

  const result = await response.json();

  return result.columns || [];
}


// =========================================================
// GET PAGINATED DATA
// =========================================================

export interface GetDatasetDataOptions {
  page?: number;
  pageSize?: number;
  columns?: string[];
  orderBy?: string | null;
  descending?: boolean;
}


export async function getDatasetData(
  options: GetDatasetDataOptions = {}
): Promise<DatasetPageResponse> {

  const {
    page = 1,
    pageSize = 50,
    columns = [],
    orderBy = null,
    descending = false,
  } = options;


  const params = new URLSearchParams();

  params.set(
    "page",
    String(page)
  );

  params.set(
    "page_size",
    String(pageSize)
  );


  if (columns.length > 0) {
    params.set(
      "columns",
      columns.join(",")
    );
  }


  if (orderBy) {
    params.set(
      "order_by",
      orderBy
    );

    params.set(
      "descending",
      String(descending)
    );
  }


  const response = await fetch(
    `${API_BASE_URL}/dataset/data?${params.toString()}`
  );


  if (!response.ok) {

    let message =
      "Failed to load dataset.";

    try {

      const error =
        await response.json();

      if (error?.detail) {
        message = error.detail;
      }

    } catch {
      // Keep default message.
    }

    throw new Error(
      message
    );
  }


  return response.json();
}