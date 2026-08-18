"""
InsightIQ Data Engine

Scalable analytical query layer for InsightIQ.

IMPORTANT:
The AI should NOT receive the complete dataset.

Instead:

    User Request
        ↓
    AI Intent
        ↓
    Data Engine
        ↓
    Small Analytical Result
        ↓
    AI Explanation

DuckDB performs the actual calculations.

This allows InsightIQ to work with datasets much larger
than the context window of an AI model.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import duckdb

from app.services import storage


# =========================================================
# CONFIGURATION
# =========================================================

MAX_RESULT_ROWS = 100

MAX_PREVIEW_ROWS = 20

MAX_COLUMNS = 200


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():
    """
    Create a DuckDB connection to the InsightIQ database.
    """

    database_path = storage.DATABASE_PATH

    return duckdb.connect(
        str(database_path)
    )


# =========================================================
# IDENTIFIER SAFETY
# =========================================================

def quote_identifier(
    identifier: str,
) -> str:
    """
    Safely quote a SQL identifier.

    This prevents column names containing spaces,
    special characters, or SQL keywords from breaking
    queries.

    Example:

        Customer Name

    becomes:

        "Customer Name"
    """

    if not isinstance(identifier, str):

        raise ValueError(
            "Column name must be a string."
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
# CHECK DATASET
# =========================================================

def dataset_exists() -> bool:
    """
    Check whether a dataset is currently available.
    """

    connection = get_connection()

    try:

        result = connection.execute(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_name = 'current_dataset'
            """
        ).fetchone()

        return bool(
            result
            and result[0] > 0
        )

    finally:

        connection.close()


# =========================================================
# DATASET ROW COUNT
# =========================================================

def get_row_count() -> int:
    """
    Return the number of rows in the current dataset.
    """

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
        )

    finally:

        connection.close()


# =========================================================
# DATASET SCHEMA
# =========================================================

def get_schema() -> list[dict[str, Any]]:
    """
    Return the dataset schema.

    Only metadata is returned.
    The dataset itself is never loaded into Python.
    """

    connection = get_connection()

    try:

        rows = connection.execute(
            """
            DESCRIBE current_dataset
            """
        ).fetchall()

        schema = []

        for row in rows:

            schema.append(
                {
                    "column": row[0],
                    "type": row[1],
                    "nullable": row[2],
                }
            )

        return schema[
            :MAX_COLUMNS
        ]

    finally:

        connection.close()


# =========================================================
# NUMERIC COLUMNS
# =========================================================

def get_numeric_columns() -> list[str]:
    """
    Return numeric columns from the dataset.
    """

    schema = get_schema()

    numeric_keywords = (
        "INT",
        "DECIMAL",
        "DOUBLE",
        "FLOAT",
        "HUGEINT",
        "BIGINT",
        "SMALLINT",
        "TINYINT",
        "UBIGINT",
        "UINTEGER",
        "USMALLINT",
        "UTINYINT",
    )

    columns = []

    for item in schema:

        data_type = str(
            item["type"]
        ).upper()

        if any(
            keyword in data_type
            for keyword in numeric_keywords
        ):

            columns.append(
                item["column"]
            )

    return columns


# =========================================================
# CATEGORICAL COLUMNS
# =========================================================

def get_categorical_columns() -> list[str]:
    """
    Return non-numeric columns.
    """

    schema = get_schema()

    numeric_columns = set(
        get_numeric_columns()
    )

    return [
        item["column"]
        for item in schema
        if item["column"]
        not in numeric_columns
    ]


# =========================================================
# PREVIEW
# =========================================================

def preview_dataset(
    limit: int = MAX_PREVIEW_ROWS,
) -> list[dict[str, Any]]:
    """
    Return a very small dataset preview.

    Never return the entire dataset.
    """

    limit = max(
        1,
        min(
            int(limit),
            MAX_PREVIEW_ROWS,
        ),
    )

    connection = get_connection()

    try:

        rows = connection.execute(
            f"""
            SELECT *
            FROM current_dataset
            LIMIT {limit}
            """
        ).fetchdf()

        return rows.to_dict(
            orient="records"
        )

    finally:

        connection.close()


# =========================================================
# COLUMN STATISTICS
# =========================================================

