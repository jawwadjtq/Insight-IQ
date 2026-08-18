"""
InsightIQ scalable application storage.

This module manages the currently uploaded dataset.

Architecture:

    CSV / XLSX / Parquet
            |
            v
        Parquet file
            |
            v
        DuckDB
            |
            v
    current_dataset VIEW
            |
            v
       SQL analytics

Design goals:

- Store datasets efficiently on disk using Parquet.
- Use DuckDB as the analytical/query engine.
- Avoid keeping large datasets in application memory.
- Preserve the existing `current_dataset` interface.
- Support large-scale querying.
- Provide pagination for frontend dataset views.
- Keep AI requests limited to compact query results.
"""

from __future__ import annotations

from typing import Any

from pathlib import Path
import threading
import re
import uuid

import duckdb
import pandas as pd


# =========================================================
# STORAGE DIRECTORIES
# =========================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    .parent
)

DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# PARQUET DIRECTORY
# =========================================================

PARQUET_DIR = DATA_DIR / "datasets"

PARQUET_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# DUCKDB DATABASE
# =========================================================

DATABASE_PATH = (
    DATA_DIR / "insightiq.duckdb"
)


# =========================================================
# CURRENT DATASET INFORMATION
# =========================================================

current_summary: dict[str, Any] | None = None

current_filename: str | None = None

current_file_type: str | None = None

current_report: dict[str, Any] | None = None

current_dataset_path: str | None = None


# =========================================================
# DATABASE LOCK
# =========================================================

db_lock = threading.Lock()


# =========================================================
# CONSTANTS
# =========================================================

DEFAULT_PAGE_SIZE = 50

MAX_PAGE_SIZE = 500

MAX_QUERY_ROWS = 5000


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():
    """
    Create a DuckDB connection.

    A new connection is created for each operation so that
    requests remain isolated and long-lived database state
    is avoided.
    """

    return duckdb.connect(
        str(DATABASE_PATH)
    )


# =========================================================
# SAFE SQL IDENTIFIER
# =========================================================

def quote_identifier(
    identifier: str,
) -> str:
    """
    Safely quote a SQL identifier.

    This is used for column names and other identifiers that
    cannot safely be passed as SQL parameters.
    """

    if identifier is None:
        raise ValueError(
            "SQL identifier cannot be None."
        )

    identifier = str(
        identifier
    )

    return (
        '"'
        + identifier.replace(
            '"',
            '""',
        )
        + '"'
    )


# =========================================================
# SAFE FILE PATH
# =========================================================

def quote_sql_path(
    path: Path | str,
) -> str:
    """
    Escape a filesystem path for use inside a DuckDB SQL
    string literal.
    """

    return (
        "'"
        + str(path).replace(
            "'",
            "''",
        )
        + "'"
    )


# =========================================================
# INITIALIZE DATABASE
# =========================================================

