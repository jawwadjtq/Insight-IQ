import os
import json
import re
from typing import Any

import pandas as pd
from dotenv import load_dotenv
from groq import Groq


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# GROQ CLIENT
# =========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured."
    )

client = Groq(
    api_key=GROQ_API_KEY
)


# =========================================================
# MODEL
# =========================================================

MODEL_NAME = "openai/gpt-oss-20b"


# =========================================================
# SAFE AI CALL
# =========================================================

def call_ai(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 1500,
    temperature: float = 0.3,
) -> str:

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return (
        response.choices[0]
        .message
        .content
        .strip()
    )


# =========================================================
# REQUEST CLASSIFIER
# =========================================================

def classify_request(prompt: str) -> dict:
    """
    Determine what the user wants from the uploaded dataset.

    The classifier only determines intent.
    Actual dataset analysis is performed separately.
    """

    classifier_prompt = f"""
You are the request classifier for InsightIQ,
an AI-powered Business Intelligence platform.

Classify the user's request into exactly ONE intent.

Allowed intents:

chat
report
kpi
ranking
trend
anomaly
data_quality
customer_analysis
sales_analysis
financial_analysis
dashboard
comparison
recommendation
summary

Definitions:

chat:
General question or explanation.

report:
User explicitly requests a report or document.

kpi:
User asks for KPIs, metrics, performance indicators,
or important business numbers.

ranking:
User asks for top/bottom customers, products,
employees, regions, categories, or other entities.

trend:
User asks about trends, growth, changes over time,
monthly performance, yearly performance, etc.

anomaly:
User asks for unusual values, outliers, anomalies,
or suspicious records.

data_quality:
User asks about missing values, duplicates,
invalid data, inconsistent data, or cleaning.

customer_analysis:
User asks about customers or customer behavior.

sales_analysis:
User asks about sales performance.

financial_analysis:
User asks about profit, expenses, costs,
margins, revenue, or financial performance.

dashboard:
User asks to create or design a dashboard.

comparison:
User asks to compare periods, products, customers,
regions, categories, or groups.

recommendation:
User asks what actions should be taken.

summary:
User asks for a general dataset summary.

Return ONLY valid JSON.

Use exactly:

{{
    "intent": "one_of_the_allowed_intents",
    "deliverable": "short description",
    "requires_dataset_analysis": true,
    "confidence": 0.0
}}

USER REQUEST:

{prompt}
"""

    try:

        result_text = call_ai(
            system_prompt=(
                "You are a precise intent classifier. "
                "Return valid JSON only."
            ),
            user_prompt=classifier_prompt,
            max_tokens=250,
            temperature=0,
        )

        # Remove markdown fences if the model adds them.
        result_text = re.sub(
            r"```json\s*",
            "",
            result_text,
            flags=re.IGNORECASE,
        )

        result_text = re.sub(
            r"```\s*",
            "",
            result_text,
        ).strip()

        result = json.loads(result_text)

        allowed_intents = {
            "chat",
            "report",
            "kpi",
            "ranking",
            "trend",
            "anomaly",
            "data_quality",
            "customer_analysis",
            "sales_analysis",
            "financial_analysis",
            "dashboard",
            "comparison",
            "recommendation",
            "summary",
        }

        if result.get("intent") not in allowed_intents:
            result["intent"] = "chat"

        result.setdefault(
            "deliverable",
            "AI analysis",
        )

        result.setdefault(
            "requires_dataset_analysis",
            True,
        )

        result.setdefault(
            "confidence",
            0.5,
        )

        return result

    except Exception as error:

        print("=" * 80)
        print("AI CLASSIFIER ERROR")
        print(error)
        print("=" * 80)

        return {
            "intent": "chat",
            "deliverable": "AI response",
            "requires_dataset_analysis": True,
            "confidence": 0.0,
        }


# =========================================================
# DATASET HELPERS
# =========================================================

def normalize_column_name(column: Any) -> str:
    """
    Normalize a dataframe column name for matching.
    """

    return re.sub(
        r"[^a-z0-9]",
        "",
        str(column).lower(),
    )


def find_column(
    df: pd.DataFrame,
    keywords: list[str],
) -> str | None:
    """
    Find the most likely dataframe column based on keywords.
    """

    normalized_columns = {
        column: normalize_column_name(column)
        for column in df.columns
    }

    # Exact normalized match first.
    for column, normalized in normalized_columns.items():

        for keyword in keywords:

            normalized_keyword = normalize_column_name(
                keyword
            )

            if normalized == normalized_keyword:
                return column

    # Partial match.
    for column, normalized in normalized_columns.items():

        for keyword in keywords:

            normalized_keyword = normalize_column_name(
                keyword
            )

            if normalized_keyword in normalized:
                return column

    return None