def column_statistics(
    column: str,
) -> dict[str, Any]:
    """
    Calculate statistics for one numeric column.
    """

    quoted_column = quote_identifier(
        column
    )

    connection = get_connection()

    try:

        row = connection.execute(
            f"""
            SELECT
                COUNT(*) AS count,
                COUNT({quoted_column}) AS non_null,
                MIN({quoted_column}) AS minimum,
                MAX({quoted_column}) AS maximum,
                AVG({quoted_column}) AS average,
                MEDIAN({quoted_column}) AS median,
                STDDEV_SAMP({quoted_column}) AS standard_deviation
            FROM current_dataset
            """
        ).fetchone()

        return {
            "column": column,
            "count": row[0],
            "non_null": row[1],
            "minimum": row[2],
            "maximum": row[3],
            "average": row[4],
            "median": row[5],
            "standard_deviation": row[6],
        }

    finally:

        connection.close()


# =========================================================
# TOP N
# =========================================================

def top_n(
    group_column: str,
    metric_column: str,
    limit: int = 10,
) -> dict[str, Any]:
    """
    Return the top N entities according to a numeric metric.

    Example:

        top_n(
            "Customer",
            "Revenue",
            10,
        )
    """

    limit = max(
        1,
        min(
            int(limit),
            MAX_RESULT_ROWS,
        ),
    )

    group_identifier = quote_identifier(
        group_column
    )

    metric_identifier = quote_identifier(
        metric_column
    )

    connection = get_connection()

    try:

        rows = connection.execute(
            f"""
            SELECT
                {group_identifier} AS entity,
                SUM(
                    {metric_identifier}
                ) AS value
            FROM current_dataset

            WHERE
                {group_identifier} IS NOT NULL
                AND {metric_identifier} IS NOT NULL

            GROUP BY
                {group_identifier}

            ORDER BY
                value DESC

            LIMIT {limit}
            """
        ).fetchdf()

        return {
            "operation": "top_n",
            "group_column": group_column,
            "metric_column": metric_column,
            "limit": limit,
            "rows": rows.to_dict(
                orient="records"
            ),
        }

    finally:

        connection.close()


# =========================================================
# BOTTOM N
# =========================================================

def bottom_n(
    group_column: str,
    metric_column: str,
    limit: int = 10,
) -> dict[str, Any]:
    """
    Return the bottom N entities according to a metric.
    """

    limit = max(
        1,
        min(
            int(limit),
            MAX_RESULT_ROWS,
        ),
    )

    group_identifier = quote_identifier(
        group_column
    )

    metric_identifier = quote_identifier(
        metric_column
    )

    connection = get_connection()

    try:

        rows = connection.execute(
            f"""
            SELECT
                {group_identifier} AS entity,
                SUM(
                    {metric_identifier}
                ) AS value
            FROM current_dataset

            WHERE
                {group_identifier} IS NOT NULL
                AND {metric_identifier} IS NOT NULL

            GROUP BY
                {group_identifier}

            ORDER BY
                value ASC

            LIMIT {limit}
            """
        ).fetchdf()

        return {
            "operation": "bottom_n",
            "group_column": group_column,
            "metric_column": metric_column,
            "limit": limit,
            "rows": rows.to_dict(
                orient="records"
            ),
        }

    finally:

        connection.close()


# =========================================================
# AGGREGATION
# =========================================================

def aggregate(
    metric_column: str,
) -> dict[str, Any]:
    """
    Calculate common aggregate metrics.
    """

    metric_identifier = quote_identifier(
        metric_column
    )

    connection = get_connection()

    try:

        row = connection.execute(
            f"""
            SELECT

                COUNT(
                    {metric_identifier}
                ) AS count,

                SUM(
                    {metric_identifier}
                ) AS total,

                AVG(
                    {metric_identifier}
                ) AS average,

                MIN(
                    {metric_identifier}
                ) AS minimum,

                MAX(
                    {metric_identifier}
                ) AS maximum,

                MEDIAN(
                    {metric_identifier}
                ) AS median

            FROM current_dataset
            """
        ).fetchone()

        return {
            "operation": "aggregate",
            "metric_column": metric_column,
            "count": row[0],
            "total": row[1],
            "average": row[2],
            "minimum": row[3],
            "maximum": row[4],
            "median": row[5],
        }

    finally:

        connection.close()


# =========================================================
# GROUP BY
# =========================================================

