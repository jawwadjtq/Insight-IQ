"""
InsightIQ Analysis Engine

This module performs real dataset calculations for InsightIQ.

The AI decides WHAT the user wants.
This engine decides HOW to calculate it from the actual
uploaded Pandas DataFrame.

Supported analysis types:

- KPI analysis
- Ranking analysis
- Trend analysis
- Anomaly detection
- Data quality analysis
- Customer analysis
- Sales analysis
- Financial analysis
- Comparison analysis
- Dataset summary
- Recommendations
"""

from __future__ import annotations

from typing import Any

import math
import re

import numpy as np
import pandas as pd


# =========================================================
# GENERAL HELPERS
# =========================================================


def _safe_value(value: Any) -> Any:
    """
    Convert Pandas / NumPy values into JSON-safe Python values.
    """

    if value is None:
        return None

    if isinstance(value, (np.integer,)):
        return int(value)

    if isinstance(value, (np.floating,)):
        if np.isnan(value) or np.isinf(value):
            return None

        return float(value)

    if isinstance(value, (np.bool_,)):
        return bool(value)

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None

    return value


def _safe_dataframe_records(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Convert a dataframe into JSON-safe records.
    """

    records = df.to_dict(orient="records")

    safe_records = []

    for record in records:

        safe_record = {
            str(key): _safe_value(value)
            for key, value in record.items()
        }

        safe_records.append(safe_record)

    return safe_records


def _normalize_column_name(column: Any) -> str:
    """
    Normalize a column name for matching.
    """

    return re.sub(
        r"[^a-z0-9]+",
        "_",
        str(column).lower(),
    ).strip("_")


def _column_matches(column: str, keywords: list[str]) -> bool:
    """
    Determine whether a column name appears related to
    the supplied keywords.
    """

    normalized = _normalize_column_name(column)

    return any(
        keyword in normalized
        for keyword in keywords
    )


# =========================================================
# COLUMN DETECTION
# =========================================================


def detect_numeric_columns(
    df: pd.DataFrame,
) -> list[str]:
    """
    Return numeric columns.
    """

    return [
        str(column)
        for column in df.select_dtypes(
            include="number"
        ).columns
    ]


def detect_categorical_columns(
    df: pd.DataFrame,
) -> list[str]:
    """
    Return categorical / object columns.
    """

    return [
        str(column)
        for column in df.select_dtypes(
            include=[
                "object",
                "category",
                "bool",
            ]
        ).columns
    ]


def detect_datetime_columns(
    df: pd.DataFrame,
) -> list[str]:
    """
    Detect columns that are already datetime columns
    or appear to contain dates.
    """

    datetime_columns: list[str] = []

    for column in df.columns:

        series = df[column]

        if pd.api.types.is_datetime64_any_dtype(series):

            datetime_columns.append(str(column))
            continue

        if not (
            pd.api.types.is_object_dtype(series)
            or pd.api.types.is_string_dtype(series)
        ):
            continue

        sample = series.dropna().head(100)

        if sample.empty:
            continue

        try:

            parsed = pd.to_datetime(
                sample,
                errors="coerce",
            )

            valid_ratio = parsed.notna().mean()

            if valid_ratio >= 0.7:

                datetime_columns.append(
                    str(column)
                )

        except Exception:
            continue

    return datetime_columns


# =========================================================
# SEMANTIC COLUMN DETECTION
# =========================================================


def find_date_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Find the most likely date column.
    """

    datetime_columns = detect_datetime_columns(df)

    if not datetime_columns:
        return None

    preferred_keywords = [
        "date",
        "datetime",
        "timestamp",
        "time",
        "month",
        "year",
        "created",
        "updated",
        "order_date",
        "sale_date",
        "transaction_date",
    ]

    for column in datetime_columns:

        if _column_matches(
            column,
            preferred_keywords,
        ):
            return column

    return datetime_columns[0]


def find_customer_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Find a likely customer column.
    """

    keywords = [
        "customer",
        "client",
        "buyer",
        "customer_id",
        "client_id",
        "customer_name",
        "account",
    ]

    for column in df.columns:

        if _column_matches(
            str(column),
            keywords,
        ):
            return str(column)

    return None


def find_product_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Find a likely product column.
    """

    keywords = [
        "product",
        "item",
        "sku",
        "product_id",
        "product_name",
        "item_name",
    ]

    for column in df.columns:

        if _column_matches(
            str(column),
            keywords,
        ):
            return str(column)

    return None


def find_category_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Find a likely category column.
    """

    keywords = [
        "category",
        "segment",
        "type",
        "department",
        "group",
        "region",
        "country",
        "city",
        "state",
    ]

    for column in df.columns:

        if _column_matches(
            str(column),
            keywords,
        ):
            return str(column)

    return None


def find_sales_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Find the most likely sales / revenue column.
    """

    preferred_keywords = [
        "sales",
        "sale",
        "revenue",
        "amount",
        "total",
        "total_sales",
        "sales_amount",
        "revenue_amount",
        "net_sales",
        "gross_sales",
        "turnover",
    ]

    numeric_columns = detect_numeric_columns(df)

    for column in numeric_columns:

        if _column_matches(
            column,
            preferred_keywords,
        ):
            return column

    return None


def find_profit_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Find the most likely profit column.
    """

    keywords = [
        "profit",
        "net_profit",
        "gross_profit",
        "profit_amount",
        "margin",
    ]

    numeric_columns = detect_numeric_columns(df)

    for column in numeric_columns:

        if _column_matches(
            column,
            keywords,
        ):
            return column

    return None


def find_quantity_column(
    df: pd.DataFrame,
) -> str | None:
    """
    Find the most likely quantity column.
    """

    keywords = [
        "quantity",
        "qty",
        "units",
        "volume",
        "count",
    ]

    numeric_columns = detect_numeric_columns(df)

    for column in numeric_columns:

        if _column_matches(
            column,
            keywords,
        ):
            return column

    return None


# =========================================================
# COLUMN INFORMATION
# =========================================================


def get_column_profile(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Return useful information about dataset columns.
    """

    profile = {}

    for column in df.columns:

        series = df[column]

        profile[str(column)] = {
            "dtype": str(series.dtype),
            "missing": int(series.isna().sum()),
            "unique_values": int(
                series.nunique(dropna=True)
            ),
            "sample_values": [
                _safe_value(value)
                for value in series.dropna().head(5).tolist()
            ],
        }

    return profile


# =========================================================
# DATASET SUMMARY
# =========================================================


def analyze_summary(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Generate a general dataset summary.
    """

    numeric_columns = detect_numeric_columns(df)
    categorical_columns = detect_categorical_columns(df)
    datetime_columns = detect_datetime_columns(df)

    missing_total = int(
        df.isna().sum().sum()
    )

    duplicate_rows = int(
        df.duplicated().sum()
    )

    total_cells = (
        df.shape[0] * df.shape[1]
    )

    if total_cells:

        missing_percentage = (
            missing_total / total_cells
        ) * 100

    else:

        missing_percentage = 0

    quality_score = max(
        0,
        100
        - missing_percentage
        - (
            duplicate_rows
            / max(len(df), 1)
            * 20
        ),
    )

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": [
            str(column)
            for column in df.columns
        ],
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "datetime_columns": datetime_columns,
        "missing_values": missing_total,
        "missing_percentage": round(
            missing_percentage,
            2,
        ),
        "duplicate_rows": duplicate_rows,
        "quality_score": round(
            quality_score,
            2,
        ),
        "column_profile": get_column_profile(df),
    }


# =========================================================
# KPI ANALYSIS
# =========================================================


def analyze_kpis(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Calculate important numeric KPIs.
    """

    numeric_columns = detect_numeric_columns(df)

    kpis: dict[str, Any] = {}

    for column in numeric_columns:

        series = pd.to_numeric(
            df[column],
            errors="coerce",
        ).dropna()

        if series.empty:
            continue

        kpis[column] = {
            "sum": _safe_value(
                series.sum()
            ),
            "average": _safe_value(
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

    sales_column = find_sales_column(df)
    profit_column = find_profit_column(df)

    business_kpis = {}

    if sales_column:

        business_kpis["total_sales"] = _safe_value(
            pd.to_numeric(
                df[sales_column],
                errors="coerce",
            ).sum()
        )

        business_kpis["average_sales"] = _safe_value(
            pd.to_numeric(
                df[sales_column],
                errors="coerce",
            ).mean()
        )

    if profit_column:

        business_kpis["total_profit"] = _safe_value(
            pd.to_numeric(
                df[profit_column],
                errors="coerce",
            ).sum()
        )

        business_kpis["average_profit"] = _safe_value(
            pd.to_numeric(
                df[profit_column],
                errors="coerce",
            ).mean()
        )

    return {
        "numeric_kpis": kpis,
        "business_kpis": business_kpis,
        "detected_sales_column": sales_column,
        "detected_profit_column": profit_column,
    }


# =========================================================
# RANKING ANALYSIS
# =========================================================


def analyze_ranking(
    df: pd.DataFrame,
    column: str | None = None,
    metric: str | None = None,
    limit: int = 10,
    ascending: bool = False,
) -> dict[str, Any]:
    """
    Find top/bottom entities.

    Example:

    Top 10 customers by sales.
    Top 10 products by revenue.
    Bottom 5 regions by profit.
    """

    if limit < 1:
        limit = 10

    if limit > 100:
        limit = 100

    if column is None:

        column = (
            find_customer_column(df)
            or find_product_column(df)
            or find_category_column(df)
        )

    if metric is None:

        metric = (
            find_sales_column(df)
            or find_profit_column(df)
        )

    if column is None:

        return {
            "success": False,
            "message": (
                "Could not identify an entity column "
                "for ranking."
            ),
        }

    if metric is None:

        return {
            "success": False,
            "message": (
                "Could not identify a numeric metric "
                "for ranking."
            ),
        }

    if column not in df.columns:

        return {
            "success": False,
            "message": f"Column '{column}' was not found.",
        }

    if metric not in df.columns:

        return {
            "success": False,
            "message": f"Column '{metric}' was not found.",
        }

    working = df.copy()

    working[metric] = pd.to_numeric(
        working[metric],
        errors="coerce",
    )

    working = working.dropna(
        subset=[column, metric]
    )

    grouped = (
        working.groupby(column)[metric]
        .sum()
        .reset_index()
    )

    grouped = grouped.sort_values(
        metric,
        ascending=ascending,
    ).head(limit)

    return {
        "success": True,
        "entity_column": column,
        "metric_column": metric,
        "limit": limit,
        "ascending": ascending,
        "results": _safe_dataframe_records(
            grouped
        ),
    }


# =========================================================
# TREND ANALYSIS
# =========================================================


def analyze_trend(
    df: pd.DataFrame,
    date_column: str | None = None,
    metric_column: str | None = None,
    frequency: str = "M",
) -> dict[str, Any]:
    """
    Analyze a metric over time.
    """

    if date_column is None:
        date_column = find_date_column(df)

    if metric_column is None:
        metric_column = find_sales_column(df)

    if date_column is None:

        return {
            "success": False,
            "message": (
                "No date column could be identified."
            ),
        }

    if metric_column is None:

        return {
            "success": False,
            "message": (
                "No numeric metric could be identified."
            ),
        }

    if (
        date_column not in df.columns
        or metric_column not in df.columns
    ):

        return {
            "success": False,
            "message": "Requested columns were not found.",
        }

    working = df[
        [
            date_column,
            metric_column,
        ]
    ].copy()

    working[date_column] = pd.to_datetime(
        working[date_column],
        errors="coerce",
    )

    working[metric_column] = pd.to_numeric(
        working[metric_column],
        errors="coerce",
    )

    working = working.dropna()

    if working.empty:

        return {
            "success": False,
            "message": (
                "No valid date/metric values were available."
            ),
        }

    working = working.set_index(
        date_column
    )

    trend = (
        working[metric_column]
        .resample(frequency)
        .sum()
        .reset_index()
    )

    if len(trend) >= 2:

        first_value = float(
            trend.iloc[0][metric_column]
        )

        last_value = float(
            trend.iloc[-1][metric_column]
        )

        if first_value != 0:

            growth_percentage = (
                (
                    last_value
                    - first_value
                )
                / abs(first_value)
            ) * 100

        else:

            growth_percentage = None

    else:

        growth_percentage = None

    return {
        "success": True,
        "date_column": date_column,
        "metric_column": metric_column,
        "frequency": frequency,
        "growth_percentage": _safe_value(
            growth_percentage
        ),
        "results": _safe_dataframe_records(
            trend
        ),
    }


# =========================================================
# ANOMALY ANALYSIS
# =========================================================


def analyze_anomalies(
    df: pd.DataFrame,
    column: str | None = None,
) -> dict[str, Any]:
    """
    Detect statistical outliers using the IQR method.
    """

    if column is None:

        column = find_sales_column(df)

    if column is None:

        numeric_columns = detect_numeric_columns(df)

        if numeric_columns:
            column = numeric_columns[0]

    if column is None:

        return {
            "success": False,
            "message": (
                "No numeric column was available "
                "for anomaly detection."
            ),
        }

    if column not in df.columns:

        return {
            "success": False,
            "message": f"Column '{column}' was not found.",
        }

    working = df.copy()

    values = pd.to_numeric(
        working[column],
        errors="coerce",
    )

    valid_values = values.dropna()

    if valid_values.empty:

        return {
            "success": False,
            "message": (
                "No valid numeric values were found."
            ),
        }

    q1 = valid_values.quantile(0.25)
    q3 = valid_values.quantile(0.75)

    iqr = q3 - q1

    lower_bound = q1 - (
        1.5 * iqr
    )

    upper_bound = q3 + (
        1.5 * iqr
    )

    mask = (
        values < lower_bound
    ) | (
        values > upper_bound
    )

    anomalies = working.loc[
        mask
    ].copy()

    anomalies["anomaly_value"] = values.loc[
        anomalies.index
    ]

    return {
        "success": True,
        "column": column,
        "method": "IQR",
        "q1": _safe_value(q1),
        "q3": _safe_value(q3),
        "iqr": _safe_value(iqr),
        "lower_bound": _safe_value(
            lower_bound
        ),
        "upper_bound": _safe_value(
            upper_bound
        ),
        "anomaly_count": int(
            len(anomalies)
        ),
        "results": _safe_dataframe_records(
            anomalies.head(100)
        ),
    }


# =========================================================
# DATA QUALITY ANALYSIS
# =========================================================


def analyze_data_quality(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze missing values, duplicates and column quality.
    """

    missing_by_column = {}

    for column in df.columns:

        missing = int(
            df[column].isna().sum()
        )

        if missing > 0:

            missing_by_column[
                str(column)
            ] = missing

    duplicate_count = int(
        df.duplicated().sum()
    )

    unique_counts = {
        str(column): int(
            df[column].nunique(
                dropna=True
            )
        )
        for column in df.columns
    }

    return {
        "success": True,
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "missing_total": int(
            df.isna().sum().sum()
        ),
        "missing_by_column": (
            missing_by_column
        ),
        "duplicate_rows": duplicate_count,
        "unique_counts": unique_counts,
        "completely_empty_columns": [
            str(column)
            for column in df.columns
            if df[column].isna().all()
        ],
        "constant_columns": [
            str(column)
            for column in df.columns
            if df[column].nunique(
                dropna=False
            ) <= 1
        ],
    }


# =========================================================
# CUSTOMER ANALYSIS
# =========================================================


def analyze_customers(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze customers using available customer and
    sales-related columns.
    """

    customer_column = find_customer_column(df)
    metric_column = find_sales_column(df)

    if customer_column is None:

        return {
            "success": False,
            "message": (
                "No customer column could be identified."
            ),
        }

    if metric_column is None:

        return {
            "success": False,
            "message": (
                "No sales/revenue column could be identified."
            ),
        }

    working = df[
        [
            customer_column,
            metric_column,
        ]
    ].copy()

    working[metric_column] = pd.to_numeric(
        working[metric_column],
        errors="coerce",
    )

    working = working.dropna()

    customer_summary = (
        working.groupby(
            customer_column
        )[metric_column]
        .agg(
            [
                "sum",
                "mean",
                "count",
            ]
        )
        .reset_index()
    )

    customer_summary = customer_summary.rename(
        columns={
            "sum": "total_value",
            "mean": "average_value",
            "count": "transactions",
        }
    )

    customer_summary = customer_summary.sort_values(
        "total_value",
        ascending=False,
    )

    return {
        "success": True,
        "customer_column": customer_column,
        "metric_column": metric_column,
        "customer_count": int(
            customer_summary[
                customer_column
            ].nunique()
        ),
        "top_customers": _safe_dataframe_records(
            customer_summary.head(20)
        ),
    }


# =========================================================
# SALES ANALYSIS
# =========================================================


def analyze_sales(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze sales performance.
    """

    sales_column = find_sales_column(df)
    date_column = find_date_column(df)
    product_column = find_product_column(df)
    category_column = find_category_column(df)

    if sales_column is None:

        return {
            "success": False,
            "message": (
                "No sales or revenue column "
                "could be identified."
            ),
        }

    sales = pd.to_numeric(
        df[sales_column],
        errors="coerce",
    )

    result = {
        "success": True,
        "sales_column": sales_column,
        "total_sales": _safe_value(
            sales.sum()
        ),
        "average_sale": _safe_value(
            sales.mean()
        ),
        "highest_sale": _safe_value(
            sales.max()
        ),
        "lowest_sale": _safe_value(
            sales.min()
        ),
    }

    if product_column:

        product_sales = (
            pd.DataFrame(
                {
                    product_column:
                        df[product_column],
                    sales_column:
                        sales,
                }
            )
            .dropna()
            .groupby(product_column)[
                sales_column
            ]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(10)
            .reset_index()
        )

        result["top_products"] = (
            _safe_dataframe_records(
                product_sales
            )
        )

    if category_column:

        category_sales = (
            pd.DataFrame(
                {
                    category_column:
                        df[category_column],
                    sales_column:
                        sales,
                }
            )
            .dropna()
            .groupby(category_column)[
                sales_column
            ]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(10)
            .reset_index()
        )

        result["top_categories"] = (
            _safe_dataframe_records(
                category_sales
            )
        )

    if date_column:

        trend = analyze_trend(
            df,
            date_column=date_column,
            metric_column=sales_column,
        )

        result["trend"] = trend

    return result


# =========================================================
# FINANCIAL ANALYSIS
# =========================================================


def analyze_financials(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Analyze financial performance.
    """

    sales_column = find_sales_column(df)
    profit_column = find_profit_column(df)

    numeric_columns = detect_numeric_columns(df)

    if (
        sales_column is None
        and profit_column is None
    ):

        return {
            "success": False,
            "message": (
                "No sales, revenue, profit, "
                "or financial numeric columns "
                "could be identified."
            ),
        }

    result: dict[str, Any] = {
        "success": True,
        "sales_column": sales_column,
        "profit_column": profit_column,
    }

    if sales_column:

        sales = pd.to_numeric(
            df[sales_column],
            errors="coerce",
        )

        result["total_revenue"] = _safe_value(
            sales.sum()
        )

        result["average_revenue"] = _safe_value(
            sales.mean()
        )

    if profit_column:

        profit = pd.to_numeric(
            df[profit_column],
            errors="coerce",
        )

        result["total_profit"] = _safe_value(
            profit.sum()
        )

        result["average_profit"] = _safe_value(
            profit.mean()
        )

        if sales_column:

            sales = pd.to_numeric(
                df[sales_column],
                errors="coerce",
            )

            total_sales = sales.sum()

            total_profit = profit.sum()

            if total_sales != 0:

                result["profit_margin_percentage"] = (
                    float(
                        total_profit
                        / total_sales
                        * 100
                    )
                )

    result["financial_numeric_columns"] = (
        numeric_columns
    )

    return result


# =========================================================
# COMPARISON ANALYSIS
# =========================================================


def analyze_comparison(
    df: pd.DataFrame,
    column: str | None = None,
    metric: str | None = None,
) -> dict[str, Any]:
    """
    Compare groups using a categorical column and
    numeric metric.
    """

    if column is None:
        column = find_category_column(df)

    if metric is None:
        metric = find_sales_column(df)

    if column is None or metric is None:

        return {
            "success": False,
            "message": (
                "A comparison requires a categorical "
                "column and numeric metric."
            ),
        }

    if (
        column not in df.columns
        or metric not in df.columns
    ):

        return {
            "success": False,
            "message": "Comparison columns were not found.",
        }

    working = df[
        [
            column,
            metric,
        ]
    ].copy()

    working[metric] = pd.to_numeric(
        working[metric],
        errors="coerce",
    )

    working = working.dropna()

    comparison = (
        working.groupby(column)[metric]
        .agg(
            [
                "sum",
                "mean",
                "count",
            ]
        )
        .reset_index()
    )

    comparison = comparison.rename(
        columns={
            "sum": "total",
            "mean": "average",
            "count": "records",
        }
    )

    comparison = comparison.sort_values(
        "total",
        ascending=False,
    )

    return {
        "success": True,
        "group_column": column,
        "metric_column": metric,
        "results": _safe_dataframe_records(
            comparison
        ),
    }


# =========================================================
# RECOMMENDATIONS
# =========================================================


def generate_recommendations(
    df: pd.DataFrame,
) -> dict[str, Any]:
    """
    Generate rule-based recommendations from actual
    dataset characteristics.
    """

    recommendations: list[str] = []

    quality = analyze_data_quality(df)

    if quality["missing_total"] > 0:

        recommendations.append(
            "Review columns containing missing values "
            "before performing critical analysis."
        )

    if quality["duplicate_rows"] > 0:

        recommendations.append(
            "Investigate duplicate rows and remove "
            "duplicates where they represent repeated records."
        )

    anomaly_column = find_sales_column(df)

    if anomaly_column:

        anomaly_result = analyze_anomalies(
            df,
            anomaly_column,
        )

        if (
            anomaly_result.get(
                "success"
            )
            and anomaly_result.get(
                "anomaly_count",
                0,
            )
            > 0
        ):

            recommendations.append(
                f"Investigate unusual values in "
                f"'{anomaly_column}' because potential "
                f"outliers were detected."
            )

    date_column = find_date_column(df)

    if date_column:

        recommendations.append(
            f"Use '{date_column}' for time-based "
            "trend analysis and performance monitoring."
        )

    sales_column = find_sales_column(df)

    if sales_column:

        recommendations.append(
            f"Track '{sales_column}' as a core "
            "business performance metric."
        )

    if not recommendations:

        recommendations.append(
            "The dataset appears structurally suitable "
            "for further exploratory analysis."
        )

    return {
        "success": True,
        "recommendations": recommendations,
    }


# =========================================================
# MASTER ANALYSIS FUNCTION
# =========================================================


def run_analysis(
    df: pd.DataFrame,
    intent: str,
) -> dict[str, Any]:
    """
    Main entry point for InsightIQ analysis.

    The AI classifier determines the intent.
    This function executes the corresponding real
    dataset analysis.
    """

    if df is None:

        return {
            "success": False,
            "message": "No dataset is available.",
        }

    if df.empty:

        return {
            "success": False,
            "message": "The dataset is empty.",
        }

    intent = (
        intent
        or "summary"
    ).lower().strip()

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    if intent == "summary":

        return analyze_summary(df)

    # -----------------------------------------------------
    # KPI
    # -----------------------------------------------------

    if intent == "kpi":

        return analyze_kpis(df)

    # -----------------------------------------------------
    # RANKING
    # -----------------------------------------------------

    if intent == "ranking":

        return analyze_ranking(df)

    # -----------------------------------------------------
    # TREND
    # -----------------------------------------------------

    if intent == "trend":

        return analyze_trend(df)

    # -----------------------------------------------------
    # ANOMALY
    # -----------------------------------------------------

    if intent == "anomaly":

        return analyze_anomalies(df)

    # -----------------------------------------------------
    # DATA QUALITY
    # -----------------------------------------------------

    if intent == "data_quality":

        return analyze_data_quality(df)

    # -----------------------------------------------------
    # CUSTOMER ANALYSIS
    # -----------------------------------------------------

    if intent == "customer_analysis":

        return analyze_customers(df)

    # -----------------------------------------------------
    # SALES ANALYSIS
    # -----------------------------------------------------

    if intent == "sales_analysis":

        return analyze_sales(df)

    # -----------------------------------------------------
    # FINANCIAL ANALYSIS
    # -----------------------------------------------------

    if intent == "financial_analysis":

        return analyze_financials(df)

    # -----------------------------------------------------
    # COMPARISON
    # -----------------------------------------------------

    if intent == "comparison":

        return analyze_comparison(df)

    # -----------------------------------------------------
    # RECOMMENDATIONS
    # -----------------------------------------------------

    if intent == "recommendation":

        return generate_recommendations(df)

    # -----------------------------------------------------
    # DASHBOARD
    # -----------------------------------------------------

    if intent == "dashboard":

        return {
            "success": True,
            "dashboard": {
                "summary": analyze_summary(df),
                "kpis": analyze_kpis(df),
                "sales": analyze_sales(df),
                "quality": analyze_data_quality(df),
            },
        }

    # -----------------------------------------------------
    # REPORT
    # -----------------------------------------------------

    if intent == "report":

        return {
            "success": True,
            "requires_ai_report": True,
            "analysis": {
                "summary": analyze_summary(df),
                "kpis": analyze_kpis(df),
                "quality": analyze_data_quality(df),
                "sales": analyze_sales(df),
                "financials": analyze_financials(df),
            },
        }

    # -----------------------------------------------------
    # FALLBACK
    # -----------------------------------------------------

    return analyze_summary(df)