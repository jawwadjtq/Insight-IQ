"""
InsightIQ Scalable Dataset Analysis Engine.

This service performs deterministic analysis against the active
DuckDB dataset whenever possible.

Architecture:

    Upload
       ↓
    DuckDB
       ↓
    Deterministic SQL Analysis
       ↓
    Compact Results
       ↓
    AI Explanation

IMPORTANT:

The AI layer must never receive the complete dataset.

This module therefore:

- Uses DuckDB for large-dataset analysis.
- Keeps result sets compact.
- Uses SQL for aggregations.
- Uses Pandas only for legacy compatibility.
- Preserves the existing analysis intent API.
- Keeps returned JSON structures compatible with InsightIQ.
- Prevents accidental full-dataset loading during normal analysis.

Supported analysis types:

- Summary
- KPI
- Ranking
- Trend
- Anomaly
- Data Quality
- Comparison
- Customer Analysis
- Sales Analysis
- Financial Analysis
- Dashboard
- Recommendations
- Reports
"""

from __future__ import annotations

from typing import Any

import math
import re

import numpy as np
import pandas as pd

from app.services import storage


# =========================================================
# CONSTANTS
# =========================================================

PREVIEW_LIMIT = 20

TOP_VALUE_LIMIT = 10

TOP_RESULT_LIMIT = 10

ANOMALY_VALUE_LIMIT = 20


# =========================================================
# GENERAL HELPERS
# =========================================================


def _safe_value(value: Any) -> Any:
    """
    Convert Pandas / NumPy / DuckDB values into JSON-safe values.
    """

    if value is None:
        return None

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):

        if np.isnan(value):
            return None

        if np.isinf(value):
            return None

        return float(value)

    if isinstance(value, np.bool_):
        return bool(value)

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if isinstance(value, float):

        if math.isnan(value):
            return None

        if math.isinf(value):
            return None

        return round(value, 4)

    return value


def _safe_dataframe_records(
    df: pd.DataFrame,
) -> list[dict[str, Any]]:
    """
    Convert a DataFrame into JSON-safe records.

    This helper is intended for compact query results,
    not complete datasets.
    """

    if df is None or df.empty:
        return []

    records = df.to_dict(
        orient="records"
    )

    cleaned_records = []

    for record in records:

        cleaned_record = {}

        for key, value in record.items():

            cleaned_record[str(key)] = _safe_value(
                value
            )

        cleaned_records.append(
            cleaned_record
        )

    return cleaned_records


def _numeric_columns(
    df: pd.DataFrame,
) -> list[str]:
    """
    Return numeric columns from a DataFrame.

    Used only for legacy Pandas compatibility.
    """

    if df is None or df.empty:
        return []

    return [
        str(column)
        for column in df.select_dtypes(
            include=np.number
        ).columns
    ]


def _categorical_columns(
    df: pd.DataFrame,
) -> list[str]:
    """
    Return text/category columns from a DataFrame.

    Used only for legacy Pandas compatibility.
    """

    if df is None or df.empty:
        return []

    return [
        str(column)
        for column in df.select_dtypes(
            include=[
                "object",
                "category",
                "string",
            ]
        ).columns
    ]


# =========================================================
# DUCKDB HELPERS
# =========================================================


def _quote_identifier(
    identifier: str,
) -> str:
    """
    Safely quote a DuckDB identifier.

    Example:

        Customer Name

    becomes:

        "Customer Name"
    """

    return (
        '"'
        + str(identifier).replace(
            '"',
            '""',
        )
        + '"'
    )


def _dataset_available() -> bool:
    """
    Check whether the active DuckDB dataset exists.
    """

    try:
        return storage.has_dataset()

    except Exception:
        return False


def _get_schema() -> list[dict[str, str]]:
    """
    Get the active DuckDB dataset schema.
    """

    if not _dataset_available():
        return []

    return storage.get_schema()


def _get_column_names() -> list[str]:
    """
    Get active dataset column names.
    """

    if not _dataset_available():
        return []

    return storage.get_column_names()


def _get_numeric_columns_duckdb() -> list[str]:
    """
    Identify numeric columns directly from DuckDB schema.
    """

    schema = _get_schema()

    numeric_types = {
        "TINYINT",
        "SMALLINT",
        "INTEGER",
        "BIGINT",
        "HUGEINT",
        "UTINYINT",
        "USMALLINT",
        "UINTEGER",
        "UBIGINT",
        "FLOAT",
        "DOUBLE",
        "REAL",
        "DECIMAL",
    }

    columns = []

    for item in schema:

        column = item["column"]

        data_type = str(
            item["type"]
        ).upper()

        base_type = (
            data_type
            .split("(")[0]
            .strip()
        )

        if base_type in numeric_types:
            columns.append(column)

    return columns


def _get_categorical_columns_duckdb() -> list[str]:
    """
    Identify text/category columns directly from DuckDB schema.
    """

    schema = _get_schema()

    columns = []

    for item in schema:

        column = item["column"]

        data_type = str(
            item["type"]
        ).upper()

        if (
            "VARCHAR" in data_type
            or "TEXT" in data_type
            or "STRING" in data_type
        ):
            columns.append(column)

    return columns


def _run_query(
    sql: str,
) -> list[dict[str, Any]]:
    """
    Execute a compact query through the shared storage layer.
    """

    rows = storage.query(sql)

    cleaned = []

    for row in rows:

        cleaned.append(
            {
                str(key): _safe_value(value)
                for key, value in row.items()
            }
        )

    return cleaned


def _run_scalar(
    sql: str,
    default: Any = 0,
) -> Any:
    """
    Execute a query expected to return one value.
    """

    connection = storage.get_connection()

    try:

        result = connection.execute(
            sql
        ).fetchone()

        if not result:
            return default

        value = result[0]

        if value is None:
            return default

        return _safe_value(value)

    finally:

        connection.close()


# =========================================================
# COLUMN DETECTION
# =========================================================


def _find_column_from_names(
    columns: list[str],
    keywords: list[str],
) -> str | None:
    """
    Find the most likely column from a list of names.
    """

    if not columns:
        return None

    normalized = {
        str(column).lower().strip(): column
        for column in columns
    }

    # -----------------------------------------------------
    # Exact match
    # -----------------------------------------------------

    for keyword in keywords:

        keyword_lower = keyword.lower().strip()

        if keyword_lower in normalized:

            return normalized[
                keyword_lower
            ]

    # -----------------------------------------------------
    # Contains match
    # -----------------------------------------------------

    for keyword in keywords:

        keyword_lower = keyword.lower()

        for column in columns:

            column_lower = str(
                column
            ).lower()

            if keyword_lower in column_lower:
                return column

    return None


