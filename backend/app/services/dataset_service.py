"""
InsightIQ scalable dataset analysis service.

This module analyzes datasets stored in DuckDB.

Design goals:

- Avoid loading the entire dataset into the AI layer.
- Keep previews small.
- Calculate statistics with SQL.
- Work efficiently with large datasets.
- Keep memory usage predictable.
"""

from typing import Any

import duckdb

from app.services import storage


# =========================================================
# CONSTANTS
# =========================================================

PREVIEW_LIMIT = 20

TOP_VALUE_LIMIT = 10


# =========================================================
# SAFE VALUE CONVERSION
# =========================================================

def clean_value(value: Any) -> Any:
    """
    Convert DuckDB/Python values into JSON-friendly values.
    """

    if value is None:
        return None

    try:

        if hasattr(value, "item"):
            return value.item()

    except Exception:
        pass

    return value


# =========================================================
# GET BASIC INFORMATION
# =========================================================

def get_basic_statistics() -> dict[str, Any]:
    """
    Get basic dataset statistics directly from DuckDB.
    """

    connection = storage.get_connection()

    try:

        result = connection.execute(
            """
            SELECT
                COUNT(*) AS row_count
            FROM current_dataset
            """
        ).fetchone()

        row_count = int(
            result[0]
        ) if result else 0

        schema_rows = connection.execute(
            """
            DESCRIBE current_dataset
            """
        ).fetchall()

        columns = [
            row[0]
            for row in schema_rows
        ]

        return {
            "rows": row_count,
            "columns": len(columns),
            "column_names": columns,
        }

    finally:

        connection.close()


# =========================================================
# GET NUMERIC COLUMNS
# =========================================================

def get_numeric_columns() -> list[str]:
    """
    Identify numeric columns from DuckDB schema.
    """

    connection = storage.get_connection()

    try:

        schema = connection.execute(
            """
            DESCRIBE current_dataset
            """
        ).fetchall()

        numeric_types = {
            "INTEGER",
            "BIGINT",
            "SMALLINT",
            "TINYINT",
            "HUGEINT",
            "DOUBLE",
            "FLOAT",
            "DECIMAL",
            "REAL",
            "UBIGINT",
            "UINTEGER",
            "USMALLINT",
            "UTINYINT",
        }

        columns = []

        for row in schema:

            column_name = row[0]

            data_type = str(
                row[1]
            ).upper()

            base_type = (
                data_type
                .split("(")[0]
                .strip()
            )

            if base_type in numeric_types:

                columns.append(
                    column_name
                )

        return columns

    finally:

        connection.close()


# =========================================================
# GET CATEGORICAL COLUMNS
# =========================================================

def get_categorical_columns() -> list[str]:
    """
    Identify text/category columns.
    """

    connection = storage.get_connection()

    try:

        schema = connection.execute(
            """
            DESCRIBE current_dataset
            """
        ).fetchall()

        columns = []

        for row in schema:

            column_name = row[0]

            data_type = str(
                row[1]
            ).upper()

            if (
                "VARCHAR" in data_type
                or "TEXT" in data_type
                or "STRING" in data_type
            ):

                columns.append(
                    column_name
                )

        return columns

    finally:

        connection.close()


# =========================================================
# MISSING VALUES
# =========================================================

def get_missing_values(
    column_names: list[str],
) -> dict[str, int]:
    """
    Calculate missing values using SQL.

    This does not load the dataset into Pandas.
    """

    if not column_names:

        return {}

    connection = storage.get_connection()

    try:

        expressions = []

        for column in column_names:

            escaped_column = (
                '"' +
                column.replace(
                    '"',
                    '""',
                )
                + '"'
            )

            expressions.append(
                f"""
                SUM(
                    CASE
                        WHEN {escaped_column} IS NULL
                        THEN 1
                        ELSE 0
                    END
                ) AS "{column}"
                """
            )

        sql = f"""
        SELECT
            {", ".join(expressions)}
        FROM current_dataset
        """

        result = connection.execute(
            sql
        ).fetchone()

        if not result:

            return {
                column: 0
                for column in column_names
            }

        return {
            column: int(
                result[index] or 0
            )
            for index, column
            in enumerate(column_names)
        }

    finally:

        connection.close()