def group_by(
    group_column: str,
    metric_column: str | None = None,
    limit: int = 100,
) -> dict[str, Any]:
    """
    Group the dataset by a categorical column.

    If metric_column is supplied, calculate SUM and AVG.
    Otherwise calculate row counts.
    """

    limit = max(
        1,
        min(
            int(limit),
            MAX_RESULT_ROWS,
        ),
    )

    group_identifier = quote_identifier(
        group_column
    )

    connection = get_connection()

    try:

        if metric_column:

            metric_identifier = quote_identifier(
                metric_column
            )

            query = f"""
                SELECT
                    {group_identifier} AS category,
                    COUNT(*) AS row_count,
                    SUM(
                        {metric_identifier}
                    ) AS total,
                    AVG(
                        {metric_identifier}
                    ) AS average

                FROM current_dataset

                WHERE
                    {group_identifier} IS NOT NULL

                GROUP BY
                    {group_identifier}

                ORDER BY
                    total DESC

                LIMIT {limit}
            """

        else:

            query = f"""
                SELECT
                    {group_identifier} AS category,
                    COUNT(*) AS row_count

                FROM current_dataset

                WHERE
                    {group_identifier} IS NOT NULL

                GROUP BY
                    {group_identifier}

                ORDER BY
                    row_count DESC

                LIMIT {limit}
            """

        rows = connection.execute(
            query
        ).fetchdf()

        return {
            "operation": "group_by",
            "group_column": group_column,
            "metric_column": metric_column,
            "rows": rows.to_dict(
                orient="records"
            ),
        }

    finally:

        connection.close()


# =========================================================
# MISSING VALUES
# =========================================================

def missing_values() -> dict[str, Any]:
    """
    Calculate missing values for every column.

    Only the resulting statistics are returned.
    """

    schema = get_schema()

    connection = get_connection()

    try:

        results = []

        for item in schema:

            column = item["column"]

            quoted_column = quote_identifier(
                column
            )

            row = connection.execute(
                f"""
                SELECT
                    COUNT(*) AS total,
                    SUM(
                        CASE
                            WHEN {quoted_column} IS NULL
                            THEN 1
                            ELSE 0
                        END
                    ) AS missing
                FROM current_dataset
                """
            ).fetchone()

            total = int(
                row[0] or 0
            )

            missing = int(
                row[1] or 0
            )

            percentage = (
                (
                    missing
                    / total
                )
                * 100
                if total
                else 0
            )

            results.append(
                {
                    "column": column,
                    "total": total,
                    "missing": missing,
                    "percentage": round(
                        percentage,
                        2,
                    ),
                }
            )

        return {
            "operation": "missing_values",
            "columns": results,
        }

    finally:

        connection.close()


# =========================================================
# DISTINCT VALUES
# =========================================================

def distinct_values(
    column: str,
    limit: int = 100,
) -> dict[str, Any]:
    """
    Return distinct values from a column.

    The result is intentionally capped.
    """

    limit = max(
        1,
        min(
            int(limit),
            MAX_RESULT_ROWS,
        ),
    )

    quoted_column = quote_identifier(
        column
    )

    connection = get_connection()

    try:

        rows = connection.execute(
            f"""
            SELECT
                {quoted_column} AS value,
                COUNT(*) AS count

            FROM current_dataset

            WHERE
                {quoted_column} IS NOT NULL

            GROUP BY
                {quoted_column}

            ORDER BY
                count DESC

            LIMIT {limit}
            """
        ).fetchdf()

        return {
            "operation": "distinct_values",
            "column": column,
            "rows": rows.to_dict(
                orient="records"
            ),
        }

    finally:

        connection.close()


# =========================================================
# DATASET OVERVIEW
# =========================================================

def dataset_overview() -> dict[str, Any]:
    """
    Return compact metadata about the current dataset.

    This is safe to pass to the AI.
    """

    row_count = get_row_count()

    schema = get_schema()

    numeric_columns = get_numeric_columns()

    categorical_columns = (
        get_categorical_columns()
    )

    return {
        "row_count": row_count,
        "column_count": len(schema),
        "columns": schema,
        "numeric_columns": numeric_columns[
            :MAX_COLUMNS
        ],
        "categorical_columns": categorical_columns[
            :MAX_COLUMNS
        ],
        "preview": preview_dataset(
            MAX_PREVIEW_ROWS
        ),
    }


