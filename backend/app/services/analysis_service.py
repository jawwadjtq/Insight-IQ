"""
InsightIQ Dataset Analysis Engine.

This service performs deterministic calculations directly on the
uploaded pandas DataFrame.

IMPORTANT:
The AI should explain calculated results, not invent them.

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
- Recommendations
"""


from __future__ import annotations

from typing import Any

import pandas as pd
import numpy as np


# =========================================================
# GENERAL HELPERS
# =========================================================


def _safe_value(value: Any) -> Any:
    """
    Convert pandas / numpy values into JSON-safe Python values.
    """

    if value is None:
        return None

    if isinstance(value, (np.integer,)):
        return int(value)

    if isinstance(value, (np.floating,)):
        if np.isnan(value):
            return None

        return float(value)

    if isinstance(value, (np.bool_,)):
        return bool(value)

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if isinstance(value, float):

        if np.isnan(value):
            return None

        if np.isinf(value):
            return None

        return round(value, 4)

    return value


def _safe_dataframe_records(
    df: pd.DataFrame,
) -> list[dict[str, Any]]:
    """
    Convert a DataFrame into JSON-safe records.
    """

    if df.empty:
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
    Return numeric columns.
    """

    return list(
        df.select_dtypes(
            include=np.number
        ).columns
    )


def _categorical_columns(
    df: pd.DataFrame,
) -> list[str]:
    """
    Return text / categorical columns.
    """

    return list(
        df.select_dtypes(
            include=[
                "object",
                "category",
                "string",
            ]
        ).columns
    )


def _find_column(
    df: pd.DataFrame,
    keywords: list[str],
) -> str | None:
    """
    Find the most likely column matching a set of keywords.

    Example:

    keywords = ["revenue", "sales"]

    could match:

    "Total Revenue"
    "Sales Amount"
    "Revenue"
    """

    if df.empty:
        return None

    columns = list(df.columns)

    # -----------------------------------------------------
    # Exact match
    # -----------------------------------------------------

    for column in columns:

        column_lower = str(
            column
        ).lower().strip()

        if column_lower in keywords:

            return column

    # -----------------------------------------------------
    # Keyword match
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


def _find_date_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Attempt to find the most likely date column.
    """

    if df.empty:
        return None

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

    # -----------------------------------------------------
    # Keyword-based detection
    # -----------------------------------------------------

    for column in df.columns:

        column_lower = str(
            column
        ).lower()

        if any(
            keyword in column_lower
            for keyword in date_keywords
        ):

            converted = pd.to_datetime(
                df[column],
                errors="coerce",
            )

            valid_ratio = (
                converted.notna().mean()
            )

            if valid_ratio >= 0.5:

                return column

    # -----------------------------------------------------
    # Automatic detection
    # -----------------------------------------------------

    for column in df.columns:

        converted = pd.to_datetime(
            df[column],
            errors="coerce",
        )

        valid_ratio = (
            converted.notna().mean()
        )

        if valid_ratio >= 0.8:

            return column

    return None


# =========================================================
# DATASET SUMMARY
# =========================================================