def initialize_database() -> None:
    """
    Ensure the InsightIQ database and metadata table exist.
    """

    connection = get_connection()

    try:

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS dataset_metadata (
                id INTEGER,
                filename VARCHAR,
                file_type VARCHAR,
                dataset_path VARCHAR
            )
            """
        )

        # -------------------------------------------------
        # Backward compatibility with older installations
        # -------------------------------------------------

        columns = connection.execute(
            """
            DESCRIBE dataset_metadata
            """
        ).fetchall()

        column_names = {
            row[0]
            for row in columns
        }

        if "dataset_path" not in column_names:

            connection.execute(
                """
                ALTER TABLE dataset_metadata
                ADD COLUMN dataset_path VARCHAR
                """
            )

    finally:

        connection.close()


# =========================================================
# GET CURRENT PARQUET PATH
# =========================================================

def get_dataset_path() -> Path | None:
    """
    Return the path of the currently active Parquet dataset.
    """

    global current_dataset_path

    # -----------------------------------------------------
    # Fast application-memory lookup
    # -----------------------------------------------------

    if current_dataset_path:

        path = Path(
            current_dataset_path
        )

        if path.exists():

            return path

    # -----------------------------------------------------
    # Database metadata fallback
    # -----------------------------------------------------

    if not DATABASE_PATH.exists():

        return None

    connection = get_connection()

    try:

        try:

            result = connection.execute(
                """
                SELECT dataset_path
                FROM dataset_metadata
                WHERE id = 1
                LIMIT 1
                """
            ).fetchone()

        except Exception:

            return None

        if not result:

            return None

        if not result[0]:

            return None

        path = Path(
            str(result[0])
        )

        if not path.exists():

            return None

        current_dataset_path = str(
            path
        )

        return path

    finally:

        connection.close()


# =========================================================
# REMOVE OLD PARQUET FILE
# =========================================================

def _remove_current_parquet() -> None:
    """
    Remove the currently active Parquet file.
    """

    global current_dataset_path

    if not current_dataset_path:

        return

    try:

        path = Path(
            current_dataset_path
        )

        path.unlink(
            missing_ok=True
        )

    except Exception:

        pass

    current_dataset_path = None


# =========================================================
# CREATE DATASET VIEW
# =========================================================

def _create_current_dataset_view(
    connection,
    parquet_path: Path,
) -> None:
    """
    Create the compatibility view:

        current_dataset

    backed directly by the Parquet file.

    Existing analytics code can therefore continue using:

        SELECT * FROM current_dataset

    without needing to know that the physical dataset is now
    stored as Parquet.
    """

    escaped_path = quote_sql_path(
        parquet_path
    )

    connection.execute(
        """
        DROP VIEW IF EXISTS current_dataset
        """
    )

    connection.execute(
        """
        DROP TABLE IF EXISTS current_dataset
        """
    )

    connection.execute(
        f"""
        CREATE VIEW current_dataset AS
        SELECT *
        FROM read_parquet(
            {escaped_path}
        )
        """
    )


# =========================================================
# GENERATE PARQUET PATH
# =========================================================

def _generate_parquet_path(
    filename: str,
) -> Path:
    """
    Generate a unique Parquet filename.
    """

    safe_stem = Path(
        filename
    ).stem

    # -----------------------------------------------------
    # Keep filename filesystem-safe
    # -----------------------------------------------------

    safe_stem = re.sub(
        r"[^a-zA-Z0-9_-]+",
        "_",
        safe_stem,
    )

    safe_stem = (
        safe_stem.strip("_")
        or "dataset"
    )

    unique_id = uuid.uuid4().hex[:12]

    return (
        PARQUET_DIR
        / f"{safe_stem}_{unique_id}.parquet"
    )


# =========================================================
# SET DATASET METADATA
# =========================================================

def _set_metadata(
    connection,
    filename: str,
    file_type: str,
    parquet_path: Path,
) -> None:
    """
    Store metadata for the active dataset.
    """

    connection.execute(
        """
        DROP TABLE IF EXISTS dataset_metadata
        """
    )

    connection.execute(
        """
        CREATE TABLE dataset_metadata (
            id INTEGER,
            filename VARCHAR,
            file_type VARCHAR,
            dataset_path VARCHAR
        )
        """
    )

    connection.execute(
        """
        INSERT INTO dataset_metadata
        VALUES (1, ?, ?, ?)
        """,
        [
            filename,
            file_type,
            str(parquet_path),
        ],
    )


# =========================================================
# ACTIVATE PARQUET DATASET
# =========================================================

def activate_parquet_dataset(
    parquet_path: Path,
    filename: str,
    file_type: str,
) -> None:
    """
    Make a Parquet file the active InsightIQ dataset.

    The dataset remains physically stored as Parquet while
    DuckDB exposes it through the `current_dataset` view.
    """

    global current_filename
    global current_file_type
    global current_dataset_path
    global current_report

    if not parquet_path.exists():

        raise FileNotFoundError(
            f"Parquet dataset not found: {parquet_path}"
        )

    with db_lock:

        connection = get_connection()

        try:

            # -------------------------------------------------
            # Remove previous dataset metadata/view
            # -------------------------------------------------

            connection.execute(
                """
                DROP VIEW IF EXISTS current_dataset
                """
            )

            connection.execute(
                """
                DROP TABLE IF EXISTS current_dataset
                """
            )

            # -------------------------------------------------
            # Create metadata
            # -------------------------------------------------

            _set_metadata(
                connection,
                filename,
                file_type,
                parquet_path,
            )

            # -------------------------------------------------
            # Create Parquet-backed view
            # -------------------------------------------------

            _create_current_dataset_view(
                connection,
                parquet_path,
            )

        finally:

            connection.close()

    # -----------------------------------------------------
    # Application metadata
    # -----------------------------------------------------

    current_filename = filename

    current_file_type = file_type

    current_dataset_path = str(
        parquet_path
    )

    current_report = None


# =========================================================
# STORE DATAFRAME AS PARQUET
# =========================================================

def store_dataset(
    df: pd.DataFrame,
    summary: dict[str, Any],
    filename: str,
    file_type: str = "dataset",
) -> None:
    """
    Store a Pandas DataFrame as Parquet.

    This function preserves compatibility with existing
    Excel ingestion and legacy code.

    The DataFrame is used only during ingestion.

    After ingestion, the active dataset is represented by a
    Parquet file and queried through DuckDB.
    """

    global current_summary

    if df is None:

        raise ValueError(
            "Dataset is empty."
        )

    if df.empty:

        raise ValueError(
            "Dataset is empty."
        )

    parquet_path = (
        _generate_parquet_path(
            filename
        )
    )

    try:

        # -------------------------------------------------
        # Write Parquet
        # -------------------------------------------------

        df.to_parquet(
            parquet_path,
            index=False,
        )

        # -------------------------------------------------
        # Activate dataset
        # -------------------------------------------------

        activate_parquet_dataset(
            parquet_path,
            filename,
            file_type,
        )

        # -------------------------------------------------
        # Store application summary
        # -------------------------------------------------

        current_summary = summary

    except Exception:

        try:

            parquet_path.unlink(
                missing_ok=True
            )

        except Exception:

            pass

        raise


# =========================================================
# INGEST CSV DIRECTLY TO PARQUET
# =========================================================

def ingest_csv_to_parquet(
    csv_path: Path,
    filename: str,
) -> Path:
    """
    Convert a CSV file directly into Parquet using DuckDB.

    The CSV is never loaded into a Pandas DataFrame.

    Returns:
        Path to the generated Parquet file.
    """

    if not csv_path.exists():

        raise FileNotFoundError(
            f"CSV file not found: {csv_path}"
        )

    parquet_path = (
        _generate_parquet_path(
            filename
        )
    )

    connection = get_connection()

    try:

        escaped_csv = quote_sql_path(
            csv_path
        )

        escaped_parquet = quote_sql_path(
            parquet_path
        )

        connection.execute(
            f"""
            COPY (
                SELECT *
                FROM read_csv_auto(
                    {escaped_csv},
                    header = true,
                    sample_size = 20000,
                    ignore_errors = false
                )
            )
            TO {escaped_parquet}
            (
                FORMAT PARQUET,
                COMPRESSION ZSTD
            )
            """
        )

    except Exception:

        try:

            parquet_path.unlink(
                missing_ok=True
            )

        except Exception:

            pass

        raise

    finally:

        connection.close()

    # -----------------------------------------------------
    # Activate dataset
    # -----------------------------------------------------

    activate_parquet_dataset(
        parquet_path,
        filename,
        "csv",
    )

    return parquet_path


# =========================================================
# INGEST PARQUET FILE
# =========================================================

def ingest_parquet(
    parquet_path: Path,
    filename: str,
) -> Path:
    """
    Register an uploaded Parquet file as the active dataset.

    The file is copied into InsightIQ's managed dataset
    directory so the temporary upload can safely be deleted.
    """

    if not parquet_path.exists():

        raise FileNotFoundError(
            f"Parquet file not found: {parquet_path}"
        )

    destination = (
        _generate_parquet_path(
            filename
        )
    )

    connection = get_connection()

    try:

        escaped_source = quote_sql_path(
            parquet_path
        )

        escaped_destination = quote_sql_path(
            destination
        )

        # -------------------------------------------------
        # Copy/normalize into managed storage
        # -------------------------------------------------

        connection.execute(
            f"""
            COPY (
                SELECT *
                FROM read_parquet(
                    {escaped_source}
                )
            )
            TO {escaped_destination}
            (
                FORMAT PARQUET,
                COMPRESSION ZSTD
            )
            """
        )

    except Exception:

        try:

            destination.unlink(
                missing_ok=True
            )

        except Exception:

            pass

        raise

    finally:

        connection.close()

    activate_parquet_dataset(
        destination,
        filename,
        "parquet",
    )

    return destination


# =========================================================
# DATASET EXISTS
# =========================================================

def has_dataset() -> bool:
    """
    Check whether a dataset is currently available.
    """

    path = get_dataset_path()

    if path is None:

        return False

    if not path.exists():

        return False

    connection = get_connection()

    try:

        result = connection.execute(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_name = 'current_dataset'
            """
        ).fetchone()

        if not result or result[0] == 0:

            # -------------------------------------------------
            # The dataset may have been restored after restart.
            # -------------------------------------------------

            try:

                filename = (
                    current_filename
                    or path.name
                )

                file_type = (
                    current_file_type
                    or "parquet"
                )

                _create_current_dataset_view(
                    connection,
                    path,
                )

            except Exception:

                return False

        return True

    finally:

        connection.close()


