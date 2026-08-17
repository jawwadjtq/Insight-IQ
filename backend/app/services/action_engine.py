from __future__ import annotations

from typing import Any

import pandas as pd


# =========================================================
# INSIGHTIQ ACTION ENGINE
# =========================================================
#
# This service executes the structured action plan created
# by ai_planner.py.
#
# The AI decides WHAT to do.
# Pandas decides HOW to calculate it.
#
# This separation is extremely important:
#
# AI Planner
#     ↓
# Action Plan
#     ↓
# Pandas Action Engine
#     ↓
# Real Dataset Result
#
# The engine NEVER asks the LLM to calculate numbers.
# All calculations happen locally with pandas.
# =========================================================


# =========================================================
# HELPERS
# =========================================================

def _clean_column_name(value: Any) -> str | None:
    """
    Convert a column value into a clean string.
    """

    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    return value


def _find_column(
    df: pd.DataFrame,
    requested_column: str | None,
) -> str | None:
    """
    Find a dataframe column safely.

    Matching is:
        1. Exact match
        2. Case-insensitive match
        3. Trimmed case-insensitive match
    """

    if not requested_column:
        return None

    requested_column = str(
        requested_column
    ).strip()

    # Exact match
    if requested_column in df.columns:
        return requested_column

    # Case-insensitive match
    requested_lower = requested_column.lower()

    for column in df.columns:

        if str(column).strip().lower() == requested_lower:
            return column

    return None


def _numeric_series(
    df: pd.DataFrame,
    column: str,
) -> pd.Series:
    """
    Convert a dataframe column to numeric values.
    Invalid values become NaN.
    """

    return pd.to_numeric(
        df[column],
        errors="coerce",
    )


def _json_safe(value: Any) -> Any:
    """
    Convert pandas / numpy values into JSON-safe values.
    """

    if pd.isna(value):
        return None

    # pandas timestamp
    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    # Python scalar
    if hasattr(value, "item"):

        try:
            return value.item()

        except Exception:
            pass

    return value


def _records_from_dataframe(
    dataframe: pd.DataFrame,
) -> list[dict]:
    """
    Convert dataframe rows into JSON-safe dictionaries.
    """

    records = []

    for record in dataframe.to_dict(
        orient="records"
    ):

        clean_record = {}

        for key, value in record.items():

            clean_record[str(key)] = _json_safe(
                value
            )

        records.append(clean_record)

    return records


def _result(
    *,
    intent: str,
    deliverable: str,
    title: str,
    dataframe: pd.DataFrame | None = None,
    value: Any = None,
    message: str | None = None,
    metadata: dict | None = None,
) -> dict:
    """
    Standard InsightIQ action result.
    """

    result = {
        "success": True,
        "intent": intent,
        "deliverable": deliverable,
        "title": title,
        "value": _json_safe(value),
        "message": message,
        "columns": [],
        "rows": [],
        "row_count": 0,
        "metadata": metadata or {},
    }

    if dataframe is not None:

        result["columns"] = [
            str(column)
            for column in dataframe.columns
        ]

        result["rows"] = _records_from_dataframe(
            dataframe
        )

        result["row_count"] = len(dataframe)

    return result


def _error(
    message: str,
    *,
    intent: str | None = None,
) -> dict:
    """
    Standard InsightIQ action error.
    """

    return {
        "success": False,
        "intent": intent,
        "deliverable": "answer",
        "title": "Unable to complete analysis",
        "value": None,
        "message": message,
        "columns": [],
        "rows": [],
        "row_count": 0,
        "metadata": {},
    }


# =========================================================
# ANSWER / SUMMARY
# =========================================================