def _find_column(
    df: pd.DataFrame,
    keywords: list[str],
) -> str | None:
    """
    Find the most likely column in a DataFrame.

    Legacy compatibility helper.
    """

    if df is None or df.empty:
        return None

    columns = [
        str(column)
        for column in df.columns
    ]

    return _find_column_from_names(
        columns,
        keywords,
    )


def _find_date_column_from_schema(
    columns: list[str],
) -> str | None:
    """
    Detect a likely date/time column from column names.

    This avoids scanning the entire dataset.
    """

    date_keywords = [
        "date",
        "time",
        "month",
        "year",
        "created",
        "updated",
        "timestamp",
        "order_date",
        "transaction_date",
    ]

    return _find_column_from_names(
        columns,
        date_keywords,
    )


def _find_date_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Detect a likely date column in a Pandas DataFrame.

    Legacy compatibility helper.
    """

    if df is None or df.empty:
        return None

    columns = [
        str(column)
        for column in df.columns
    ]

    keyword_match = _find_date_column_from_schema(
        columns
    )

    if keyword_match:

        converted = pd.to_datetime(
            df[keyword_match],
            errors="coerce",
        )

        if (
            not converted.empty
            and converted.notna().mean() >= 0.5
        ):
            return keyword_match

    for column in columns:

        converted = pd.to_datetime(
            df[column],
            errors="coerce",
        )

        if (
            not converted.empty
            and converted.notna().mean() >= 0.8
        ):
            return column

    return None


# =========================================================
# SUMMARY
# =========================================================


def analyze_summary(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Generate a deterministic dataset summary.

    DuckDB is preferred.

    Pandas is used only when a DataFrame is explicitly supplied
    and no active DuckDB dataset is available.
    """

    if _dataset_available():

        basic = storage.get_connection()

        try:

            row_result = basic.execute(
                """
                SELECT COUNT(*)
                FROM current_dataset
                """
            ).fetchone()

            rows = int(
                row_result[0]
            ) if row_result else 0

        finally:

            basic.close()

        columns = _get_column_names()

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        categorical_columns = (
            _get_categorical_columns_duckdb()
        )

        missing_expressions = []

        for column in columns:

            quoted = _quote_identifier(
                column
            )

            missing_expressions.append(
                f"""
                SUM(
                    CASE
                        WHEN {quoted} IS NULL
                        THEN 1
                        ELSE 0
                    END
                )
                """
            )

        missing_total = 0

        if missing_expressions:

            missing_result = _run_scalar(
                f"""
                SELECT
                    {" + ".join(missing_expressions)}
                FROM current_dataset
                """,
                0,
            )

            missing_total = int(
                missing_result or 0
            )

        total_cells = (
            rows * len(columns)
        )

        missing_percentage = (
            round(
                (
                    missing_total
                    / total_cells
                ) * 100,
                2,
            )
            if total_cells > 0
            else 0
        )

        duplicate_rows = _calculate_duplicate_rows()

        quality_score = max(
            0,
            round(
                100
                - missing_percentage
                - (
                    duplicate_rows
                    / max(rows, 1)
                    * 10
                ),
                2,
            ),
        )

        preview = _get_duckdb_preview(
            10
        )

        return {
            "analysis_type": "summary",
            "success": True,
            "rows": rows,
            "columns": len(columns),
            "column_names": columns,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "missing_values": missing_total,
            "missing_percentage": missing_percentage,
            "duplicate_rows": duplicate_rows,
            "quality_score": quality_score,
            "preview": preview,
        }

    # -----------------------------------------------------
    # Legacy Pandas fallback
    # -----------------------------------------------------

    if df is None or df.empty:

        return {
            "analysis_type": "summary",
            "success": False,
            "message": "Dataset is empty.",
        }

    numeric_columns = _numeric_columns(
        df
    )

    categorical_columns = _categorical_columns(
        df
    )

    missing_values = int(
        df.isna().sum().sum()
    )

    duplicate_rows = int(
        df.duplicated().sum()
    )

    total_cells = (
        df.shape[0] * df.shape[1]
    )

    missing_percentage = (
        round(
            (
                missing_values
                / total_cells
            )
            * 100,
            2,
        )
        if total_cells > 0
        else 0
    )

    quality_score = max(
        0,
        round(
            100
            - missing_percentage
            - (
                duplicate_rows
                / max(len(df), 1)
                * 10
            ),
            2,
        ),
    )

    return {
        "analysis_type": "summary",
        "success": True,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": [
            str(column)
            for column in df.columns
        ],
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "missing_values": missing_values,
        "missing_percentage": missing_percentage,
        "duplicate_rows": duplicate_rows,
        "quality_score": quality_score,
        "preview": _safe_dataframe_records(
            df.head(10)
        ),
    }


# =========================================================
# DUPLICATES
# =========================================================