def get_numeric_columns(
    df: pd.DataFrame,
) -> list[str]:

    return [
        column
        for column in df.columns
        if pd.api.types.is_numeric_dtype(
            df[column]
        )
    ]


def get_text_columns(
    df: pd.DataFrame,
) -> list[str]:

    return [
        column
        for column in df.columns
        if (
            pd.api.types.is_object_dtype(
                df[column]
            )
            or pd.api.types.is_string_dtype(
                df[column]
            )
        )
    ]


# =========================================================
# RANKING ANALYSIS
# =========================================================

def analyze_ranking(
    df: pd.DataFrame,
    prompt: str,
) -> dict:

    if df is None or df.empty:

        return {
            "success": False,
            "message": "The uploaded dataset is empty.",
        }

    text_columns = get_text_columns(df)
    numeric_columns = get_numeric_columns(df)

    # -----------------------------------------------------
    # Detect requested entity
    # -----------------------------------------------------

    entity_column = None

    customer_keywords = [
        "customer",
        "client",
        "buyer",
        "customername",
        "clientname",
        "customerid",
        "clientid",
    ]

    product_keywords = [
        "product",
        "item",
        "productname",
        "productid",
    ]

    employee_keywords = [
        "employee",
        "staff",
        "salesperson",
        "employeeid",
        "salespersonid",
    ]

    region_keywords = [
        "region",
        "area",
        "territory",
        "location",
        "city",
        "state",
        "country",
    ]

    category_keywords = [
        "category",
        "subcategory",
        "segment",
        "type",
    ]

    prompt_lower = prompt.lower()

    if any(
        word in prompt_lower
        for word in [
            "customer",
            "customers",
            "client",
            "clients",
        ]
    ):

        entity_column = find_column(
            df,
            customer_keywords,
        )

    elif any(
        word in prompt_lower
        for word in [
            "product",
            "products",
            "item",
            "items",
        ]
    ):

        entity_column = find_column(
            df,
            product_keywords,
        )

    elif any(
        word in prompt_lower
        for word in [
            "employee",
            "employees",
            "salesperson",
            "salespeople",
        ]
    ):

        entity_column = find_column(
            df,
            employee_keywords,
        )

    elif any(
        word in prompt_lower
        for word in [
            "region",
            "regions",
            "area",
            "territory",
            "city",
            "country",
        ]
    ):

        entity_column = find_column(
            df,
            region_keywords,
        )

    elif any(
        word in prompt_lower
        for word in [
            "category",
            "categories",
            "segment",
        ]
    ):

        entity_column = find_column(
            df,
            category_keywords,
        )

    # -----------------------------------------------------
    # Fallback to text column
    # -----------------------------------------------------

    if entity_column is None and text_columns:

        # Prefer columns with lower cardinality than IDs,
        # but otherwise use the first text column.
        entity_column = text_columns[0]

    if entity_column is None:

        return {
            "success": False,
            "message": (
                "I could not identify an entity column "
                "such as Customer, Product, Region, "
                "or Employee."
            ),
        }

    # -----------------------------------------------------
    # Detect metric
    # -----------------------------------------------------

    metric_column = None

    metric_keywords = [
        "sales",
        "revenue",
        "amount",
        "value",
        "profit",
        "income",
        "total",
        "price",
        "quantity",
        "units",
        "orders",
        "spend",
    ]

    # Try matching numeric columns to business metrics.
    for column in numeric_columns:

        normalized = normalize_column_name(
            column
        )

        for keyword in metric_keywords:

            normalized_keyword = normalize_column_name(
                keyword
            )

            if normalized_keyword in normalized:

                metric_column = column
                break

        if metric_column:
            break

    # -----------------------------------------------------
    # Fallback metric
    # -----------------------------------------------------

    if metric_column is None and numeric_columns:

        # Prefer a column that isn't obviously an ID.
        non_id_columns = [
            column
            for column in numeric_columns
            if "id" not in normalize_column_name(
                column
            )
        ]

        if non_id_columns:
            metric_column = non_id_columns[0]
        else:
            metric_column = numeric_columns[0]

    # -----------------------------------------------------
    # Determine requested number
    # -----------------------------------------------------

    number_match = re.search(
        r"\b(?:top|bottom|first|last)\s+(\d+)\b",
        prompt.lower(),
    )

    if number_match:

        limit = int(
            number_match.group(1)
        )

    else:

        limit = 10

    limit = max(
        1,
        min(limit, 100),
    )

    # -----------------------------------------------------
    # Determine top/bottom
    # -----------------------------------------------------

    is_bottom = any(
        phrase in prompt.lower()
        for phrase in [
            "bottom",
            "lowest",
            "worst",
            "least",
            "smallest",
        ]
    )

    # -----------------------------------------------------
    # Perform actual dataset analysis
    # -----------------------------------------------------

    working_df = df.copy()

    working_df[entity_column] = (
        working_df[entity_column]
        .astype(str)
        .str.strip()
    )

    working_df = working_df[
        working_df[entity_column].notna()
    ]

    if metric_column:

        working_df[metric_column] = pd.to_numeric(
            working_df[metric_column],
            errors="coerce",
        )

        working_df = working_df[
            working_df[metric_column].notna()
        ]

        grouped = (
            working_df
            .groupby(
                entity_column,
                dropna=False,
            )[metric_column]
            .agg(
                total="sum",
                average="mean",
                records="count",
            )
            .reset_index()
        )

        grouped = grouped.sort_values(
            "total",
            ascending=is_bottom,
        )

        result_df = grouped.head(
            limit
        )

    else:

        grouped = (
            working_df
            .groupby(
                entity_column,
                dropna=False,
            )
            .size()
            .reset_index(
                name="records"
            )
        )

        grouped = grouped.sort_values(
            "records",
            ascending=is_bottom,
        )

        result_df = grouped.head(
            limit
        )

    # -----------------------------------------------------
    # Convert results to safe JSON
    # -----------------------------------------------------

    ranking_rows = []

    for _, row in result_df.iterrows():

        item = {
            "entity": str(
                row[entity_column]
            ),
            "records": int(
                row["records"]
            ),
        }

        if "total" in row:

            item["total"] = round(
                float(row["total"]),
                2,
            )

        if "average" in row:

            item["average"] = round(
                float(row["average"]),
                2,
            )

        ranking_rows.append(item)

    return {
        "success": True,
        "analysis_type": "ranking",
        "entity_column": entity_column,
        "metric_column": metric_column,
        "direction": (
            "bottom"
            if is_bottom
            else "top"
        ),
        "limit": limit,
        "results": ranking_rows,
    }