# =========================================================
# GET ROW COUNT
# =========================================================

def get_row_count() -> int:
    """
    Return the number of rows in the current dataset.

    DuckDB performs the count.
    """

    if not has_dataset():

        return 0

    connection = get_connection()

    try:

        result = connection.execute(
            """
            SELECT COUNT(*)
            FROM current_dataset
            """
        ).fetchone()

        return int(
            result[0]
        ) if result else 0

    finally:

        connection.close()


# =========================================================
# GET COLUMN NAMES
# =========================================================

def get_column_names() -> list[str]:
    """
    Return all column names from the current dataset.
    """

    if not has_dataset():

        return []

    connection = get_connection()

    try:

        result = connection.execute(
            """
            DESCRIBE current_dataset
            """
        ).fetchall()

        return [
            row[0]
            for row in result
        ]

    finally:

        connection.close()


# =========================================================
# GET DATASET SCHEMA
# =========================================================

def get_schema() -> list[dict[str, str]]:
    """
    Return dataset column names and data types.
    """

    if not has_dataset():

        return []

    connection = get_connection()

    try:

        result = connection.execute(
            """
            DESCRIBE current_dataset
            """
        ).fetchall()

        return [
            {
                "column": row[0],
                "type": str(
                    row[1]
                ),
            }
            for row in result
        ]

    finally:

        connection.close()


