"""
InsightIQ scalable upload router.

Supported files:

- CSV
- XLSX
- Parquet
- PDF

Dataset architecture:

    CSV
      ↓
    DuckDB ingestion
      ↓
    Parquet
      ↓
    DuckDB current_dataset VIEW

    XLSX
      ↓
    Pandas
      ↓
    Parquet
      ↓
    DuckDB current_dataset VIEW

    Parquet
      ↓
    Managed Parquet storage
      ↓
    DuckDB current_dataset VIEW

    PDF
      ↓
    PDF text extraction
      ↓
    AI analysis

IMPORTANT:

Large CSV files are never loaded into a Pandas DataFrame.

The dataset is stored physically as Parquet and queried through
DuckDB.

The AI layer receives compact summaries and query results rather
than the complete dataset.
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
)

import tempfile
import traceback

from pathlib import Path

from app.services.dataset_service import (
    analyze_current_dataset,
)

from app.services.pdf_service import (
    extract_pdf_text,
)

from app.services.ai_service import (
    ask_gemini,
)

from app.services import storage


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


# =========================================================
# CONSTANTS
# =========================================================

UPLOAD_CHUNK_SIZE = (
    8 * 1024 * 1024
)

MAX_PDF_AI_TEXT = 12000


# =========================================================
# TEMP DIRECTORY
# =========================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    .parent
)

TEMP_DIR = (
    BASE_DIR
    / "data"
    / "uploads"
)

TEMP_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# SAVE UPLOAD TO DISK
# =========================================================

async def save_upload_to_disk(
    file: UploadFile,
) -> Path:
    """
    Save an uploaded file incrementally to disk.

    The entire file is never loaded into RAM.

    Returns:
        Path to the temporary uploaded file.
    """

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was provided.",
        )

    suffix = (
        Path(
            file.filename
        )
        .suffix
        .lower()
    )

    temporary_file = (
        tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
            dir=TEMP_DIR,
        )
    )

    temporary_path = Path(
        temporary_file.name
    )

    try:

        with temporary_file:

            while True:

                chunk = await file.read(
                    UPLOAD_CHUNK_SIZE
                )

                if not chunk:

                    break

                temporary_file.write(
                    chunk
                )

        return temporary_path

    except Exception:

        try:

            temporary_path.unlink(
                missing_ok=True
            )

        except Exception:

            pass

        raise


# =========================================================
# ANALYZE ACTIVE DATASET
# =========================================================

def analyze_uploaded_dataset(
    filename: str,
    file_type: str,
) -> dict:
    """
    Analyze the currently active DuckDB/Parquet dataset.

    This keeps dataset ingestion and dataset analysis
    separate.

    The physical dataset is stored in Parquet while the
    analysis service continues using the current_dataset
    DuckDB view.
    """

    summary = (
        analyze_current_dataset(
            filename
        )
    )

    storage.current_summary = (
        summary
    )

    storage.current_filename = (
        filename
    )

    storage.current_file_type = (
        file_type
    )

    storage.current_report = None

    return summary


# =========================================================
# INGEST CSV
# =========================================================

def ingest_csv(
    csv_path: Path,
    filename: str,
) -> dict:
    """
    Ingest a CSV file into managed Parquet storage.

    CSV ingestion is performed by DuckDB.

    The CSV is NOT loaded into Pandas.
    """

    if not csv_path.exists():

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded CSV file "
                "could not be found."
            ),
        )

    try:

        # -------------------------------------------------
        # CSV → Parquet
        # -------------------------------------------------

        storage.ingest_csv_to_parquet(
            csv_path,
            filename,
        )

        # -------------------------------------------------
        # Analyze Parquet-backed dataset
        # -------------------------------------------------

        summary = (
            analyze_uploaded_dataset(
                filename,
                "csv",
            )
        )

        return summary

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "CSV ingestion failed: "
                + str(error)
            ),
        )


# =========================================================
# INGEST EXCEL
# =========================================================

def ingest_excel(
    excel_path: Path,
    filename: str,
) -> dict:
    """
    Ingest an Excel workbook.

    Excel files are parsed with Pandas because workbook
    parsing requires an Excel engine.

    The DataFrame is then immediately written to Parquet.

    The DataFrame is NOT kept as the application's active
    dataset.
    """

    import pandas as pd

    if not excel_path.exists():

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded Excel file "
                "could not be found."
            ),
        )

    # -----------------------------------------------------
    # Read Excel
    # -----------------------------------------------------

    df = pd.read_excel(
        excel_path
    )

    if df.empty:

        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded Excel "
                "file is empty."
            ),
        )

    # -----------------------------------------------------
    # Store as Parquet
    # -----------------------------------------------------

    storage.store_dataset(
        df=df,
        summary={},
        filename=filename,
        file_type="xlsx",
    )

    # -----------------------------------------------------
    # Analyze Parquet-backed dataset
    # -----------------------------------------------------

    summary = (
        analyze_uploaded_dataset(
            filename,
            "xlsx",
        )
    )

    return summary


# =========================================================
# INGEST PARQUET
# =========================================================

def ingest_parquet(
    parquet_path: Path,
    filename: str,
) -> dict:
    """
    Ingest an uploaded Parquet file.

    The uploaded file is copied into InsightIQ's managed
    Parquet storage.

    DuckDB then queries the managed Parquet file directly.
    """

    if not parquet_path.exists():

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded Parquet file "
                "could not be found."
            ),
        )

    try:

        storage.ingest_parquet(
            parquet_path,
            filename,
        )

        summary = (
            analyze_uploaded_dataset(
                filename,
                "parquet",
            )
        )

        return summary

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Parquet ingestion failed: "
                + str(error)
            ),
        )


# =========================================================
# PROCESS PDF
# =========================================================

def process_pdf(
    pdf_path: Path,
    filename: str,
) -> dict:
    """
    Extract and analyze PDF content.

    PDF processing remains separate from the structured
    dataset pipeline.
    """

    with open(
        pdf_path,
        "rb",
    ) as pdf_file:

        pdf_text = (
            extract_pdf_text(
                pdf_file
            )
        )

    if not pdf_text.strip():

        raise HTTPException(
            status_code=400,
            detail=(
                "No readable text found "
                "inside PDF."
            ),
        )

    # -----------------------------------------------------
    # Limit AI input
    # -----------------------------------------------------

    ai_text = pdf_text[
        :MAX_PDF_AI_TEXT
    ]

    prompt = f"""