# =========================================================
# DUPLICATE ROWS
# =========================================================

def get_duplicate_rows() -> int:
    """
    Calculate duplicate rows.

    DuckDB performs the operation internally rather than
    loading the complete dataset into Python.
    """

    connection = storage.get_connection()

    try:

        result = connection.execute(
            """
            SELECT
                COUNT(*) -
                COUNT(
                    DISTINCT md5(
                        to_json(
                            struct_pack(*)
                        )
                    )
                )
            FROM current_dataset
            """
        ).fetchone()

        if not result:

            return 0

        return max(
            0,
            int(
                result[0] or 0
            ),
        )

    except Exception:

        # -------------------------------------------------
        # Fallback
        # -------------------------------------------------

        try:

            result = connection.execute(
                """
                SELECT COUNT(*) - COUNT(*)
                FROM (
                    SELECT *
                    FROM current_dataset
                    GROUP BY ALL
                )
                """
            ).fetchone()

            return int(
                result[0] or 0
            )

        except Exception:

            return 0

    finally:

        connection.close()


# =========================================================
# DATA PREVIEW
# =========================================================

def get_preview(
    limit: int = PREVIEW_LIMIT,
) -> list[dict[str, Any]]:
    """
    Return only a tiny preview.

    Never return the complete dataset.
    """

    limit = max(
        1,
        min(
            int(limit),
            PREVIEW_LIMIT,
        ),
    )

    connection = storage.get_connection()

    try:

        dataframe = connection.execute(
            f"""
            SELECT *
            FROM current_dataset
            LIMIT {limit}
            """
        ).fetchdf()

        records = (
            dataframe
            .where(
                dataframe.notna(),
                None,
            )
            .to_dict(
                orient="records"
            )
        )

        return [
            {
                key: clean_value(value)
                for key, value in row.items()
            }
            for row in records
        ]

    finally:

        connection.close()


# =========================================================
# NUMERIC STATISTICS
# =========================================================

def get_numeric_statistics(
    numeric_columns: list[str],
) -> dict[str, dict[str, Any]]:
    """
    Calculate compact statistics for numeric columns.
    """

    if not numeric_columns:

        return {}

    connection = storage.get_connection()

    try:

        statistics = {}

        for column in numeric_columns:

            escaped = (
                '"'
                + column.replace(
                    '"',
                    '""',
                )
                + '"'
            )

            sql = f"""
            SELECT
                COUNT({escaped}) AS count,
                MIN({escaped}) AS min,
                MAX({escaped}) AS max,
                AVG({escaped}) AS average,
                MEDIAN({escaped}) AS median,
                STDDEV_SAMP({escaped}) AS stddev
            FROM current_dataset
            """

            result = connection.execute(
                sql
            ).fetchone()

            if not result:
                continue

            statistics[column] = {
                "count": clean_value(
                    result[0]
                ),
                "min": clean_value(
                    result[1]
                ),
                "max": clean_value(
                    result[2]
                ),
                "average": clean_value(
                    result[3]
                ),
                "median": clean_value(
                    result[4]
                ),
                "stddev": clean_value(
                    result[5]
                ),
            }

        return statistics

    finally:

        connection.close()


# =========================================================
# CATEGORICAL STATISTICS
# =========================================================

def get_categorical_statistics(
    categorical_columns: list[str],
) -> dict[str, Any]:
    """
    Get the most common values for categorical columns.
    """

    if not categorical_columns:

        return {}

    connection = storage.get_connection()

    try:

        result = {}

        for column in categorical_columns:

            escaped = (
                '"'
                + column.replace(
                    '"',
                    '""',
                )
                + '"'
            )

            sql = f"""
            SELECT
                CAST({escaped} AS VARCHAR) AS value,
                COUNT(*) AS count
            FROM current_dataset
            WHERE {escaped} IS NOT NULL
            GROUP BY {escaped}
            ORDER BY count DESC
            LIMIT {TOP_VALUE_LIMIT}
            """

            rows = connection.execute(
                sql
            ).fetchall()

            result[column] = [
                {
                    "value": clean_value(
                        row[0]
                    ),
                    "count": int(
                        row[1]
                    ),
                }
                for row in rows
            ]

        return result

    finally:

        connection.close()