# =========================================================
# VALIDATE READ-ONLY SQL
# =========================================================

def validate_read_only_query(
    sql: str,
) -> str:
    """
    Validate that a SQL query is read-only.

    This protects the dataset from accidental or malicious
    modification through query endpoints or future AI-generated
    SQL.

    Allowed:
        SELECT
        WITH

    Disallowed:
        INSERT
        UPDATE
        DELETE
        DROP
        ALTER
        CREATE
        COPY
        ATTACH
        DETACH
        INSTALL
        LOAD
        CALL
        PRAGMA
    """

    if not sql or not sql.strip():

        raise ValueError(
            "SQL query cannot be empty."
        )

    cleaned = sql.strip()

    # -----------------------------------------------------
    # Remove trailing semicolons
    # -----------------------------------------------------

    cleaned = cleaned.rstrip(";").strip()

    # -----------------------------------------------------
    # Reject multiple statements
    # -----------------------------------------------------

    if ";" in cleaned:

        raise ValueError(
            "Multiple SQL statements are not allowed."
        )

    # -----------------------------------------------------
    # Remove leading SQL comments
    # -----------------------------------------------------

    while True:

        if cleaned.startswith("--"):

            newline = cleaned.find(
                "\n"
            )

            if newline == -1:

                raise ValueError(
                    "Invalid SQL query."
                )

            cleaned = (
                cleaned[
                    newline + 1:
                ]
                .strip()
            )

            continue

        if cleaned.startswith("/*"):

            end_comment = cleaned.find(
                "*/"
            )

            if end_comment == -1:

                raise ValueError(
                    "Invalid SQL query."
                )

            cleaned = (
                cleaned[
                    end_comment + 2:
                ]
                .strip()
            )

            continue

        break

    # -----------------------------------------------------
    # Only SELECT/WITH queries are allowed
    # -----------------------------------------------------

    first_word_match = re.match(
        r"^\s*([A-Za-z]+)",
        cleaned,
    )

    if not first_word_match:

        raise ValueError(
            "Invalid SQL query."
        )

    first_word = (
        first_word_match.group(1)
        .upper()
    )

    if first_word not in {
        "SELECT",
        "WITH",
    }:

        raise ValueError(
            "Only read-only SELECT queries are allowed."
        )

    # -----------------------------------------------------
    # Explicitly reject dangerous statements
    # -----------------------------------------------------

    dangerous_keywords = {
        "INSERT",
        "UPDATE",
        "DELETE",
        "DROP",
        "ALTER",
        "CREATE",
        "COPY",
        "ATTACH",
        "DETACH",
        "INSTALL",
        "LOAD",
        "CALL",
        "PRAGMA",
        "EXPORT",
        "IMPORT",
    }

    words = {
        word.upper()
        for word in re.findall(
            r"\b[A-Za-z]+\b",
            cleaned,
        )
    }

    dangerous_found = (
        words
        & dangerous_keywords
    )

    if dangerous_found:

        raise ValueError(
            "SQL query contains a restricted operation."
        )

    return cleaned