def analyze_summary(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Generate a deterministic dataset summary.
    """

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

    if total_cells > 0:

        missing_percentage = round(
            (
                missing_values
                / total_cells
            )
            * 100,
            2,
        )

    else:

        missing_percentage = 0

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
        "numeric_columns": [
            str(column)
            for column in numeric_columns
        ],
        "categorical_columns": [
            str(column)
            for column in categorical_columns
        ],
        "missing_values": missing_values,
        "missing_percentage": missing_percentage,
        "duplicate_rows": duplicate_rows,
        "quality_score": quality_score,
        "preview": _safe_dataframe_records(
            df.head(10)
        ),
    }


# =========================================================
# KPI ANALYSIS
# =========================================================


def analyze_kpis(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Calculate useful KPIs from numeric columns.
    """

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

        kpis[str(column)] = {
            "count": int(
                series.count()
            ),
            "sum": _safe_value(
                series.sum()
            ),
            "mean": _safe_value(
                series.mean()
            ),
            "median": _safe_value(
                series.median()
            ),
            "minimum": _safe_value(
                series.min()
            ),
            "maximum": _safe_value(
                series.max()
            ),
            "standard_deviation": _safe_value(
                series.std()
            ),
        }

    return {
        "analysis_type": "kpi",
        "success": True,
        "numeric_columns": [
            str(column)
            for column in numeric_columns
        ],
        "kpis": kpis,
    }


# =========================================================
# RANKING ANALYSIS
# =========================================================


def analyze_ranking(
    df: pd.DataFrame,
    top_n: int = 10,
) -> dict[str, Any]:
    """
    Find top and bottom entities.

    Automatically attempts to identify:

    - Entity column
    - Revenue / sales / amount column
    """

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

    # -----------------------------------------------------
    # No entity column
    # -----------------------------------------------------

    if entity_column is None:

        ranking_df = (
            df[
                [metric_column]
            ]
            .copy()
        )

        ranking_df["row"] = (
            ranking_df.index + 1
        )

        entity_column = "row"

    else:

        ranking_df = (
            df[
                [
                    entity_column,
                    metric_column,
                ]
            ]
            .copy()
        )

    ranking_df[
        metric_column
    ] = pd.to_numeric(
        ranking_df[
            metric_column
        ],
        errors="coerce",
    )

    ranking_df = ranking_df.dropna(
        subset=[
            metric_column
        ]
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

    top = grouped.head(
        top_n
    )

    bottom = grouped.tail(
        top_n
    ).sort_values(
        ascending=True
    )

    return {
        "analysis_type": "ranking",
        "success": True,
        "entity_column": str(
            entity_column
        ),
        "metric_column": str(
            metric_column
        ),
        "top_n": int(top_n),
        "top": [
            {
                "entity": _safe_value(
                    entity
                ),
                "value": _safe_value(
                    value
                ),
            }
            for entity, value
            in top.items()
        ],
        "bottom": [
            {
                "entity": _safe_value(
                    entity
                ),
                "value": _safe_value(
                    value
                ),
            }
            for entity, value
            in bottom.items()
        ],
    }


# =========================================================
# TREND ANALYSIS
# =========================================================


def analyze_trend(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze numeric trends over time.
    """

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

    trend_df[
        date_column
    ] = pd.to_datetime(
        trend_df[date_column],
        errors="coerce",
    )

    trend_df[
        metric_column
    ] = pd.to_numeric(
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
        trend_df[
            date_column
        ].dt.to_period("M")
    )

    monthly = (
        trend_df
        .groupby("period")[
            metric_column
        ]
        .sum()
        .sort_index()
    )

    records = []

    previous_value = None

    for period, value in monthly.items():

        growth = None

        if previous_value not in [
            None,
            0,
        ]:

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


# =========================================================
# ANOMALY ANALYSIS
# =========================================================


def analyze_anomalies(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Detect statistical outliers using the IQR method.
    """

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
        )

        series = series.dropna()

        if len(series) < 4:

            continue

        q1 = series.quantile(
            0.25
        )

        q3 = series.quantile(
            0.75
        )

        iqr = q3 - q1

        lower_bound = (
            q1 - 1.5 * iqr
        )

        upper_bound = (
            q3 + 1.5 * iqr
        )

        mask = (
            (series < lower_bound)
            | (series > upper_bound)
        )

        anomaly_values = series[
            mask
        ]

        anomalies[str(column)] = {
            "count": int(
                len(anomaly_values)
            ),
            "percentage": _safe_value(
                (
                    len(anomaly_values)
                    / len(series)
                )
                * 100
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
                in anomaly_values.head(20)
            ],
        }

    return {
        "analysis_type": "anomaly",
        "success": True,
        "method": "IQR",
        "anomalies": anomalies,
    }


# =========================================================
# DATA QUALITY ANALYSIS
# =========================================================


def analyze_data_quality(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze missing values, duplicates and basic quality issues.
    """

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
# COMPARISON ANALYSIS
# =========================================================


def analyze_comparison(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Compare categorical groups using numeric metrics.
    """

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
        "group_column": str(
            group_column
        ),
        "metric_column": str(
            metric_column
        ),
        "groups": _safe_dataframe_records(
            comparison.reset_index()
        ),
    }


# =========================================================
# CUSTOMER ANALYSIS
# =========================================================


def analyze_customers(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze customer-level performance.
    """

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
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze sales-oriented datasets.
    """

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

        result[
            "revenue_column"
        ] = str(
            revenue_column
        )

        result[
            "total_sales"
        ] = _safe_value(
            revenue.sum()
        )

        result[
            "average_sale"
        ] = _safe_value(
            revenue.mean()
        )

        result[
            "maximum_sale"
        ] = _safe_value(
            revenue.max()
        )

    if quantity_column:

        quantity = pd.to_numeric(
            df[quantity_column],
            errors="coerce",
        ).dropna()

        result[
            "quantity_column"
        ] = str(
            quantity_column
        )

        result[
            "total_quantity"
        ] = _safe_value(
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

        result[
            "top_products"
        ] = [
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
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze financial metrics when relevant columns exist.
    """

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

        result[
            "revenue"
        ] = _safe_value(
            revenue.sum()
        )

    if cost_column:

        costs = pd.to_numeric(
            df[cost_column],
            errors="coerce",
        ).dropna()

        result[
            "costs"
        ] = _safe_value(
            costs.sum()
        )

    if profit_column:

        profits = pd.to_numeric(
            df[profit_column],
            errors="coerce",
        ).dropna()

        result[
            "profit"
        ] = _safe_value(
            profits.sum()
        )

    if (
        revenue_column
        and cost_column
    ):

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

        result[
            "calculated_profit"
        ] = _safe_value(
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
# DASHBOARD RECOMMENDATION
# =========================================================


def analyze_dashboard(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Generate a deterministic dashboard blueprint.
    """

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

    # KPI cards

    for column in numeric_columns[
        :4
    ]:

        widgets.append(
            {
                "type": "kpi",
                "title": f"{column} Total",
                "metric": str(column),
            }
        )

    # Trend chart

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

    # Category chart

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

    # Data table

    widgets.append(
        {
            "type": "table",
            "title": "Dataset Records",
            "columns": [
                str(column)
                for column in df.columns[
                    :8
                ]
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


# =========================================================
# MAIN ANALYSIS DISPATCHER
# =========================================================


def analyze_dataset_request(
    df: pd.DataFrame,
    intent: str,
) -> dict[str, Any]:
    """
    Execute the correct deterministic analysis based
    on the classified user intent.
    """

    if df is None or df.empty:

        return {
            "analysis_type": intent,
            "success": False,
            "message": "No dataset is available for analysis.",
        }

    intent = (
        intent
        or "summary"
    ).lower().strip()

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