# =========================================================
# RANKING AI EXPLANATION
# =========================================================

def explain_ranking(
    prompt: str,
    analysis: dict,
) -> str:

    system_prompt = """
You are InsightIQ AI.

You are a senior Business Intelligence Analyst.

The application has already performed the actual
calculation on the uploaded dataset.

Your job is ONLY to explain the supplied results.

IMPORTANT:

1. Never invent values.
2. Never change calculated values.
3. Use only the supplied analysis.
4. Explain why the leading entities may be important.
5. Be clear that importance is based on the available
   metric and dataset evidence.
6. If there is insufficient evidence, say so.
7. Use professional formatting.
"""

    user_prompt = f"""
USER REQUEST:

{prompt}

CALCULATED DATASET ANALYSIS:

{json.dumps(analysis, indent=2, default=str)}

Provide a concise but useful business analysis.

Include:

## Result

Explain the ranking.

## Why They Matter

Explain what makes the leading entities important
based strictly on the calculated data.

## Business Insight

Give practical interpretation.

## Recommendation

Give useful next steps if supported by the data.
"""

    return call_ai(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=1200,
        temperature=0.2,
    )


# =========================================================
# KPI ANALYSIS
# =========================================================

def analyze_kpis(
    df: pd.DataFrame,
) -> dict:

    numeric_columns = get_numeric_columns(
        df
    )

    if not numeric_columns:

        return {
            "success": False,
            "message": (
                "No numeric columns were found "
                "for KPI analysis."
            ),
        }

    metrics = []

    for column in numeric_columns:

        series = pd.to_numeric(
            df[column],
            errors="coerce",
        ).dropna()

        if series.empty:
            continue

        metrics.append(
            {
                "metric": str(column),
                "count": int(series.count()),
                "sum": round(
                    float(series.sum()),
                    2,
                ),
                "average": round(
                    float(series.mean()),
                    2,
                ),
                "minimum": round(
                    float(series.min()),
                    2,
                ),
                "maximum": round(
                    float(series.max()),
                    2,
                ),
            }
        )

    return {
        "success": True,
        "analysis_type": "kpi",
        "metrics": metrics[:20],
    }