You are a Senior Business Intelligence Analyst
working inside InsightIQ.

Analyze the uploaded PDF and generate:

1. Executive Summary
2. Key Findings
3. Important Metrics
4. Risks
5. Opportunities
6. Recommendations

Keep the response professional,
structured, and useful for business decision-making.

Do not invent information that is not present.

PDF Content:

{ai_text}
"""

    ai_report = ask_gemini(
        prompt
    )

    # -----------------------------------------------------
    # Store PDF information
    # -----------------------------------------------------

    storage.current_summary = None

    storage.current_filename = (
        filename
    )

    storage.current_file_type = (
        "pdf"
    )

    storage.current_report = {
        "title": "PDF Analysis Report",
        "filename": filename,
        "type": "pdf",
        "content": ai_report,
    }

    return {
        "uploaded": True,
        "type": "pdf",
        "file_type": "pdf",
        "filename": filename,
        "report": ai_report,
    }


# =========================================================
# UPLOAD FILE
# =========================================================

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
):
    """
    Upload and process a dataset.

    Supported:

        CSV
        XLSX
        Parquet
        PDF

    Structured datasets are stored as Parquet and exposed
    to DuckDB through the current_dataset view.

    Large CSV files are streamed to disk and processed by
    DuckDB without first creating a massive Pandas DataFrame.
    """

    temporary_path: Path | None = None

    try:

        # =================================================
        # VALIDATE
        # =================================================

        if not file.filename:

            raise HTTPException(
                status_code=400,
                detail="No file was provided.",
            )

        original_filename = (
            file.filename
        )

        filename = (
            original_filename.lower()
        )

        # =================================================
        # SAVE FILE TO DISK
        # =================================================

        temporary_path = (
            await save_upload_to_disk(
                file
            )
        )

        # =================================================
        # CSV
        # =================================================

        if filename.endswith(
            ".csv"
        ):

            summary = ingest_csv(
                temporary_path,
                original_filename,
            )

            return {
                "uploaded": True,
                "type": "dataset",
                "file_type": "csv",
                "filename": (
                    original_filename
                ),
                "rows": summary.get(
                    "rows",
                    0,
                ),
                "columns": summary.get(
                    "columns",
                    0,
                ),
                "summary": summary,
            }

        # =================================================
        # EXCEL
        # =================================================

        elif filename.endswith(
            ".xlsx"
        ):

            summary = ingest_excel(
                temporary_path,
                original_filename,
            )

            return {
                "uploaded": True,
                "type": "dataset",
                "file_type": "xlsx",
                "filename": (
                    original_filename
                ),
                "rows": summary.get(
                    "rows",
                    0,
                ),
                "columns": summary.get(
                    "columns",
                    0,
                ),
                "summary": summary,
            }

        # =================================================
        # PARQUET
        # =================================================

        elif filename.endswith(
            ".parquet"
        ):

            summary = ingest_parquet(
                temporary_path,
                original_filename,
            )

            return {
                "uploaded": True,
                "type": "dataset",
                "file_type": "parquet",
                "filename": (
                    original_filename
                ),
                "rows": summary.get(
                    "rows",
                    0,
                ),
                "columns": summary.get(
                    "columns",
                    0,
                ),
                "summary": summary,
            }

        # =================================================
        # PDF
        # =================================================

        elif filename.endswith(
            ".pdf"
        ):

            return process_pdf(
                temporary_path,
                original_filename,
            )

        # =================================================
        # UNSUPPORTED
        # =================================================

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only CSV, Excel, "
                    "Parquet and PDF files "
                    "are supported."
                ),
            )

    # =====================================================
    # HTTP ERROR
    # =====================================================

    except HTTPException:

        raise

    # =====================================================
    # UNEXPECTED ERROR
    # =====================================================

    except Exception as error:

        print(
            "=" * 80
        )

        print(
            "UPLOAD ERROR"
        )

        print(
            "=" * 80
        )

        traceback.print_exc()

        print(
            "=" * 80
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    # =====================================================
    # CLEAN TEMPORARY FILE
    # =====================================================

    finally:

        if temporary_path:

            try:

                temporary_path.unlink(
                    missing_ok=True
                )

            except Exception as cleanup_error:

                print(
                    "Temporary file cleanup failed:",
                    cleanup_error,
                )