def _calculate_duplicate_rows() -> int:
    """
    Calculate duplicate rows using DuckDB.

    The dataset itself is never transferred into Python.
    """

    if not _dataset_available():
        return 0

    connection = storage.get_connection()

    try:

        try:

            result = connection.execute(
                """
                SELECT
                    COUNT(*)
                    -
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

            if result:

                return max(
                    0,
                    int(
                        result[0] or 0
                    ),
                )

        except Exception:
            pass

        # -------------------------------------------------
        # Conservative fallback
        # -------------------------------------------------

        try:

            result = connection.execute(
                """
                SELECT
                    COUNT(*)
                    -
                    COUNT(*)
                FROM (
                    SELECT *
                    FROM current_dataset
                    GROUP BY ALL
                )
                """
            ).fetchone()

            if result:
                return int(
                    result[0] or 0
                )

        except Exception:
            pass

        return 0

    finally:

        connection.close()


# =========================================================
# PREVIEW
# =========================================================


def _get_duckdb_preview(
    limit: int = 10,
) -> list[dict[str, Any]]:
    """
    Return a small dataset preview.
    """

    limit = max(
        1,
        min(
            int(limit),
            PREVIEW_LIMIT,
        ),
    )

    return _run_query(
        f"""
        SELECT *
        FROM current_dataset
        LIMIT {limit}
        """
    )


# =========================================================
# KPI ANALYSIS
# =========================================================


def analyze_kpis(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Calculate useful KPIs.

    Uses one DuckDB aggregation query for all numeric columns.
    """

    if _dataset_available():

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        if not numeric_columns:

            return {
                "analysis_type": "kpi",
                "success": False,
                "message": "No numeric columns were found.",
            }

        expressions = []

        for column in numeric_columns:

            quoted = _quote_identifier(
                column
            )

            expressions.extend(
                [
                    f'COUNT({quoted}) AS "{column}__count"',
                    f'SUM({quoted}) AS "{column}__sum"',
                    f'AVG({quoted}) AS "{column}__mean"',
                    f'MEDIAN({quoted}) AS "{column}__median"',
                    f'MIN({quoted}) AS "{column}__minimum"',
                    f'MAX({quoted}) AS "{column}__maximum"',
                    f'STDDEV_SAMP({quoted}) AS "{column}__stddev"',
                ]
            )

        rows = _run_query(
            f"""
            SELECT
                {", ".join(expressions)}
            FROM current_dataset
            """
        )

        result_row = (
            rows[0]
            if rows
            else {}
        )

        kpis = {}

        for column in numeric_columns:

            kpis[column] = {
                "count": result_row.get(
                    f"{column}__count"
                ),
                "sum": result_row.get(
                    f"{column}__sum"
                ),
                "mean": result_row.get(
                    f"{column}__mean"
                ),
                "median": result_row.get(
                    f"{column}__median"
                ),
                "minimum": result_row.get(
                    f"{column}__minimum"
                ),
                "maximum": result_row.get(
                    f"{column}__maximum"
                ),
                "standard_deviation": result_row.get(
                    f"{column}__stddev"
                ),
            }

        return {
            "analysis_type": "kpi",
            "success": True,
            "numeric_columns": numeric_columns,
            "kpis": kpis,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "kpi",
            "success": False,
            "message": "Dataset is empty.",
        }

    numeric_columns = _numeric_columns(
        df
    )

    if not numeric_columns:

        return {
            "analysis_type": "kpi",
            "success": False,
            "message": "No numeric columns were found.",
        }

    kpis = {}

    for column in numeric_columns:

        series = pd.to_numeric(
            df[column],
            errors="coerce",
        ).dropna()

        if series.empty:
            continue

        kpis[column] = {
            "count": int(series.count()),
            "sum": _safe_value(series.sum()),
            "mean": _safe_value(series.mean()),
            "median": _safe_value(series.median()),
            "minimum": _safe_value(series.min()),
            "maximum": _safe_value(series.max()),
            "standard_deviation": _safe_value(
                series.std()
            ),
        }

    return {
        "analysis_type": "kpi",
        "success": True,
        "numeric_columns": numeric_columns,
        "kpis": kpis,
    }


# =========================================================
# RANKING
# =========================================================


def analyze_ranking(
    df: pd.DataFrame | None = None,
    top_n: int = TOP_RESULT_LIMIT,
) -> dict[str, Any]:
    """
    Find top and bottom entities.

    Uses DuckDB GROUP BY and ORDER BY for scalable ranking.
    """

    top_n = max(
        1,
        min(
            int(top_n),
            100,
        ),
    )

    if _dataset_available():

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        categorical_columns = (
            _get_categorical_columns_duckdb()
        )

        if not numeric_columns:

            return {
                "analysis_type": "ranking",
                "success": False,
                "message": "No numeric column available for ranking.",
            }

        metric_column = _find_column_from_names(
            numeric_columns,
            [
                "revenue",
                "sales",
                "amount",
                "total",
                "profit",
                "value",
                "income",
            ],
        )

        if metric_column is None:
            metric_column = numeric_columns[0]

        entity_column = _find_column_from_names(
            categorical_columns,
            [
                "customer",
                "customer_name",
                "client",
                "product",
                "product_name",
                "employee",
                "employee_name",
                "region",
                "category",
                "name",
            ],
        )

        if entity_column is None and categorical_columns:
            entity_column = categorical_columns[0]

        metric = _quote_identifier(
            metric_column
        )

        if entity_column:

            entity = _quote_identifier(
                entity_column
            )

            top = _run_query(
                f"""
                SELECT
                    {entity} AS entity,
                    SUM({metric}) AS value
                FROM current_dataset
                WHERE {metric} IS NOT NULL
                GROUP BY {entity}
                ORDER BY value DESC
                LIMIT {top_n}
                """
            )

            bottom = _run_query(
                f"""
                SELECT
                    {entity} AS entity,
                    SUM({metric}) AS value
                FROM current_dataset
                WHERE {metric} IS NOT NULL
                GROUP BY {entity}
                ORDER BY value ASC
                LIMIT {top_n}
                """
            )

        else:

            top = _run_query(
                f"""
                SELECT
                    ROW_NUMBER() OVER (
                        ORDER BY {metric} DESC
                    ) AS entity,
                    {metric} AS value
                FROM current_dataset
                WHERE {metric} IS NOT NULL
                LIMIT {top_n}
                """
            )

            bottom = _run_query(
                f"""
                SELECT
                    ROW_NUMBER() OVER (
                        ORDER BY {metric} ASC
                    ) AS entity,
                    {metric} AS value
                FROM current_dataset
                WHERE {metric} IS NOT NULL
                LIMIT {top_n}
                """
            )

            entity_column = "row"

        return {
            "analysis_type": "ranking",
            "success": True,
            "entity_column": str(
                entity_column
            ),
            "metric_column": str(
                metric_column
            ),
            "top_n": top_n,
            "top": top,
            "bottom": bottom,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "ranking",
            "success": False,
            "message": "Dataset is empty.",
        }

    numeric_columns = _numeric_columns(
        df
    )

    categorical_columns = _categorical_columns(
        df
    )

    if not numeric_columns:

        return {
            "analysis_type": "ranking",
            "success": False,
            "message": "No numeric column available for ranking.",
        }

    metric_column = _find_column(
        df,
        [
            "revenue",
            "sales",
            "amount",
            "total",
            "profit",
            "value",
            "income",
        ],
    )

    if metric_column is None:
        metric_column = numeric_columns[0]

    entity_column = _find_column(
        df,
        [
            "customer",
            "customer_name",
            "client",
            "product",
            "product_name",
            "employee",
            "employee_name",
            "region",
            "category",
            "name",
        ],
    )

    if entity_column is None and categorical_columns:
        entity_column = categorical_columns[0]

    if entity_column is None:

        ranking_df = df[
            [metric_column]
        ].copy()

        ranking_df["row"] = (
            ranking_df.index + 1
        )

        entity_column = "row"

    else:

        ranking_df = df[
            [
                entity_column,
                metric_column,
            ]
        ].copy()

    ranking_df[metric_column] = pd.to_numeric(
        ranking_df[metric_column],
        errors="coerce",
    )

    ranking_df = ranking_df.dropna(
        subset=[metric_column]
    )

    grouped = (
        ranking_df
        .groupby(
            entity_column,
            dropna=False,
        )[metric_column]
        .sum()
        .sort_values(
            ascending=False
        )
    )

    top = grouped.head(top_n)

    bottom = grouped.tail(
        top_n
    ).sort_values(
        ascending=True
    )

    return {
        "analysis_type": "ranking",
        "success": True,
        "entity_column": str(entity_column),
        "metric_column": str(metric_column),
        "top_n": top_n,
        "top": [
            {
                "entity": _safe_value(entity),
                "value": _safe_value(value),
            }
            for entity, value in top.items()
        ],
        "bottom": [
            {
                "entity": _safe_value(entity),
                "value": _safe_value(value),
            }
            for entity, value in bottom.items()
        ],
    }


# =========================================================
# TREND ANALYSIS
# =========================================================


def analyze_trend(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Analyze numeric trends over time.

    DuckDB performs the aggregation whenever the active
    dataset is available.
    """

    if _dataset_available():

        columns = _get_column_names()

        date_column = _find_date_column_from_schema(
            columns
        )

        if date_column is None:

            return {
                "analysis_type": "trend",
                "success": False,
                "message": "No suitable date column was found.",
            }

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        if not numeric_columns:

            return {
                "analysis_type": "trend",
                "success": False,
                "message": "No numeric column was found for trend analysis.",
            }

        metric_column = _find_column_from_names(
            numeric_columns,
            [
                "revenue",
                "sales",
                "amount",
                "profit",
                "value",
                "total",
            ],
        )

        if metric_column is None:
            metric_column = numeric_columns[0]

        date = _quote_identifier(
            date_column
        )

        metric = _quote_identifier(
            metric_column
        )

        rows = _run_query(
            f"""
            SELECT
                DATE_TRUNC(
                    'month',
                    TRY_CAST({date} AS TIMESTAMP)
                ) AS period,
                SUM({metric}) AS value
            FROM current_dataset
            WHERE
                TRY_CAST({date} AS TIMESTAMP) IS NOT NULL
                AND {metric} IS NOT NULL
            GROUP BY period
            ORDER BY period
            """
        )

        records = []

        previous_value = None

        for row in rows:

            value = row.get(
                "value"
            )

            growth = None

            if (
                previous_value is not None
                and previous_value != 0
                and value is not None
            ):

                growth = (
                    (
                        value
                        - previous_value
                    )
                    / abs(previous_value)
                ) * 100

            period = row.get(
                "period"
            )

            records.append(
                {
                    "period": _safe_value(
                        period
                    ),
                    "value": _safe_value(
                        value
                    ),
                    "growth_percentage": _safe_value(
                        growth
                    ),
                }
            )

            previous_value = value

        return {
            "analysis_type": "trend",
            "success": True,
            "date_column": str(
                date_column
            ),
            "metric_column": str(
                metric_column
            ),
            "period": "monthly",
            "data": records,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "trend",
            "success": False,
            "message": "Dataset is empty.",
        }

    date_column = _find_date_column(
        df
    )

    if date_column is None:

        return {
            "analysis_type": "trend",
            "success": False,
            "message": "No suitable date column was found.",
        }

    numeric_columns = _numeric_columns(
        df
    )

    if not numeric_columns:

        return {
            "analysis_type": "trend",
            "success": False,
            "message": "No numeric column was found for trend analysis.",
        }

    metric_column = _find_column(
        df,
        [
            "revenue",
            "sales",
            "amount",
            "profit",
            "value",
            "total",
        ],
    )

    if metric_column is None:
        metric_column = numeric_columns[0]

    trend_df = df[
        [
            date_column,
            metric_column,
        ]
    ].copy()

    trend_df[date_column] = pd.to_datetime(
        trend_df[date_column],
        errors="coerce",
    )

    trend_df[metric_column] = pd.to_numeric(
        trend_df[metric_column],
        errors="coerce",
    )

    trend_df = trend_df.dropna()

    if trend_df.empty:

        return {
            "analysis_type": "trend",
            "success": False,
            "message": "No valid date and metric values were found.",
        }

    trend_df["period"] = (
        trend_df[date_column]
        .dt.to_period("M")
    )

    monthly = (
        trend_df
        .groupby("period")[metric_column]
        .sum()
        .sort_index()
    )

    records = []

    previous_value = None

    for period, value in monthly.items():

        growth = None

        if (
            previous_value is not None
            and previous_value != 0
        ):

            growth = (
                (
                    value
                    - previous_value
                )
                / abs(previous_value)
            ) * 100

        records.append(
            {
                "period": str(period),
                "value": _safe_value(value),
                "growth_percentage": _safe_value(
                    growth
                ),
            }
        )

        previous_value = value

    return {
        "analysis_type": "trend",
        "success": True,
        "date_column": str(date_column),
        "metric_column": str(metric_column),
        "period": "monthly",
        "data": records,
    }


# =========================================================
# ANOMALY ANALYSIS
# =========================================================


def analyze_anomalies(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Detect statistical outliers using the IQR method.

    DuckDB calculates quartiles and anomaly counts without
    transferring the complete dataset into Python.
    """

    if _dataset_available():

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        if not numeric_columns:

            return {
                "analysis_type": "anomaly",
                "success": False,
                "message": "No numeric columns were found.",
            }

        anomalies = {}

        for column in numeric_columns:

            quoted = _quote_identifier(
                column
            )

            rows = _run_query(
                f"""
                WITH stats AS (
                    SELECT
                        QUANTILE_CONT(
                            {quoted},
                            0.25
                        ) AS q1,
                        QUANTILE_CONT(
                            {quoted},
                            0.75
                        ) AS q3
                    FROM current_dataset
                    WHERE {quoted} IS NOT NULL
                )
                SELECT
                    COUNT(*) FILTER (
                        WHERE
                            {quoted}
                            <
                            (
                                q1
                                -
                                1.5 * (q3 - q1)
                            )
                            OR
                            {quoted}
                            >
                            (
                                q3
                                +
                                1.5 * (q3 - q1)
                            )
                    ) AS anomaly_count,

                    COUNT({quoted}) AS valid_count,

                    q1,
                    q3,

                    q1 - 1.5 * (q3 - q1)
                        AS lower_bound,

                    q3 + 1.5 * (q3 - q1)
                        AS upper_bound

                FROM current_dataset,
                     stats
                """
            )

            if not rows:
                continue

            result = rows[0]

            anomaly_count = int(
                result.get(
                    "anomaly_count"
                )
                or 0
            )

            valid_count = int(
                result.get(
                    "valid_count"
                )
                or 0
            )

            anomaly_values = _run_query(
                f"""
                WITH stats AS (
                    SELECT
                        QUANTILE_CONT(
                            {quoted},
                            0.25
                        ) AS q1,
                        QUANTILE_CONT(
                            {quoted},
                            0.75
                        ) AS q3
                    FROM current_dataset
                    WHERE {quoted} IS NOT NULL
                )
                SELECT
                    {quoted} AS value
                FROM current_dataset,
                     stats
                WHERE
                    {quoted}
                    <
                    (
                        q1
                        -
                        1.5 * (q3 - q1)
                    )
                    OR
                    {quoted}
                    >
                    (
                        q3
                        +
                        1.5 * (q3 - q1)
                    )
                ORDER BY ABS(
                    {quoted}
                ) DESC
                LIMIT {ANOMALY_VALUE_LIMIT}
                """
            )

            percentage = (
                (
                    anomaly_count
                    / valid_count
                ) * 100
                if valid_count > 0
                else 0
            )

            anomalies[column] = {
                "count": anomaly_count,
                "percentage": _safe_value(
                    percentage
                ),
                "lower_bound": result.get(
                    "lower_bound"
                ),
                "upper_bound": result.get(
                    "upper_bound"
                ),
                "values": [
                    item.get("value")
                    for item in anomaly_values
                ],
            }

        return {
            "analysis_type": "anomaly",
            "success": True,
            "method": "IQR",
            "anomalies": anomalies,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "anomaly",
            "success": False,
            "message": "Dataset is empty.",
        }

    numeric_columns = _numeric_columns(
        df
    )

    if not numeric_columns:

        return {
            "analysis_type": "anomaly",
            "success": False,
            "message": "No numeric columns were found.",
        }

    anomalies = {}

    for column in numeric_columns:

        series = pd.to_numeric(
            df[column],
            errors="coerce",
        ).dropna()

        if len(series) < 4:
            continue

        q1 = series.quantile(0.25)

        q3 = series.quantile(0.75)

        iqr = q3 - q1

        lower_bound = q1 - 1.5 * iqr

        upper_bound = q3 + 1.5 * iqr

        mask = (
            (series < lower_bound)
            | (series > upper_bound)
        )

        anomaly_values = series[mask]

        anomalies[column] = {
            "count": int(
                len(anomaly_values)
            ),
            "percentage": _safe_value(
                (
                    len(anomaly_values)
                    / len(series)
                ) * 100
            ),
            "lower_bound": _safe_value(
                lower_bound
            ),
            "upper_bound": _safe_value(
                upper_bound
            ),
            "values": [
                _safe_value(value)
                for value
                in anomaly_values.head(
                    ANOMALY_VALUE_LIMIT
                )
            ],
        }

    return {
        "analysis_type": "anomaly",
        "success": True,
        "method": "IQR",
        "anomalies": anomalies,
    }


# =========================================================
# DATA QUALITY
# =========================================================


def analyze_data_quality(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Analyze missing values, duplicates and constant columns.

    Uses compact DuckDB aggregations.
    """

    if _dataset_available():

        columns = _get_column_names()

        row_count = int(
            _run_scalar(
                """
                SELECT COUNT(*)
                FROM current_dataset
                """,
                0,
            )
            or 0
        )

        if not columns:

            return {
                "analysis_type": "data_quality",
                "success": False,
                "message": "Dataset contains no columns.",
            }

        missing_expressions = []

        for column in columns:

            quoted = _quote_identifier(
                column
            )

            missing_expressions.append(
                f"""
                SUM(
                    CASE
                        WHEN {quoted} IS NULL
                        THEN 1
                        ELSE 0
                    END
                ) AS {_quote_identifier(column)}
                """
            )

        missing_rows = _run_query(
            f"""
            SELECT
                {", ".join(missing_expressions)}
            FROM current_dataset
            """
        )

        missing_values = (
            missing_rows[0]
            if missing_rows
            else {}
        )

        missing_by_column = {}

        missing_total = 0

        for column in columns:

            count = int(
                missing_values.get(
                    column
                )
                or 0
            )

            missing_total += count

            missing_percentage = (
                (
                    count
                    / max(
                        row_count,
                        1,
                    )
                )
                * 100
            )

            missing_by_column[column] = {
                "count": count,
                "percentage": round(
                    missing_percentage,
                    2,
                ),
            }

        duplicate_rows = (
            _calculate_duplicate_rows()
        )

        constant_columns = []

        for column in columns:

            quoted = _quote_identifier(
                column
            )

            result = _run_scalar(
                f"""
                SELECT COUNT(DISTINCT {quoted})
                FROM current_dataset
                """,
                0,
            )

            if int(result or 0) <= 1:
                constant_columns.append(
                    column
                )

        total_cells = (
            row_count
            * len(columns)
        )

        missing_percentage = (
            (
                missing_total
                / max(
                    total_cells,
                    1,
                )
            )
            * 100
        )

        quality_score = max(
            0,
            round(
                100
                - missing_percentage
                - (
                    duplicate_rows
                    / max(
                        row_count,
                        1,
                    )
                    * 10
                ),
                2,
            ),
        )

        return {
            "analysis_type": "data_quality",
            "success": True,
            "quality_score": quality_score,
            "missing_total": missing_total,
            "missing_percentage": round(
                missing_percentage,
                2,
            ),
            "missing_by_column": missing_by_column,
            "duplicate_rows": duplicate_rows,
            "constant_columns": constant_columns,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "data_quality",
            "success": False,
            "message": "Dataset is empty.",
        }

    missing_by_column = {}

    for column in df.columns:

        missing_count = int(
            df[column].isna().sum()
        )

        missing_percentage = (
            missing_count
            / max(len(df), 1)
        ) * 100

        missing_by_column[
            str(column)
        ] = {
            "count": missing_count,
            "percentage": round(
                missing_percentage,
                2,
            ),
        }

    duplicate_rows = int(
        df.duplicated().sum()
    )

    constant_columns = []

    for column in df.columns:

        if df[column].nunique(
            dropna=False
        ) <= 1:

            constant_columns.append(
                str(column)
            )

    total_cells = (
        len(df)
        * len(df.columns)
    )

    missing_total = int(
        df.isna().sum().sum()
    )

    missing_percentage = (
        missing_total
        / max(total_cells, 1)
    ) * 100

    quality_score = max(
        0,
        round(
            100
            - missing_percentage
            - (
                duplicate_rows
                / max(len(df), 1)
                * 10
            ),
            2,
        ),
    )

    return {
        "analysis_type": "data_quality",
        "success": True,
        "quality_score": quality_score,
        "missing_total": missing_total,
        "missing_percentage": round(
            missing_percentage,
            2,
        ),
        "missing_by_column": missing_by_column,
        "duplicate_rows": duplicate_rows,
        "constant_columns": constant_columns,
    }


# =========================================================
# COMPARISON
# =========================================================


def analyze_comparison(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Compare categorical groups using numeric metrics.
    """

    if _dataset_available():

        categorical_columns = (
            _get_categorical_columns_duckdb()
        )

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        if not categorical_columns:

            return {
                "analysis_type": "comparison",
                "success": False,
                "message": "No categorical column was found.",
            }

        if not numeric_columns:

            return {
                "analysis_type": "comparison",
                "success": False,
                "message": "No numeric column was found.",
            }

        group_column = _find_column_from_names(
            categorical_columns,
            [
                "region",
                "category",
                "product",
                "customer",
                "segment",
                "department",
                "country",
                "city",
            ],
        )

        if group_column is None:
            group_column = categorical_columns[0]

        metric_column = _find_column_from_names(
            numeric_columns,
            [
                "revenue",
                "sales",
                "amount",
                "profit",
                "value",
                "total",
            ],
        )

        if metric_column is None:
            metric_column = numeric_columns[0]

        group = _quote_identifier(
            group_column
        )

        metric = _quote_identifier(
            metric_column
        )

        groups = _run_query(
            f"""
            SELECT
                {group} AS "{group_column}",
                COUNT(*) AS count,
                SUM({metric}) AS sum,
                AVG({metric}) AS mean,
                MIN({metric}) AS min,
                MAX({metric}) AS max
            FROM current_dataset
            WHERE {metric} IS NOT NULL
            GROUP BY {group}
            ORDER BY sum DESC
            LIMIT 100
            """
        )

        return {
            "analysis_type": "comparison",
            "success": True,
            "group_column": str(
                group_column
            ),
            "metric_column": str(
                metric_column
            ),
            "groups": groups,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "comparison",
            "success": False,
            "message": "Dataset is empty.",
        }

    categorical_columns = _categorical_columns(
        df
    )

    numeric_columns = _numeric_columns(
        df
    )

    if not categorical_columns:

        return {
            "analysis_type": "comparison",
            "success": False,
            "message": "No categorical column was found.",
        }

    if not numeric_columns:

        return {
            "analysis_type": "comparison",
            "success": False,
            "message": "No numeric column was found.",
        }

    group_column = _find_column(
        df,
        [
            "region",
            "category",
            "product",
            "customer",
            "segment",
            "department",
            "country",
            "city",
        ],
    )

    if group_column is None:
        group_column = categorical_columns[0]

    metric_column = _find_column(
        df,
        [
            "revenue",
            "sales",
            "amount",
            "profit",
            "value",
            "total",
        ],
    )

    if metric_column is None:
        metric_column = numeric_columns[0]

    comparison = (
        df.groupby(
            group_column,
            dropna=False,
        )[metric_column]
        .agg(
            [
                "count",
                "sum",
                "mean",
                "min",
                "max",
            ]
        )
        .sort_values(
            "sum",
            ascending=False,
        )
    )

    return {
        "analysis_type": "comparison",
        "success": True,
        "group_column": str(group_column),
        "metric_column": str(metric_column),
        "groups": _safe_dataframe_records(
            comparison.reset_index()
        ),
    }


# =========================================================
# CUSTOMER ANALYSIS
# =========================================================


def analyze_customers(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Analyze customer-level performance.
    """

    if _dataset_available():

        customer_columns = (
            _get_categorical_columns_duckdb()
        )

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        customer_column = _find_column_from_names(
            customer_columns,
            [
                "customer",
                "customer_name",
                "client",
                "client_name",
                "customer_id",
                "client_id",
            ],
        )

        if customer_column is None:

            return {
                "analysis_type": "customer_analysis",
                "success": False,
                "message": "No customer column was found.",
            }

        if not numeric_columns:

            return {
                "analysis_type": "customer_analysis",
                "success": False,
                "message": "No numeric metric was found.",
            }

        metric_column = _find_column_from_names(
            numeric_columns,
            [
                "revenue",
                "sales",
                "amount",
                "profit",
                "value",
                "total",
            ],
        )

        if metric_column is None:
            metric_column = numeric_columns[0]

        customer = _quote_identifier(
            customer_column
        )

        metric = _quote_identifier(
            metric_column
        )

        top_customers = _run_query(
            f"""
            SELECT
                {customer} AS "{customer_column}",
                COUNT(*) AS count,
                SUM({metric}) AS sum,
                AVG({metric}) AS mean
            FROM current_dataset
            WHERE {metric} IS NOT NULL
            GROUP BY {customer}
            ORDER BY sum DESC
            LIMIT {TOP_RESULT_LIMIT}
            """
        )

        unique_customers = int(
            _run_scalar(
                f"""
                SELECT COUNT(DISTINCT {customer})
                FROM current_dataset
                WHERE {customer} IS NOT NULL
                """,
                0,
            )
            or 0
        )

        return {
            "analysis_type": "customer_analysis",
            "success": True,
            "customer_column": str(
                customer_column
            ),
            "metric_column": str(
                metric_column
            ),
            "unique_customers": unique_customers,
            "top_customers": top_customers,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "customer_analysis",
            "success": False,
            "message": "Dataset is empty.",
        }

    customer_column = _find_column(
        df,
        [
            "customer",
            "customer_name",
            "client",
            "client_name",
            "customer_id",
            "client_id",
        ],
    )

    if customer_column is None:

        return {
            "analysis_type": "customer_analysis",
            "success": False,
            "message": "No customer column was found.",
        }

    numeric_columns = _numeric_columns(
        df
    )

    if not numeric_columns:

        return {
            "analysis_type": "customer_analysis",
            "success": False,
            "message": "No numeric metric was found.",
        }

    metric_column = _find_column(
        df,
        [
            "revenue",
            "sales",
            "amount",
            "profit",
            "value",
            "total",
        ],
    )

    if metric_column is None:
        metric_column = numeric_columns[0]

    customer_summary = (
        df.groupby(
            customer_column,
            dropna=False,
        )[metric_column]
        .agg(
            [
                "count",
                "sum",
                "mean",
            ]
        )
        .sort_values(
            "sum",
            ascending=False,
        )
    )

    return {
        "analysis_type": "customer_analysis",
        "success": True,
        "customer_column": str(
            customer_column
        ),
        "metric_column": str(
            metric_column
        ),
        "unique_customers": int(
            df[customer_column]
            .nunique(
                dropna=True
            )
        ),
        "top_customers": _safe_dataframe_records(
            customer_summary
            .head(10)
            .reset_index()
        ),
    }


# =========================================================
# SALES ANALYSIS
# =========================================================


def analyze_sales(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Analyze sales-oriented datasets.
    """

    if _dataset_available():

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        categorical_columns = (
            _get_categorical_columns_duckdb()
        )

        revenue_column = _find_column_from_names(
            numeric_columns,
            [
                "revenue",
                "sales",
                "sales_amount",
                "sales_value",
                "amount",
                "total_sales",
                "total",
            ],
        )

        quantity_column = _find_column_from_names(
            numeric_columns,
            [
                "quantity",
                "qty",
                "units",
                "units_sold",
            ],
        )

        product_column = _find_column_from_names(
            categorical_columns,
            [
                "product",
                "product_name",
                "item",
                "item_name",
            ],
        )

        result = {
            "analysis_type": "sales_analysis",
            "success": True,
        }

        if revenue_column:

            revenue = _quote_identifier(
                revenue_column
            )

            row = _run_query(
                f"""
                SELECT
                    SUM({revenue}) AS total_sales,
                    AVG({revenue}) AS average_sale,
                    MAX({revenue}) AS maximum_sale
                FROM current_dataset
                WHERE {revenue} IS NOT NULL
                """
            )

            if row:

                result[
                    "revenue_column"
                ] = revenue_column

                result[
                    "total_sales"
                ] = row[0].get(
                    "total_sales"
                )

                result[
                    "average_sale"
                ] = row[0].get(
                    "average_sale"
                )

                result[
                    "maximum_sale"
                ] = row[0].get(
                    "maximum_sale"
                )

        if quantity_column:

            quantity = _quote_identifier(
                quantity_column
            )

            result[
                "quantity_column"
            ] = quantity_column

            result[
                "total_quantity"
            ] = _run_scalar(
                f"""
                SELECT SUM({quantity})
                FROM current_dataset
                WHERE {quantity} IS NOT NULL
                """,
                0,
            )

        if (
            product_column
            and revenue_column
        ):

            product = _quote_identifier(
                product_column
            )

            revenue = _quote_identifier(
                revenue_column
            )

            result[
                "top_products"
            ] = _run_query(
                f"""
                SELECT
                    {product} AS product,
                    SUM({revenue}) AS sales
                FROM current_dataset
                WHERE {revenue} IS NOT NULL
                GROUP BY {product}
                ORDER BY sales DESC
                LIMIT {TOP_RESULT_LIMIT}
                """
            )

        return result

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "sales_analysis",
            "success": False,
            "message": "Dataset is empty.",
        }

    revenue_column = _find_column(
        df,
        [
            "revenue",
            "sales",
            "sales_amount",
            "sales_value",
            "amount",
            "total_sales",
            "total",
        ],
    )

    quantity_column = _find_column(
        df,
        [
            "quantity",
            "qty",
            "units",
            "units_sold",
        ],
    )

    product_column = _find_column(
        df,
        [
            "product",
            "product_name",
            "item",
            "item_name",
        ],
    )

    result = {
        "analysis_type": "sales_analysis",
        "success": True,
    }

    if revenue_column:

        revenue = pd.to_numeric(
            df[revenue_column],
            errors="coerce",
        ).dropna()

        result["revenue_column"] = str(
            revenue_column
        )

        result["total_sales"] = _safe_value(
            revenue.sum()
        )

        result["average_sale"] = _safe_value(
            revenue.mean()
        )

        result["maximum_sale"] = _safe_value(
            revenue.max()
        )

    if quantity_column:

        quantity = pd.to_numeric(
            df[quantity_column],
            errors="coerce",
        ).dropna()

        result["quantity_column"] = str(
            quantity_column
        )

        result["total_quantity"] = _safe_value(
            quantity.sum()
        )

    if product_column and revenue_column:

        product_sales = (
            df.groupby(
                product_column,
                dropna=False,
            )[revenue_column]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(10)
        )

        result["top_products"] = [
            {
                "product": _safe_value(
                    product
                ),
                "sales": _safe_value(
                    value
                ),
            }
            for product, value
            in product_sales.items()
        ]

    return result


# =========================================================
# FINANCIAL ANALYSIS
# =========================================================


def analyze_financials(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Analyze financial metrics.
    """

    if _dataset_available():

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        revenue_column = _find_column_from_names(
            numeric_columns,
            [
                "revenue",
                "sales",
                "income",
                "total_revenue",
            ],
        )

        cost_column = _find_column_from_names(
            numeric_columns,
            [
                "cost",
                "costs",
                "expense",
                "expenses",
                "total_cost",
            ],
        )

        profit_column = _find_column_from_names(
            numeric_columns,
            [
                "profit",
                "net_profit",
                "gross_profit",
                "profit_amount",
            ],
        )

        result = {
            "analysis_type": "financial_analysis",
            "success": True,
        }

        revenue = None
        costs = None

        if revenue_column:

            revenue_identifier = _quote_identifier(
                revenue_column
            )

            revenue = _run_scalar(
                f"""
                SELECT SUM({revenue_identifier})
                FROM current_dataset
                WHERE {revenue_identifier} IS NOT NULL
                """,
                0,
            )

            result["revenue"] = revenue

        if cost_column:

            cost_identifier = _quote_identifier(
                cost_column
            )

            costs = _run_scalar(
                f"""
                SELECT SUM({cost_identifier})
                FROM current_dataset
                WHERE {cost_identifier} IS NOT NULL
                """,
                0,
            )

            result["costs"] = costs

        if profit_column:

            profit_identifier = _quote_identifier(
                profit_column
            )

            result["profit"] = _run_scalar(
                f"""
                SELECT SUM({profit_identifier})
                FROM current_dataset
                WHERE {profit_identifier} IS NOT NULL
                """,
                0,
            )

        if (
            revenue_column
            and cost_column
        ):

            calculated_profit = (
                float(revenue or 0)
                - float(costs or 0)
            )

            result[
                "calculated_profit"
            ] = _safe_value(
                calculated_profit
            )

            if float(revenue or 0) != 0:

                result[
                    "calculated_margin_percentage"
                ] = _safe_value(
                    (
                        calculated_profit
                        / float(revenue)
                    )
                    * 100
                )

        return result

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "financial_analysis",
            "success": False,
            "message": "Dataset is empty.",
        }

    revenue_column = _find_column(
        df,
        [
            "revenue",
            "sales",
            "income",
            "total_revenue",
        ],
    )

    cost_column = _find_column(
        df,
        [
            "cost",
            "costs",
            "expense",
            "expenses",
            "total_cost",
        ],
    )

    profit_column = _find_column(
        df,
        [
            "profit",
            "net_profit",
            "gross_profit",
            "profit_amount",
        ],
    )

    result = {
        "analysis_type": "financial_analysis",
        "success": True,
    }

    if revenue_column:

        revenue = pd.to_numeric(
            df[revenue_column],
            errors="coerce",
        ).dropna()

        result["revenue"] = _safe_value(
            revenue.sum()
        )

    if cost_column:

        costs = pd.to_numeric(
            df[cost_column],
            errors="coerce",
        ).dropna()

        result["costs"] = _safe_value(
            costs.sum()
        )

    if profit_column:

        profits = pd.to_numeric(
            df[profit_column],
            errors="coerce",
        ).dropna()

        result["profit"] = _safe_value(
            profits.sum()
        )

    if revenue_column and cost_column:

        revenue = pd.to_numeric(
            df[revenue_column],
            errors="coerce",
        ).sum()

        costs = pd.to_numeric(
            df[cost_column],
            errors="coerce",
        ).sum()

        calculated_profit = (
            revenue - costs
        )

        result["calculated_profit"] = _safe_value(
            calculated_profit
        )

        if revenue != 0:

            result[
                "calculated_margin_percentage"
            ] = _safe_value(
                (
                    calculated_profit
                    / revenue
                )
                * 100
            )

    return result


# =========================================================
# DASHBOARD BLUEPRINT
# =========================================================


def analyze_dashboard(
    df: pd.DataFrame | None = None,
) -> dict[str, Any]:
    """
    Generate a deterministic dashboard blueprint.

    The blueprint contains metadata only.
    It does not load the complete dataset.
    """

    if _dataset_available():

        numeric_columns = (
            _get_numeric_columns_duckdb()
        )

        categorical_columns = (
            _get_categorical_columns_duckdb()
        )

        columns = _get_column_names()

        date_column = _find_date_column_from_schema(
            columns
        )

        widgets = []

        for column in numeric_columns[:4]:

            widgets.append(
                {
                    "type": "kpi",
                    "title": f"{column} Total",
                    "metric": str(column),
                }
            )

        if date_column and numeric_columns:

            widgets.append(
                {
                    "type": "line_chart",
                    "title": "Trend Analysis",
                    "date_column": str(
                        date_column
                    ),
                    "metric_column": str(
                        numeric_columns[0]
                    ),
                }
            )

        if categorical_columns and numeric_columns:

            widgets.append(
                {
                    "type": "bar_chart",
                    "title": "Category Performance",
                    "category_column": str(
                        categorical_columns[0]
                    ),
                    "metric_column": str(
                        numeric_columns[0]
                    ),
                }
            )

        widgets.append(
            {
                "type": "table",
                "title": "Dataset Records",
                "columns": [
                    str(column)
                    for column in columns[:8]
                ],
            }
        )

        return {
            "analysis_type": "dashboard",
            "success": True,
            "date_column": (
                str(date_column)
                if date_column
                else None
            ),
            "numeric_columns": [
                str(column)
                for column in numeric_columns
            ],
            "categorical_columns": [
                str(column)
                for column in categorical_columns
            ],
            "widgets": widgets,
        }

    # Legacy fallback

    if df is None or df.empty:

        return {
            "analysis_type": "dashboard",
            "success": False,
            "message": "Dataset is empty.",
        }

    numeric_columns = _numeric_columns(
        df
    )

    categorical_columns = _categorical_columns(
        df
    )

    date_column = _find_date_column(
        df
    )

    widgets = []

    for column in numeric_columns[:4]:

        widgets.append(
            {
                "type": "kpi",
                "title": f"{column} Total",
                "metric": str(column),
            }
        )

    if date_column and numeric_columns:

        widgets.append(
            {
                "type": "line_chart",
                "title": "Trend Analysis",
                "date_column": str(
                    date_column
                ),
                "metric_column": str(
                    numeric_columns[0]
                ),
            }
        )

    if categorical_columns and numeric_columns:

        widgets.append(
            {
                "type": "bar_chart",
                "title": "Category Performance",
                "category_column": str(
                    categorical_columns[0]
                ),
                "metric_column": str(
                    numeric_columns[0]
                ),
            }
        )

    widgets.append(
        {
            "type": "table",
            "title": "Dataset Records",
            "columns": [
                str(column)
                for column in df.columns[:8]
            ],
        }
    )

    return {
        "analysis_type": "dashboard",
        "success": True,
        "date_column": (
            str(date_column)
            if date_column
            else None
        ),
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "widgets": widgets,
    }


# =========================================================
# MAIN ANALYSIS DISPATCHER
# =========================================================


def analyze_dataset_request(
    df: pd.DataFrame | None,
    intent: str,
) -> dict[str, Any]:
    """
    Execute deterministic analysis based on classified intent.

    IMPORTANT:

    When the active dataset exists in DuckDB, the supplied DataFrame
    is intentionally ignored by the analysis functions.

    This means existing callers can continue passing `df`, while
    actual analysis operates against DuckDB.
    """

    intent = (
        intent
        or "summary"
    ).lower().strip()

    # -----------------------------------------------------
    # Ensure a dataset exists
    # -----------------------------------------------------

    if (
        not _dataset_available()
        and (
            df is None
            or df.empty
        )
    ):

        return {
            "analysis_type": intent,
            "success": False,
            "message": "No dataset is available for analysis.",
        }

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    if intent == "summary":

        return analyze_summary(
            df
        )

    # -----------------------------------------------------
    # KPI
    # -----------------------------------------------------

    if intent == "kpi":

        return analyze_kpis(
            df
        )

    # -----------------------------------------------------
    # Ranking
    # -----------------------------------------------------

    if intent == "ranking":

        return analyze_ranking(
            df
        )

    # -----------------------------------------------------
    # Trend
    # -----------------------------------------------------

    if intent == "trend":

        return analyze_trend(
            df
        )

    # -----------------------------------------------------
    # Anomaly
    # -----------------------------------------------------

    if intent == "anomaly":

        return analyze_anomalies(
            df
        )

    # -----------------------------------------------------
    # Data Quality
    # -----------------------------------------------------

    if intent == "data_quality":

        return analyze_data_quality(
            df
        )

    # -----------------------------------------------------
    # Customer Analysis
    # -----------------------------------------------------

    if intent == "customer_analysis":

        return analyze_customers(
            df
        )

    # -----------------------------------------------------
    # Sales Analysis
    # -----------------------------------------------------

    if intent == "sales_analysis":

        return analyze_sales(
            df
        )

    # -----------------------------------------------------
    # Financial Analysis
    # -----------------------------------------------------

    if intent == "financial_analysis":

        return analyze_financials(
            df
        )

    # -----------------------------------------------------
    # Dashboard
    # -----------------------------------------------------

    if intent == "dashboard":

        return analyze_dashboard(
            df
        )

    # -----------------------------------------------------
    # Comparison
    # -----------------------------------------------------

    if intent == "comparison":

        return analyze_comparison(
            df
        )

    # -----------------------------------------------------
    # Recommendation
    # -----------------------------------------------------

    if intent == "recommendation":

        return {
            "analysis_type": "recommendation",
            "success": True,
            "base_analysis": analyze_summary(
                df
            ),
            "message": (
                "Dataset summary calculated. "
                "AI should generate recommendations "
                "using these verified metrics."
            ),
        }

    # -----------------------------------------------------
    # Report
    # -----------------------------------------------------

    if intent == "report":

        return {
            "analysis_type": "report",
            "success": True,
            "base_analysis": analyze_summary(
                df
            ),
            "message": (
                "Dataset analysis is ready for "
                "AI report generation."
            ),
        }

    # -----------------------------------------------------
    # Chat / fallback
    # -----------------------------------------------------

    return analyze_summary(
        df
    )