# =========================================================
# RUN SQL QUERY
# =========================================================

def query(
    sql: str,
) -> list[dict[str, Any]]:
    """
    Execute a read-only SQL query against the current dataset.

    The query should return a reasonably small result.

    For large frontend datasets, use `query_paginated()`
    instead.
    """

    sql = validate_read_only_query(
        sql
    )

    if not has_dataset():

        raise ValueError(
            "No dataset is currently available."
        )

    connection = get_connection()

    try:

        dataframe = connection.execute(
            sql
        ).fetchdf()

        # -------------------------------------------------
        # Convert infinity values
        # -------------------------------------------------

        dataframe = dataframe.replace(
            [
                float("inf"),
                float("-inf"),
            ],
            None,
        )

        # -------------------------------------------------
        # Convert missing values
        # -------------------------------------------------

        dataframe = dataframe.where(
            pd.notnull(dataframe),
            None,
        )

        return dataframe.to_dict(
            orient="records"
        )

    finally:

        connection.close()


# =========================================================
# RUN SQL QUERY AS DATAFRAME
# =========================================================

def query_dataframe(
    sql: str,
) -> pd.DataFrame:
    """
    Execute a read-only SQL query and return a DataFrame.

    Intended for backend analytics and chart generation.

    Do NOT use this to load the entire dataset unless
    absolutely necessary.
    """

    sql = validate_read_only_query(
        sql
    )

    if not has_dataset():

        raise ValueError(
            "No dataset is currently available."
        )

    connection = get_connection()

    try:

        return connection.execute(
            sql
        ).fetchdf()

    finally:

        connection.close()


# =========================================================
# PAGINATED DATASET QUERY
# =========================================================

