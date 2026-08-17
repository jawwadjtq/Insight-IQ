import pandas as pd
import numpy as np


# =========================================================
# AI DATA ACTION ENGINE
# =========================================================

def execute_data_action(
    df: pd.DataFrame,
    action: str,
):
    """
    Executes real data analysis operations on the uploaded
    pandas DataFrame.

    The AI decides what action is required.
    This service performs the actual calculation.
    """

    if df is None or df.empty:
        raise ValueError("No dataset is available.")

    action_lower = action.lower().strip()

    # =====================================================
    # DATASET OVERVIEW
    # =====================================================

    if (
        "summary" in action_lower
        or "summarize" in action_lower
        or "overview" in action_lower
    ):

        return {
            "action": "dataset_summary",
            "result": {
                "rows": int(len(df)),
                "columns": int(len(df.columns)),
                "column_names": df.columns.tolist(),
                "numeric_columns": df.select_dtypes(
                    include=["number"]
                ).columns.tolist(),
                "categorical_columns": df.select_dtypes(
                    exclude=["number"]
                ).columns.tolist(),
                "missing_values": int(
                    df.isnull().sum().sum()
                ),
                "duplicate_rows": int(
                    df.duplicated().sum()
                ),
            },
        }

    # =====================================================
    # MISSING VALUES
    # =====================================================

    if (
        "missing" in action_lower
        or "null" in action_lower
        or "empty values" in action_lower
    ):

        missing = (
            df.isnull()
            .sum()
            .sort_values(ascending=False)
        )

        missing = missing[
            missing > 0
        ]

        return {
            "action": "missing_values",
            "result": {
                column: int(value)
                for column, value in missing.items()
            },
        }

    # =====================================================
    # DUPLICATES
    # =====================================================

    if (
        "duplicate" in action_lower
        or "duplicated" in action_lower
    ):

        duplicate_count = int(
            df.duplicated().sum()
        )

        return {
            "action": "duplicates",
            "result": {
                "duplicate_rows": duplicate_count,
            },
        }

    # =====================================================
    # NUMERIC STATISTICS
    # =====================================================

    if (
        "statistics" in action_lower
        or "statistical" in action_lower
        or "describe" in action_lower
        or "descriptive" in action_lower
    ):

        numeric_df = df.select_dtypes(
            include=["number"]
        )

        if numeric_df.empty:
            return {
                "action": "statistics",
                "result": "No numeric columns found.",
            }

        statistics = (
            numeric_df
            .describe()
            .round(2)
            .replace(
                [np.inf, -np.inf],
                np.nan,
            )
            .fillna("")
            .to_dict()
        )

        return {
            "action": "statistics",
            "result": statistics,
        }

    # =====================================================
    # CORRELATION
    # =====================================================

    if "correlation" in action_lower:

        numeric_df = df.select_dtypes(
            include=["number"]
        )

        if len(numeric_df.columns) < 2:
            return {
                "action": "correlation",
                "result": (
                    "At least two numeric columns "
                    "are required."
                ),
            }

        correlation = (
            numeric_df
            .corr()
            .round(3)
            .fillna(0)
            .to_dict()
        )

        return {
            "action": "correlation",
            "result": correlation,
        }

    # =====================================================
    # TOP / BOTTOM VALUES
    # =====================================================

    if (
        "top" in action_lower
        or "highest" in action_lower
        or "largest" in action_lower
        or "best" in action_lower
    ):

        numeric_columns = df.select_dtypes(
            include=["number"]
        ).columns.tolist()

        if not numeric_columns:
            return {
                "action": "top_values",
                "result": (
                    "No numeric columns were found."
                ),
            }

        # Choose the first numeric column by default.
        # Later the AI planner will explicitly tell us
        # which column to use.
        column = numeric_columns[0]

        result = (
            df.nlargest(
                10,
                column,
            )
            .head(10)
            .fillna("")
            .to_dict(
                orient="records"
            )
        )

        return {
            "action": "top_values",
            "column": column,
            "result": result,
        }

    # =====================================================
    # BOTTOM VALUES
    # =====================================================

    if (
        "bottom" in action_lower
        or "lowest" in action_lower
        or "smallest" in action_lower
        or "worst" in action_lower
    ):

        numeric_columns = df.select_dtypes(
            include=["number"]
        ).columns.tolist()

        if not numeric_columns:
            return {
                "action": "bottom_values",
                "result": (
                    "No numeric columns were found."
                ),
            }

        column = numeric_columns[0]

        result = (
            df.nsmallest(
                10,
                column,
            )
            .head(10)
            .fillna("")
            .to_dict(
                orient="records"
            )
        )

        return {
            "action": "bottom_values",
            "column": column,
            "result": result,
        }

    # =====================================================
    # COLUMN INFORMATION
    # =====================================================

    if (
        "column" in action_lower
        or "columns" in action_lower
        or "fields" in action_lower
    ):

        column_information = {}

        for column in df.columns:

            column_information[column] = {
                "dtype": str(
                    df[column].dtype
                ),
                "missing": int(
                    df[column].isnull().sum()
                ),
                "unique_values": int(
                    df[column].nunique()
                ),
            }

        return {
            "action": "column_information",
            "result": column_information,
        }

    # =====================================================
    # DATA PREVIEW
    # =====================================================

    if (
        "preview" in action_lower
        or "sample" in action_lower
        or "show data" in action_lower
    ):

        preview = (
            df.head(20)
            .fillna("")
            .to_dict(
                orient="records"
            )
        )

        return {
            "action": "preview",
            "result": preview,
        }

    # =====================================================
    # UNIQUE VALUES
    # =====================================================

    if (
        "unique" in action_lower
        or "distinct" in action_lower
    ):

        result = {}

        for column in df.columns:

            values = (
                df[column]
                .dropna()
                .unique()
                .tolist()
            )

            # Prevent enormous responses
            result[column] = [
                str(value)
                for value in values[:50]
            ]

        return {
            "action": "unique_values",
            "result": result,
        }

    # =====================================================
    # DATA QUALITY
    # =====================================================

    if (
        "quality" in action_lower
        or "clean" in action_lower
        or "cleaning" in action_lower
    ):

        rows = len(df)
        columns = len(df.columns)

        total_cells = (
            rows * columns
            if rows and columns
            else 1
        )

        missing = int(
            df.isnull().sum().sum()
        )

        duplicates = int(
            df.duplicated().sum()
        )

        missing_ratio = (
            missing / total_cells
        )

        duplicate_ratio = (
            duplicates / rows
            if rows
            else 0
        )

        quality_score = max(
            0,
            100
            - int(
                (missing_ratio * 100)
                + (duplicate_ratio * 100)
            ),
        )

        return {
            "action": "data_quality",
            "result": {
                "quality_score": quality_score,
                "missing_values": missing,
                "duplicate_rows": duplicates,
                "missing_ratio": round(
                    missing_ratio * 100,
                    2,
                ),
                "duplicate_ratio": round(
                    duplicate_ratio * 100,
                    2,
                ),
            },
        }

    # =====================================================
    # FALLBACK
    # =====================================================

    return {
        "action": "unknown",
        "result": (
            "No specific data operation was "
            "recognized for this request."
        ),
    }