# =========================================================
# QUALITY SCORE
# =========================================================

def calculate_quality_score(
    total_rows: int,
    missing_values: dict[str, int],
    duplicate_rows: int,
) -> float:
    """
    Calculate a simple dataset quality score.

    This is intentionally deterministic and does not use AI.
    """

    if total_rows <= 0:

        return 0.0

    total_missing = sum(
        missing_values.values()
    )

    total_cells = (
        total_rows
        * max(
            1,
            len(missing_values),
        )
    )

    missing_ratio = (
        total_missing
        / total_cells
    )

    duplicate_ratio = (
        duplicate_rows
        / total_rows
    )

    penalty = (
        missing_ratio * 60
        + duplicate_ratio * 40
    )

    score = 100 - penalty

    return round(
        max(
            0,
            min(
                100,
                score,
            ),
        ),
        2,
    )


# =========================================================
# MAIN DATASET ANALYSIS
# =========================================================

def analyze_current_dataset(
    filename: str,
) -> dict[str, Any]:
    """
    Analyze the dataset currently stored in DuckDB.

    This is the scalable replacement for analyzing a huge
    DataFrame directly.
    """

    if not storage.has_dataset():

        raise ValueError(
            "No dataset is available."
        )

    # -----------------------------------------------------
    # Basic statistics
    # -----------------------------------------------------

    basic = get_basic_statistics()

    total_rows = basic[
        "rows"
    ]

    column_names = basic[
        "column_names"
    ]

    # -----------------------------------------------------
    # Column types
    # -----------------------------------------------------

    numeric_columns = (
        get_numeric_columns()
    )

    categorical_columns = (
        get_categorical_columns()
    )

    # -----------------------------------------------------
    # Missing values
    # -----------------------------------------------------

    missing_values = (
        get_missing_values(
            column_names
        )
    )

    # -----------------------------------------------------
    # Duplicates
    # -----------------------------------------------------

    duplicate_rows = (
        get_duplicate_rows()
    )

    # -----------------------------------------------------
    # Numeric statistics
    # -----------------------------------------------------

    numeric_statistics = (
        get_numeric_statistics(
            numeric_columns
        )
    )

    # -----------------------------------------------------
    # Categorical statistics
    # -----------------------------------------------------

    categorical_statistics = (
        get_categorical_statistics(
            categorical_columns
        )
    )

    # -----------------------------------------------------
    # Quality
    # -----------------------------------------------------

    quality_score = (
        calculate_quality_score(
            total_rows,
            missing_values,
            duplicate_rows,
        )
    )

    # -----------------------------------------------------
    # Preview
    # -----------------------------------------------------

    preview = get_preview()

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    return {
        "dataset_name": filename,
        "rows": total_rows,
        "columns": len(column_names),
        "column_names": column_names,

        "numeric_columns": numeric_columns,

        "categorical_columns": categorical_columns,

        "missing_values": missing_values,

        "duplicate_rows": duplicate_rows,

        "quality_score": quality_score,

        "preview": preview,

        "numeric_data": numeric_statistics,

        "categorical_data": (
            categorical_statistics
        ),
    }


# =========================================================
# LEGACY COMPATIBILITY FUNCTION
# =========================================================

def analyze_dataset(
    df,
    filename: str,
) -> dict[str, Any]:
    """
    Compatibility wrapper.

    Existing upload code may still call:

        analyze_dataset(df, filename)

    The DataFrame is first stored in DuckDB and then all
    analysis is performed against DuckDB.

    Future upload optimization will remove the need to
    materialize very large CSV files as a DataFrame at all.
    """

    if df is None:

        raise ValueError(
            "Dataset is empty."
        )

    if df.empty:

        raise ValueError(
            "Dataset is empty."
        )

    # -----------------------------------------------------
    # Store dataset
    # -----------------------------------------------------

    storage.store_dataset(
        df=df,
        summary={},
        filename=filename,
        file_type="dataset",
    )

    # -----------------------------------------------------
    # Analyze from DuckDB
    # -----------------------------------------------------

    summary = analyze_current_dataset(
        filename
    )

    # -----------------------------------------------------
    # Update stored summary
    # -----------------------------------------------------

    storage.current_summary = summary

    return summary