# =========================================================
# SAFE CUSTOM SQL
# =========================================================

def execute_read_only_query(
    query: str,
    limit: int = MAX_RESULT_ROWS,
) -> dict[str, Any]:
    """
    Execute a read-only analytical SQL query.

    IMPORTANT:
    This function only allows SELECT/WITH queries.

    INSERT, UPDATE, DELETE, DROP, ALTER, CREATE,
    ATTACH, COPY, and other mutation operations are blocked.
    """

    if not isinstance(
        query,
        str,
    ):

        raise ValueError(
            "Query must be a string."
        )

    normalized = (
        query
        .strip()
        .lower()
    )

    if not normalized:

        raise ValueError(
            "Query cannot be empty."
        )

    # -----------------------------------------------------
    # Remove trailing semicolon
    # -----------------------------------------------------

    normalized = normalized.rstrip(";")

    # -----------------------------------------------------
    # Read-only requirement
    # -----------------------------------------------------

    if not (
        normalized.startswith("select ")
        or normalized.startswith("select\n")
        or normalized.startswith("with ")
    ):

        raise ValueError(
            "Only read-only SELECT/WITH queries are allowed."
        )

    forbidden_keywords = [
        "insert ",
        "update ",
        "delete ",
        "drop ",
        "alter ",
        "create ",
        "truncate ",
        "attach ",
        "detach ",
        "copy ",
        "export ",
        "import ",
        "install ",
        "load ",
    ]

    for keyword in forbidden_keywords:

        if keyword in normalized:

            raise ValueError(
                "Query contains a forbidden operation."
            )

    connection = get_connection()

    try:

        limited_query = f"""
        SELECT *
        FROM (
            {normalized}
        )
        LIMIT {max(
            1,
            min(
                int(limit),
                MAX_RESULT_ROWS,
            ),
        )}
        """

        rows = connection.execute(
            limited_query
        ).fetchdf()

        return {
            "operation": "sql",
            "rows": rows.to_dict(
                orient="records"
            ),
            "row_count": len(rows),
        }

    finally:

        connection.close()


# =========================================================
# UNIFIED QUERY FUNCTION
# =========================================================

def execute_operation(
    operation: str,
    **kwargs,
) -> dict[str, Any]:
    """
    Unified interface for InsightIQ analytical operations.

    Supported operations:

        overview
        preview
        top_n
        bottom_n
        aggregate
        group_by
        missing_values
        distinct_values
        column_statistics
        sql
    """

    if not dataset_exists():

        raise ValueError(
            "No dataset is currently available."
        )

    operation = (
        operation
        .strip()
        .lower()
    )

    if operation == "overview":

        return dataset_overview()

    if operation == "preview":

        return {
            "operation": "preview",
            "rows": preview_dataset(
                kwargs.get(
                    "limit",
                    MAX_PREVIEW_ROWS,
                )
            ),
        }

    if operation == "top_n":

        return top_n(
            group_column=kwargs[
                "group_column"
            ],
            metric_column=kwargs[
                "metric_column"
            ],
            limit=kwargs.get(
                "limit",
                10,
            ),
        )

    if operation == "bottom_n":

        return bottom_n(
            group_column=kwargs[
                "group_column"
            ],
            metric_column=kwargs[
                "metric_column"
            ],
            limit=kwargs.get(
                "limit",
                10,
            ),
        )

    if operation == "aggregate":

        return aggregate(
            metric_column=kwargs[
                "metric_column"
            ],
        )

    if operation == "group_by":

        return group_by(
            group_column=kwargs[
                "group_column"
            ],
            metric_column=kwargs.get(
                "metric_column"
            ),
            limit=kwargs.get(
                "limit",
                100,
            ),
        )

    if operation == "missing_values":

        return missing_values()

    if operation == "distinct_values":

        return distinct_values(
            column=kwargs[
                "column"
            ],
            limit=kwargs.get(
                "limit",
                100,
            ),
        )

    if operation == "column_statistics":

        return column_statistics(
            column=kwargs[
                "column"
            ],
        )

    if operation == "sql":

        return execute_read_only_query(
            query=kwargs[
                "query"
            ],
            limit=kwargs.get(
                "limit",
                MAX_RESULT_ROWS,
            ),
        )

    raise ValueError(
        f"Unsupported data operation: {operation}"
    )