def query_paginated(
    page: int = 1,
    page_size: int = DEFAULT_PAGE_SIZE,
    columns: list[str] | None = None,
    order_by: str | None = None,
    descending: bool = False,
) -> dict[str, Any]:
    """
    Return a paginated section of the current dataset.

    This is the foundation for large dataset table rendering.

    Args:

        page:
            1-based page number.

        page_size:
            Number of rows per page.

        columns:
            Optional list of columns to return.

        order_by:
            Optional column used for ordering.

        descending:
            Reverse ordering when True.

    Returns:

        {
            "page": 1,
            "page_size": 50,
            "total_rows": 1000000,
            "total_pages": 20000,
            "columns": [...],
            "data": [...]
        }
    """

    if not has_dataset():

        raise ValueError(
            "No dataset is currently available."
        )

    # -----------------------------------------------------
    # Normalize pagination
    # -----------------------------------------------------

    page = max(
        1,
        int(page),
    )

    page_size = max(
        1,
        min(
            int(page_size),
            MAX_PAGE_SIZE,
        ),
    )

    offset = (
        page - 1
    ) * page_size

    connection = get_connection()

    try:

        # -------------------------------------------------
        # Total rows
        # -------------------------------------------------

        total_result = connection.execute(
            """
            SELECT COUNT(*)
            FROM current_dataset
            """
        ).fetchone()

        total_rows = int(
            total_result[0]
        ) if total_result else 0

        total_pages = (
            (
                total_rows
                + page_size
                - 1
            )
            // page_size
            if total_rows
            else 0
        )

        # -------------------------------------------------
        # Validate requested columns
        # -------------------------------------------------

        available_columns = [
            row[0]
            for row in connection.execute(
                """
                DESCRIBE current_dataset
                """
            ).fetchall()
        ]

        if columns:

            invalid_columns = [
                column
                for column in columns
                if column
                not in available_columns
            ]

            if invalid_columns:

                raise ValueError(
                    "Unknown column(s): "
                    + ", ".join(
                        invalid_columns
                    )
                )

            select_columns = ", ".join(
                quote_identifier(
                    column
                )
                for column in columns
            )

        else:

            select_columns = "*"

        # -------------------------------------------------
        # ORDER BY
        # -------------------------------------------------

        order_clause = ""

        if order_by:

            if (
                order_by
                not in available_columns
            ):

                raise ValueError(
                    f"Unknown order column: {order_by}"
                )

            direction = (
                "DESC"
                if descending
                else "ASC"
            )

            order_clause = (
                " ORDER BY "
                + quote_identifier(
                    order_by
                )
                + " "
                + direction
            )

        # -------------------------------------------------
        # Fetch page
        # -------------------------------------------------

        sql = f"""
        SELECT
            {select_columns}
        FROM current_dataset
        {order_clause}
        LIMIT {page_size}
        OFFSET {offset}
        """

        dataframe = connection.execute(
            sql
        ).fetchdf()

        dataframe = dataframe.replace(
            [
                float("inf"),
                float("-inf"),
            ],
            None,
        )

        dataframe = dataframe.where(
            pd.notnull(dataframe),
            None,
        )

        records = (
            dataframe.to_dict(
                orient="records"
            )
        )

        return {
            "page": page,
            "page_size": page_size,
            "total_rows": total_rows,
            "total_pages": total_pages,
            "columns": (
                columns
                if columns
                else available_columns
            ),
            "data": records,
        }

    finally:

        connection.close()


# =========================================================
# SAMPLE DATA
# =========================================================

def get_sample(
    limit: int = 20,
) -> list[dict[str, Any]]:
    """
    Return a small sample of the dataset.
    """

    limit = max(
        1,
        min(
            int(limit),
            100,
        ),
    )

    return query(
        f"""
        SELECT *
        FROM current_dataset
        LIMIT {limit}
        """
    )


# =========================================================
# STORE REPORT
# =========================================================

def store_report(
    report: dict[str, Any],
) -> None:
    """
    Store the latest generated report metadata.
    """

    global current_report

    current_report = report


# =========================================================
# CLEAR STORAGE
# =========================================================

def clear_storage() -> None:
    """
    Remove the current dataset and application metadata.
    """

    global current_summary
    global current_filename
    global current_file_type
    global current_report
    global current_dataset_path

    old_dataset_path = (
        current_dataset_path
    )

    with db_lock:

        connection = get_connection()

        try:

            connection.execute(
                """
                DROP VIEW IF EXISTS current_dataset
                """
            )

            connection.execute(
                """
                DROP TABLE IF EXISTS current_dataset
                """
            )

            connection.execute(
                """
                DROP TABLE IF EXISTS dataset_metadata
                """
            )

        finally:

            connection.close()

    # -----------------------------------------------------
    # Remove physical Parquet file
    # -----------------------------------------------------

    if old_dataset_path:

        try:

            Path(
                old_dataset_path
            ).unlink(
                missing_ok=True
            )

        except Exception:

            pass

    # -----------------------------------------------------
    # Reset application state
    # -----------------------------------------------------

    current_summary = None

    current_filename = None

    current_file_type = None

    current_report = None

    current_dataset_path = None


# =========================================================
# INITIALIZE
# =========================================================

initialize_database()