def execute_answer(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Basic dataset answer.

    This action does not attempt to invent a calculation.
    It returns useful dataset information for the AI layer.
    """

    return _result(
        intent="answer",
        deliverable=plan.get(
            "deliverable",
            "answer",
        ),
        title=plan.get(
            "title"
        ) or "Dataset Analysis",
        dataframe=df.head(20),
        message=(
            "The dataset is available for analysis."
        ),
        metadata={
            "rows": len(df),
            "columns": len(df.columns),
        },
    )


def execute_summary(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Generate a compact statistical summary.
    """

    numeric_df = df.select_dtypes(
        include="number"
    )

    if numeric_df.empty:

        return _result(
            intent="summary",
            deliverable="answer",
            title="Dataset Summary",
            message=(
                "No numeric columns were available "
                "for statistical summarization."
            ),
            metadata={
                "rows": len(df),
                "columns": len(df.columns),
            },
        )

    summary = numeric_df.describe().T.reset_index()

    summary = summary.rename(
        columns={
            "index": "column"
        }
    )

    return _result(
        intent="summary",
        deliverable="table",
        title=plan.get(
            "title"
        ) or "Dataset Summary",
        dataframe=summary,
        metadata={
            "rows": len(df),
            "columns": len(df.columns),
        },
    )


# =========================================================
# AGGREGATION
# =========================================================

def execute_aggregation(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Execute:

        sum
        mean
        median
        min
        max
        count
    """

    metric_name = _clean_column_name(
        plan.get("metric")
    )

    if not metric_name:

        return _error(
            "No metric column was identified.",
            intent="aggregation",
        )

    metric_column = _find_column(
        df,
        metric_name,
    )

    if not metric_column:

        return _error(
            f"Column '{metric_name}' was not found "
            "in the uploaded dataset.",
            intent="aggregation",
        )

    operation = (
        plan.get("operation")
        or "sum"
    ).lower()

    # -----------------------------------------------------
    # COUNT
    # -----------------------------------------------------

    if operation == "count":

        value = int(
            df[metric_column]
            .notna()
            .sum()
        )

    else:

        numeric = _numeric_series(
            df,
            metric_column,
        )

        numeric = numeric.dropna()

        if numeric.empty:

            return _error(
                f"Column '{metric_column}' does not "
                "contain usable numeric values.",
                intent="aggregation",
            )

        if operation == "sum":

            value = numeric.sum()

        elif operation in {
            "mean",
            "average",
        }:

            value = numeric.mean()

        elif operation == "median":

            value = numeric.median()

        elif operation == "min":

            value = numeric.min()

        elif operation == "max":

            value = numeric.max()

        else:

            return _error(
                f"Unsupported aggregation operation: "
                f"{operation}",
                intent="aggregation",
            )

    result_df = pd.DataFrame(
        [
            {
                "Metric": metric_column,
                "Operation": operation,
                "Value": _json_safe(value),
            }
        ]
    )

    return _result(
        intent="aggregation",
        deliverable=plan.get(
            "deliverable",
            "kpi",
        ),
        title=plan.get(
            "title"
        ) or f"{operation.title()} of {metric_column}",
        dataframe=result_df,
        value=value,
        metadata={
            "metric": metric_column,
            "operation": operation,
        },
    )


# =========================================================
# RANKING
# =========================================================

def execute_ranking(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Execute requests such as:

        Top 10 customers by revenue
        Bottom 5 products by sales
    """

    group_name = _clean_column_name(
        plan.get("group_by")
    )

    metric_name = _clean_column_name(
        plan.get("metric")
    )

    if not group_name:

        return _error(
            "No grouping column was identified.",
            intent="ranking",
        )

    if not metric_name:

        return _error(
            "No metric column was identified.",
            intent="ranking",
        )

    group_column = _find_column(
        df,
        group_name,
    )

    metric_column = _find_column(
        df,
        metric_name,
    )

    if not group_column:

        return _error(
            f"Column '{group_name}' was not found.",
            intent="ranking",
        )

    if not metric_column:

        return _error(
            f"Column '{metric_name}' was not found.",
            intent="ranking",
        )

    numeric = _numeric_series(
        df,
        metric_column,
    )

    working = pd.DataFrame(
        {
            group_column: df[group_column],
            metric_column: numeric,
        }
    )

    working = working.dropna(
        subset=[
            group_column,
            metric_column,
        ]
    )

    if working.empty:

        return _error(
            "No usable rows were available for ranking.",
            intent="ranking",
        )

    grouped = (
        working
        .groupby(
            group_column,
            as_index=False,
        )[metric_column]
        .sum()
    )

    ascending = (
        plan.get("sort") == "asc"
    )

    grouped = grouped.sort_values(
        metric_column,
        ascending=ascending,
    )

    limit = plan.get("limit") or 10

    grouped = grouped.head(
        max(1, min(int(limit), 100))
    )

    grouped = grouped.reset_index(
        drop=True
    )

    return _result(
        intent="ranking",
        deliverable=plan.get(
            "deliverable",
            "table",
        ),
        title=plan.get(
            "title"
        ) or f"Top {len(grouped)} {group_column} by {metric_column}",
        dataframe=grouped,
        metadata={
            "group_by": group_column,
            "metric": metric_column,
            "sort": (
                "asc"
                if ascending
                else "desc"
            ),
            "limit": int(limit),
        },
    )


# =========================================================
# GROUP ANALYSIS
# =========================================================

def execute_group_analysis(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Execute requests such as:

        Revenue by region
        Sales by product
        Average salary by department
    """

    group_name = _clean_column_name(
        plan.get("group_by")
    )

    metric_name = _clean_column_name(
        plan.get("metric")
    )

    if not group_name:

        return _error(
            "No grouping column was identified.",
            intent="group_analysis",
        )

    if not metric_name:

        return _error(
            "No metric column was identified.",
            intent="group_analysis",
        )

    group_column = _find_column(
        df,
        group_name,
    )

    metric_column = _find_column(
        df,
        metric_name,
    )

    if not group_column:

        return _error(
            f"Column '{group_name}' was not found.",
            intent="group_analysis",
        )

    if not metric_column:

        return _error(
            f"Column '{metric_name}' was not found.",
            intent="group_analysis",
        )

    operation = (
        plan.get("operation")
        or "sum"
    ).lower()

    working = df[
        [
            group_column,
            metric_column,
        ]
    ].copy()

    working[metric_column] = _numeric_series(
        working,
        metric_column,
    )

    working = working.dropna(
        subset=[
            group_column,
            metric_column,
        ]
    )

    if working.empty:

        return _error(
            "No usable rows were available.",
            intent="group_analysis",
        )

    grouped = (
        working
        .groupby(
            group_column,
            as_index=False,
        )
    )

    if operation == "sum":

        result_df = grouped[
            metric_column
        ].sum()

    elif operation in {
        "mean",
        "average",
    }:

        result_df = grouped[
            metric_column
        ].mean()

    elif operation == "median":

        result_df = grouped[
            metric_column
        ].median()

    elif operation == "min":

        result_df = grouped[
            metric_column
        ].min()

    elif operation == "max":

        result_df = grouped[
            metric_column
        ].max()

    elif operation == "count":

        result_df = grouped[
            metric_column
        ].count()

    else:

        return _error(
            f"Unsupported operation: {operation}",
            intent="group_analysis",
        )

    result_df = result_df.sort_values(
        metric_column,
        ascending=False,
    )

    result_df = result_df.reset_index(
        drop=True
    )

    return _result(
        intent="group_analysis",
        deliverable=plan.get(
            "deliverable",
            "table",
        ),
        title=plan.get(
            "title"
        ) or f"{operation.title()} {metric_column} by {group_column}",
        dataframe=result_df,
        metadata={
            "group_by": group_column,
            "metric": metric_column,
            "operation": operation,
        },
    )


# =========================================================
# FILTER
# =========================================================

def execute_filter(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Basic filter execution.

    Supports simple filter objects generated by the planner.

    Example:

        {
            "column": "Region",
            "operator": "equals",
            "value": "North"
        }
    """

    filter_config = plan.get(
        "filter"
    )

    if not filter_config:

        return _error(
            "No filter condition was identified.",
            intent="filter",
        )

    if not isinstance(
        filter_config,
        dict,
    ):

        return _error(
            "The filter format is invalid.",
            intent="filter",
        )

    column_name = _clean_column_name(
        filter_config.get("column")
    )

    operator = (
        str(
            filter_config.get(
                "operator",
                "equals",
            )
        )
        .strip()
        .lower()
    )

    value = filter_config.get(
        "value"
    )

    column = _find_column(
        df,
        column_name,
    )

    if not column:

        return _error(
            f"Column '{column_name}' was not found.",
            intent="filter",
        )

    series = df[column]

    if operator in {
        "equals",
        "equal",
        "==",
    }:

        mask = (
            series.astype(str)
            .str.strip()
            .str.lower()
            == str(value).strip().lower()
        )

    elif operator in {
        "not_equals",
        "!=",
    }:

        mask = (
            series.astype(str)
            .str.strip()
            .str.lower()
            != str(value).strip().lower()
        )

    elif operator in {
        "contains",
    }:

        mask = (
            series.astype(str)
            .str.contains(
                str(value),
                case=False,
                na=False,
            )
        )

    elif operator in {
        "greater_than",
        ">",
    }:

        numeric = pd.to_numeric(
            series,
            errors="coerce",
        )

        mask = numeric > float(value)

    elif operator in {
        "less_than",
        "<",
    }:

        numeric = pd.to_numeric(
            series,
            errors="coerce",
        )

        mask = numeric < float(value)

    elif operator in {
        "greater_than_or_equal",
        ">=",
    }:

        numeric = pd.to_numeric(
            series,
            errors="coerce",
        )

        mask = numeric >= float(value)

    elif operator in {
        "less_than_or_equal",
        "<=",
    }:

        numeric = pd.to_numeric(
            series,
            errors="coerce",
        )

        mask = numeric <= float(value)

    else:

        return _error(
            f"Unsupported filter operator: {operator}",
            intent="filter",
        )

    filtered = df.loc[
        mask
    ].copy()

    # Keep the response manageable.
    filtered = filtered.head(100)

    return _result(
        intent="filter",
        deliverable=plan.get(
            "deliverable",
            "table",
        ),
        title=plan.get(
            "title"
        ) or f"Filtered Data — {column}",
        dataframe=filtered,
        metadata={
            "column": column,
            "operator": operator,
            "value": value,
            "matched_rows": int(
                mask.sum()
            ),
        },
    )


# =========================================================
# TREND
# =========================================================

def execute_trend(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Execute time-series trend analysis.

    Example:

        Show monthly revenue
    """

    time_name = _clean_column_name(
        plan.get("time_column")
    )

    metric_name = _clean_column_name(
        plan.get("metric")
    )

    if not time_name:

        return _error(
            "No date/time column was identified.",
            intent="trend",
        )

    if not metric_name:

        return _error(
            "No metric column was identified.",
            intent="trend",
        )

    time_column = _find_column(
        df,
        time_name,
    )

    metric_column = _find_column(
        df,
        metric_name,
    )

    if not time_column:

        return _error(
            f"Column '{time_name}' was not found.",
            intent="trend",
        )

    if not metric_column:

        return _error(
            f"Column '{metric_name}' was not found.",
            intent="trend",
        )

    working = df[
        [
            time_column,
            metric_column,
        ]
    ].copy()

    working[time_column] = pd.to_datetime(
        working[time_column],
        errors="coerce",
    )

    working[metric_column] = pd.to_numeric(
        working[metric_column],
        errors="coerce",
    )

    working = working.dropna(
        subset=[
            time_column,
            metric_column,
        ]
    )

    if working.empty:

        return _error(
            "No usable date and metric values were found.",
            intent="trend",
        )

    granularity = (
        plan.get("time_granularity")
        or "month"
    ).lower()

    if granularity == "year":

        working["Period"] = (
            working[time_column]
            .dt.to_period("Y")
            .astype(str)
        )

    elif granularity == "quarter":

        working["Period"] = (
            working[time_column]
            .dt.to_period("Q")
            .astype(str)
        )

    elif granularity == "week":

        working["Period"] = (
            working[time_column]
            .dt.to_period("W")
            .astype(str)
        )

    else:

        working["Period"] = (
            working[time_column]
            .dt.to_period("M")
            .astype(str)
        )

    result_df = (
        working
        .groupby(
            "Period",
            as_index=False,
        )[metric_column]
        .sum()
        .sort_values("Period")
        .reset_index(drop=True)
    )

    return _result(
        intent="trend",
        deliverable=plan.get(
            "deliverable",
            "chart",
        ),
        title=plan.get(
            "title"
        ) or f"{granularity.title()} {metric_column} Trend",
        dataframe=result_df,
        metadata={
            "time_column": time_column,
            "metric": metric_column,
            "time_granularity": granularity,
            "chart_type": (
                plan.get("chart_type")
                or "line"
            ),
        },
    )


# =========================================================
# DATA QUALITY
# =========================================================

def execute_data_quality(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Analyze basic data quality.
    """

    total_rows = len(df)

    quality_rows = []

    for column in df.columns:

        missing = int(
            df[column]
            .isna()
            .sum()
        )

        duplicates = int(
            df[column]
            .duplicated()
            .sum()
        )

        unique = int(
            df[column]
            .nunique(
                dropna=True
            )
        )

        quality_rows.append(
            {
                "Column": str(column),
                "Data Type": str(
                    df[column].dtype
                ),
                "Missing Values": missing,
                "Missing %": (
                    round(
                        (
                            missing
                            / total_rows
                            * 100
                        ),
                        2,
                    )
                    if total_rows
                    else 0
                ),
                "Unique Values": unique,
                "Duplicate Values": duplicates,
            }
        )

    result_df = pd.DataFrame(
        quality_rows
    )

    return _result(
        intent="data_quality",
        deliverable=plan.get(
            "deliverable",
            "answer",
        ),
        title=plan.get(
            "title"
        ) or "Data Quality Analysis",
        dataframe=result_df,
        metadata={
            "rows": total_rows,
            "columns": len(df.columns),
            "duplicate_rows": int(
                df.duplicated().sum()
            ),
        },
    )


# =========================================================
# ANOMALY DETECTION
# =========================================================

def execute_anomaly(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Simple statistical anomaly detection using the IQR
    method.

    This is deliberately deterministic and does not depend
    on the LLM.
    """

    metric_name = _clean_column_name(
        plan.get("metric")
    )

    # -----------------------------------------------------
    # If the planner supplied a metric, use it.
    # Otherwise analyze all numeric columns.
    # -----------------------------------------------------

    if metric_name:

        metric_column = _find_column(
            df,
            metric_name,
        )

        if not metric_column:

            return _error(
                f"Column '{metric_name}' was not found.",
                intent="anomaly",
            )

        columns = [
            metric_column
        ]

    else:

        columns = list(
            df.select_dtypes(
                include="number"
            ).columns
        )

    if not columns:

        return _error(
            "No numeric columns were available "
            "for anomaly detection.",
            intent="anomaly",
        )

    anomaly_frames = []

    for column in columns:

        numeric = pd.to_numeric(
            df[column],
            errors="coerce",
        )

        valid = numeric.dropna()

        if valid.empty:
            continue

        q1 = valid.quantile(
            0.25
        )

        q3 = valid.quantile(
            0.75
        )

        iqr = q3 - q1

        lower = q1 - (
            1.5 * iqr
        )

        upper = q3 + (
            1.5 * iqr
        )

        mask = (
            numeric < lower
        ) | (
            numeric > upper
        )

        indexes = df.index[
            mask
        ]

        for index in indexes:

            anomaly_frames.append(
                {
                    "Row": int(index),
                    "Column": str(column),
                    "Value": _json_safe(
                        numeric.loc[index]
                    ),
                    "Lower Bound": _json_safe(
                        lower
                    ),
                    "Upper Bound": _json_safe(
                        upper
                    ),
                    "Anomaly": True,
                }
            )

    result_df = pd.DataFrame(
        anomaly_frames
    )

    if not result_df.empty:

        result_df = result_df.head(
            100
        )

    return _result(
        intent="anomaly",
        deliverable=plan.get(
            "deliverable",
            "table",
        ),
        title=plan.get(
            "title"
        ) or "Detected Data Anomalies",
        dataframe=result_df,
        metadata={
            "method": "IQR",
            "anomaly_count": len(
                anomaly_frames
            ),
        },
        message=(
            "Anomalies were detected using the "
            "interquartile range (IQR) method."
        ),
    )


# =========================================================
# VISUALIZATION
# =========================================================

def execute_visualization(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Prepare chart-ready data.

    Actual chart rendering remains a frontend responsibility.
    """

    group_name = _clean_column_name(
        plan.get("group_by")
    )

    metric_name = _clean_column_name(
        plan.get("metric")
    )

    chart_type = (
        plan.get("chart_type")
        or "bar"
    )

    # -----------------------------------------------------
    # If a grouping and metric are available, use grouped
    # analysis.
    # -----------------------------------------------------

    if group_name and metric_name:

        group_column = _find_column(
            df,
            group_name,
        )

        metric_column = _find_column(
            df,
            metric_name,
        )

        if not group_column:

            return _error(
                f"Column '{group_name}' was not found.",
                intent="visualization",
            )

        if not metric_column:

            return _error(
                f"Column '{metric_name}' was not found.",
                intent="visualization",
            )

        numeric = _numeric_series(
            df,
            metric_column,
        )

        working = pd.DataFrame(
            {
                group_column: df[group_column],
                metric_column: numeric,
            }
        ).dropna()

        result_df = (
            working
            .groupby(
                group_column,
                as_index=False,
            )[metric_column]
            .sum()
            .sort_values(
                metric_column,
                ascending=False,
            )
            .head(20)
            .reset_index(drop=True)
        )

    else:

        numeric_df = df.select_dtypes(
            include="number"
        )

        if numeric_df.empty:

            return _error(
                "No numeric data is available "
                "for visualization.",
                intent="visualization",
            )

        metric_column = (
            numeric_df.columns[0]
        )

        result_df = pd.DataFrame(
            {
                "Index": range(
                    len(
                        numeric_df.head(50)
                    )
                ),
                metric_column:
                    numeric_df[
                        metric_column
                    ].head(50).values,
            }
        )

    return _result(
        intent="visualization",
        deliverable="chart",
        title=plan.get(
            "title"
        ) or "InsightIQ Visualization",
        dataframe=result_df,
        metadata={
            "chart_type": chart_type,
            "group_by": group_name,
            "metric": metric_name,
        },
    )


# =========================================================
# MAIN EXECUTOR
# =========================================================

def execute_action(
    df: pd.DataFrame,
    plan: dict,
) -> dict:
    """
    Main entry point.

    Receives a dataframe and an AI-generated action plan,
    then executes the appropriate deterministic operation.
    """

    if df is None:

        return _error(
            "No dataset is available."
        )

    if not isinstance(
        df,
        pd.DataFrame,
    ):

        return _error(
            "Invalid dataset format."
        )

    if df.empty:

        return _error(
            "The uploaded dataset is empty."
        )

    if not isinstance(
        plan,
        dict,
    ):

        return _error(
            "Invalid action plan."
        )

    intent = (
        plan.get("intent")
        or "answer"
    ).lower()

    # -----------------------------------------------------
    # Dispatch
    # -----------------------------------------------------

    if intent == "answer":

        return execute_answer(
            df,
            plan,
        )

    if intent == "summary":

        return execute_summary(
            df,
            plan,
        )

    if intent == "aggregation":

        return execute_aggregation(
            df,
            plan,
        )

    if intent == "ranking":

        return execute_ranking(
            df,
            plan,
        )

    if intent == "group_analysis":

        return execute_group_analysis(
            df,
            plan,
        )

    if intent == "filter":

        return execute_filter(
            df,
            plan,
        )

    if intent == "trend":

        return execute_trend(
            df,
            plan,
        )

    if intent == "anomaly":

        return execute_anomaly(
            df,
            plan,
        )

    if intent == "data_quality":

        return execute_data_quality(
            df,
            plan,
        )

    if intent == "visualization":

        return execute_visualization(
            df,
            plan,
        )

    # -----------------------------------------------------
    # Report / Dashboard
    #
    # These are intentionally NOT executed here yet.
    #
    # The existing report generation system remains
    # responsible for PDF reports.
    #
    # Dashboard generation will be implemented in the
    # next stage.
    # -----------------------------------------------------

    if intent == "report":

        return {
            "success": True,
            "intent": "report",
            "deliverable": "report",
            "title": plan.get(
                "title"
            ) or "InsightIQ Report",
            "value": None,
            "message": (
                "Report request identified. "
                "Use the existing report generation "
                "workflow to create the PDF."
            ),
            "columns": [],
            "rows": [],
            "row_count": 0,
            "metadata": {
                "requires_report_generator": True,
            },
        }

    if intent == "dashboard":

        return {
            "success": True,
            "intent": "dashboard",
            "deliverable": "dashboard",
            "title": plan.get(
                "title"
            ) or "InsightIQ Dashboard",
            "value": None,
            "message": (
                "Dashboard request identified. "
                "Dashboard generation will be handled "
                "by the dashboard builder."
            ),
            "columns": [],
            "rows": [],
            "row_count": 0,
            "metadata": {
                "requires_dashboard_builder": True,
            },
        }

    return _error(
        f"Unsupported action intent: {intent}",
        intent=intent,
    )