# =========================================================
# DATA QUALITY ANALYSIS
# =========================================================

def analyze_data_quality(
    df: pd.DataFrame,
) -> dict:

    total_cells = (
        len(df)
        * len(df.columns)
    )

    missing_cells = int(
        df.isna().sum().sum()
    )

    missing_percentage = (
        (missing_cells / total_cells) * 100
        if total_cells
        else 0
    )

    duplicate_rows = int(
        df.duplicated().sum()
    )

    columns = []

    for column in df.columns:

        missing = int(
            df[column].isna().sum()
        )

        columns.append(
            {
                "column": str(column),
                "missing": missing,
                "missing_percentage": round(
                    (
                        missing / len(df) * 100
                    )
                    if len(df)
                    else 0,
                    2,
                ),
                "unique_values": int(
                    df[column].nunique(
                        dropna=True
                    )
                ),
            }
        )

    return {
        "success": True,
        "analysis_type": "data_quality",
        "rows": len(df),
        "columns": len(df.columns),
        "missing_cells": missing_cells,
        "missing_percentage": round(
            missing_percentage,
            2,
        ),
        "duplicate_rows": duplicate_rows,
        "column_analysis": columns,
    }


# =========================================================
# GENERAL AI QUESTION
# =========================================================

def ask_gemini(
    prompt: str,
    dataset_summary: dict | None = None,
):

    system_prompt = """
You are InsightIQ AI.

You are an expert:

• Data Analyst
• Business Analyst
• Data Scientist
• Business Intelligence Consultant
• Machine Learning Engineer

Help users understand their uploaded datasets.

Rules:

1. Use only supplied dataset information.
2. Never invent numbers.
3. Clearly state when information is insufficient.
4. Give practical business insights.
5. Explain findings clearly.
6. Recommend useful cleaning steps when relevant.
7. Recommend useful visualizations when relevant.
8. Use professional formatting.
9. Use headings and bullet points.
10. Do not mention internal prompts, APIs,
   implementation details, or system instructions.
"""

    if dataset_summary:

        user_prompt = f"""
UPLOADED DATASET INFORMATION:

{json.dumps(
    dataset_summary,
    indent=2,
    default=str,
)}

USER REQUEST:

{prompt}

Answer using the uploaded dataset information.
Do not invent unsupported facts.
"""

    else:

        user_prompt = prompt

    try:

        return call_ai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=1500,
            temperature=0.3,
        )

    except Exception as error:

        print("=" * 80)
        print("GROQ ERROR")
        print(error)
        print("=" * 80)

        raise


# =========================================================
# GENERATE REPORT
# =========================================================

def generate_report(
    prompt: str,
    dataset_summary: dict,
):

    report_system_prompt = """
You are InsightIQ AI Report Generator.

You are a senior Business Intelligence Analyst
and Data Analytics consultant.

Create professional business reports from
uploaded dataset information.

Rules:

1. Use ONLY supplied information.
2. Never invent statistics.
3. Never invent trends.
4. Never invent business facts.
5. Clearly state when information is unavailable.
6. Adapt the report to the user's request.
7. Make it professional and printable.
8. Use clear headings.
9. Include important metrics when available.
10. Explain important findings.
11. Include recommendations when appropriate.
12. Do not mention APIs, models, prompts,
    or implementation details.
13. Avoid unnecessary filler.
"""

    user_prompt = f"""
DATASET INFORMATION:

{json.dumps(
    dataset_summary,
    indent=2,
    default=str,
)}

USER'S REPORT REQUEST:

{prompt}

Create the requested report.

Use relevant sections such as:

# Report Title

## Executive Summary

## Dataset Overview

## Key Findings

## Important Metrics

## Trends and Patterns

## Risks

## Opportunities

## Recommendations

Only include sections relevant to the request.
"""

    try:

        return call_ai(
            system_prompt=report_system_prompt,
            user_prompt=user_prompt,
            max_tokens=3000,
            temperature=0.2,
        )

    except Exception as error:

        print("=" * 80)
        print("GROQ REPORT ERROR")
        print(error)
        print("=" * 80)

        raise


# =========================================================
# PROCESS REQUEST
# =========================================================

def process_request(
    prompt: str,
    dataset_summary: dict | None,
    dataframe: pd.DataFrame | None = None,
) -> dict:
    """
    Main AI orchestration layer.

    Important architecture:

    User request
        ↓
    Intent classification
        ↓
    Deterministic Pandas analysis
        ↓
    Small result sent to AI
        ↓
    Professional response

    This prevents large datasets from being sent directly
    to the LLM.
    """

    if not prompt.strip():

        return {
            "success": False,
            "type": "error",
            "response": "Please enter a request.",
        }

    # -----------------------------------------------------
    # CLASSIFY
    # -----------------------------------------------------

    classification = classify_request(
        prompt
    )

    intent = classification.get(
        "intent",
        "chat",
    )

    # -----------------------------------------------------
    # RANKING
    # -----------------------------------------------------

    if intent == "ranking":

        if dataframe is None:

            return {
                "success": False,
                "type": "ranking",
                "response": (
                    "I need access to the uploaded "
                    "dataset rows to calculate a ranking."
                ),
            }

        analysis = analyze_ranking(
            dataframe,
            prompt,
        )

        if not analysis.get("success"):

            return {
                "success": False,
                "type": "ranking",
                "response": analysis.get(
                    "message",
                    "Unable to perform ranking analysis.",
                ),
            }

        explanation = explain_ranking(
            prompt,
            analysis,
        )

        return {
            "success": True,
            "type": "ranking",
            "intent": "ranking",
            "analysis": analysis,
            "response": explanation,
        }

    # -----------------------------------------------------
    # KPI
    # -----------------------------------------------------

    if intent == "kpi":

        if dataframe is None:

            return {
                "success": False,
                "type": "kpi",
                "response": (
                    "No uploaded dataset is available "
                    "for KPI analysis."
                ),
            }

        analysis = analyze_kpis(
            dataframe
        )

        if not analysis.get("success"):

            return {
                "success": False,
                "type": "kpi",
                "response": analysis.get(
                    "message",
                    "Unable to calculate KPIs.",
                ),
            }

        explanation = explain_analysis(
            prompt,
            analysis,
            "KPI analysis",
        )

        return {
            "success": True,
            "type": "kpi",
            "intent": "kpi",
            "analysis": analysis,
            "response": explanation,
        }

    # -----------------------------------------------------
    # DATA QUALITY
    # -----------------------------------------------------

    if intent == "data_quality":

        if dataframe is None:

            return {
                "success": False,
                "type": "data_quality",
                "response": (
                    "No uploaded dataset is available "
                    "for data quality analysis."
                ),
            }

        analysis = analyze_data_quality(
            dataframe
        )

        explanation = explain_analysis(
            prompt,
            analysis,
            "data quality analysis",
        )

        return {
            "success": True,
            "type": "data_quality",
            "intent": "data_quality",
            "analysis": analysis,
            "response": explanation,
        }

    # -----------------------------------------------------
    # REPORT
    # -----------------------------------------------------

    if intent == "report":

        if dataset_summary is None:

            return {
                "success": False,
                "type": "report",
                "response": (
                    "No uploaded dataset is available."
                ),
            }

        report = generate_report(
            prompt,
            dataset_summary,
        )

        return {
            "success": True,
            "type": "report",
            "intent": "report",
            "response": report,
        }

    # -----------------------------------------------------
    # DEFAULT CHAT / OTHER INTENTS
    # -----------------------------------------------------

    response = ask_gemini(
        prompt,
        dataset_summary,
    )

    return {
        "success": True,
        "type": "answer",
        "intent": intent,
        "response": response,
    }


# =========================================================
# GENERIC ANALYSIS EXPLANATION
# =========================================================

def explain_analysis(
    prompt: str,
    analysis: dict,
    analysis_name: str,
) -> str:

    system_prompt = """
You are InsightIQ AI.

You are a senior Business Intelligence Analyst.

The application has already calculated the dataset
analysis.

Your task is to explain the supplied calculations.

Never invent numbers.

Never modify calculated values.

Use professional business language.

Give useful interpretation and recommendations.
"""

    user_prompt = f"""
USER REQUEST:

{prompt}

ANALYSIS TYPE:

{analysis_name}

CALCULATED RESULTS:

{json.dumps(
    analysis,
    indent=2,
    default=str,
)}

Explain the results clearly.

Include:

## Findings

## Business Insight

## Recommendation

Only make claims supported by the supplied results.
"""

    return call_ai(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=1200,
        temperature=0.2,
    )