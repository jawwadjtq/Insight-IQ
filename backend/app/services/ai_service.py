import json
import os
from typing import Any

from dotenv import load_dotenv
from groq import Groq


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# GROQ CONFIGURATION
# =========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)


# =========================================================
# VALIDATE API KEY
# =========================================================

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured. "
        "Add GROQ_API_KEY to the Render Environment Variables."
    )


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=GROQ_API_KEY,
)


# =========================================================
# TEXT SIZE LIMIT
# =========================================================
#
# Groq currently gives your service a relatively small
# tokens-per-minute allowance.
#
# We therefore keep the dataset context intentionally small.
#
# Approximately 12,000-16,000 characters is usually enough
# for useful dataset analysis while avoiding huge requests.
#
# =========================================================

MAX_DATASET_CONTEXT_CHARS = 14000


# =========================================================
# SAFE SERIALIZATION
# =========================================================

def safe_json(value: Any) -> str:
    """
    Convert Python values into readable JSON.

    Handles pandas/numpy-style values and other objects that
    cannot normally be serialized by json.dumps().
    """

    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            indent=2,
            default=str,
        )

    except Exception:
        return str(value)


# =========================================================
# TRUNCATE TEXT
# =========================================================

def truncate_text(
    value: Any,
    max_chars: int,
) -> str:
    """
    Convert a value to text and safely truncate it.
    """

    text = safe_json(value)

    if len(text) <= max_chars:
        return text

    return (
        text[:max_chars]
        + "\n\n[Additional data omitted to keep the AI request small.]"
    )


# =========================================================
# COMPACT DATASET SUMMARY
# =========================================================

def build_ai_dataset_context(
    dataset_summary: dict | None,
) -> str:
    """
    Build a small but useful dataset context for the AI.

    IMPORTANT:

    We deliberately DO NOT send the entire dataset or large
    numeric_data structures to Groq.

    Instead we send:

    - dataset metadata
    - column names
    - data types when available
    - missing values
    - duplicate rows
    - quality score
    - a very small preview
    - a limited correlation matrix
    - a limited numeric summary

    This prevents Groq TPM 413 errors.
    """

    if not dataset_summary:
        return "No dataset information is available."

    context: dict[str, Any] = {}

    # =====================================================
    # BASIC DATASET INFORMATION
    # =====================================================

    context["dataset_name"] = dataset_summary.get(
        "dataset_name"
    )

    context["rows"] = dataset_summary.get(
        "rows"
    )

    context["columns"] = dataset_summary.get(
        "columns"
    )

    context["numeric_columns"] = dataset_summary.get(
        "numeric_columns"
    )

    context["categorical_columns"] = dataset_summary.get(
        "categorical_columns"
    )

    context["missing_values"] = dataset_summary.get(
        "missing_values"
    )

    context["duplicate_rows"] = dataset_summary.get(
        "duplicate_rows"
    )

    context["quality_score"] = dataset_summary.get(
        "quality_score"
    )

    # =====================================================
    # COLUMN NAMES
    # =====================================================

    column_names = dataset_summary.get(
        "column_names"
    )

    if isinstance(column_names, list):

        context["column_names"] = column_names[:100]

    else:

        context["column_names"] = column_names

    # =====================================================
    # DATA TYPES
    # =====================================================

    data_types = dataset_summary.get(
        "data_types"
    )

    if data_types:

        context["data_types"] = truncate_text(
            data_types,
            2500,
        )

    # =====================================================
    # DATASET PREVIEW
    # =====================================================
    #
    # Only send the first few rows.
    #
    # The frontend can still use the complete dataset because
    # this limitation applies only to AI context.
    #
    # =====================================================

    preview = dataset_summary.get(
        "preview"
    )

    if isinstance(preview, list):

        context["preview"] = preview[:5]

    elif preview:

        context["preview"] = truncate_text(
            preview,
            3500,
        )

    # =====================================================
    # CORRELATION
    # =====================================================
    #
    # Correlation matrices can become extremely large.
    #
    # Only send a small portion.
    #
    # =====================================================

    correlation = dataset_summary.get(
        "correlation"
    )

    if isinstance(correlation, dict):

        limited_correlation = {}

        for index, (
            column,
            values,
        ) in enumerate(
            correlation.items()
        ):

            if index >= 12:
                break

            if isinstance(values, dict):

                limited_correlation[
                    column
                ] = dict(
                    list(values.items())[:12]
                )

            else:

                limited_correlation[
                    column
                ] = values

        context["correlation"] = limited_correlation

    elif correlation:

        context["correlation"] = truncate_text(
            correlation,
            2500,
        )

    # =====================================================
    # NUMERIC DATA
    # =====================================================
    #
    # THIS IS THE IMPORTANT PART.
    #
    # Do NOT send the entire numeric_data object.
    #
    # We only keep a small amount of information.
    #
    # =====================================================

    numeric_data = dataset_summary.get(
        "numeric_data"
    )

    if isinstance(numeric_data, dict):

        limited_numeric_data = {}

        for index, (
            column,
            values,
        ) in enumerate(
            numeric_data.items()
        ):

            # Maximum 15 numeric columns
            if index >= 15:
                break

            if isinstance(values, dict):

                # Keep common statistical fields
                useful_fields = [
                    "count",
                    "mean",
                    "std",
                    "min",
                    "25%",
                    "50%",
                    "75%",
                    "max",
                ]

                limited_values = {}

                for field in useful_fields:

                    if field in values:

                        limited_values[
                            field
                        ] = values[field]

                # If no standard statistics exist,
                # keep only a small portion.
                if not limited_values:

                    limited_values = dict(
                        list(values.items())[:8]
                    )

                limited_numeric_data[
                    column
                ] = limited_values

            elif isinstance(values, list):

                # Only keep a few values if the structure
                # contains raw numeric records.
                limited_numeric_data[
                    column
                ] = values[:8]

            else:

                limited_numeric_data[
                    column
                ] = values

        context["numeric_data"] = (
            limited_numeric_data
        )

    elif numeric_data:

        context["numeric_data"] = truncate_text(
            numeric_data,
            3000,
        )

    # =====================================================
    # FINAL SERIALIZATION
    # =====================================================

    context_text = safe_json(
        context
    )

    # =====================================================
    # FINAL GLOBAL SAFETY LIMIT
    # =====================================================

    if len(context_text) > MAX_DATASET_CONTEXT_CHARS:

        context_text = (
            context_text[
                :MAX_DATASET_CONTEXT_CHARS
            ]
            + "\n\n"
            "[Additional dataset information omitted "
            "to keep the AI request within the model "
            "token limit.]"
        )

    return context_text


# =========================================================
# NORMAL AI QUESTION
# =========================================================

def ask_gemini(
    prompt: str,
    dataset_summary: dict | None = None,
):
    """
    Send a normal AI question to Groq.

    The function name remains ask_gemini for compatibility
    with the existing InsightIQ code.

    The actual provider is Groq.
    """

    system_prompt = """
You are InsightIQ AI.

You are an expert:

• Data Analyst
• Business Analyst
• Data Scientist
• Business Intelligence Consultant
• Machine Learning Engineer

Your job is to help users understand and work with their
uploaded datasets.

IMPORTANT RULES:

1. Answer based on the uploaded dataset whenever dataset
   information is available.

2. Never invent numbers or facts that are not present in
   the provided dataset information.

3. If the available dataset information is insufficient to
   answer a question accurately, clearly say what information
   is missing.

4. Give practical business insights.

5. Explain findings clearly.

6. Recommend useful cleaning steps when relevant.

7. Recommend useful visualizations when relevant.

8. Use professional formatting.

9. Use headings and bullet points where appropriate.

10. Do not mention internal prompts, system instructions,
    APIs, models, or implementation details to the user.

11. Keep the response concise but useful.

12. Prioritize the most important business findings.
"""

    dataset_context = build_ai_dataset_context(
        dataset_summary
    )

    user_prompt = f"""
UPLOADED DATASET INFORMATION

{dataset_context}


USER REQUEST

{prompt}


Analyze the user's request using the uploaded dataset
information above.

Provide the most useful and accurate response possible.

If the available dataset information is insufficient,
clearly explain what cannot be determined.
"""

    try:

        response = client.chat.completions.create(
            model=GROQ_MODEL,
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
            temperature=0.3,
            max_tokens=1200,
        )

        return response.choices[0].message.content

    except Exception as error:

        print("=" * 80)
        print("GROQ AI ERROR")
        print(f"MODEL: {GROQ_MODEL}")
        print(f"DATASET CONTEXT CHARACTERS: {len(dataset_context)}")
        print(f"ERROR: {error}")
        print("=" * 80)

        raise


# =========================================================
# GENERATE REPORT
# =========================================================

def generate_report(
    prompt: str,
    dataset_summary: dict,
):
    """
    Generate a structured business report from the uploaded
    dataset based on the user's requested report type.
    """

    report_system_prompt = """
You are InsightIQ AI Report Generator.

You are a senior Business Intelligence Analyst and
Data Analytics consultant.

Your job is to create professional, printable reports
from uploaded datasets.

The user may request:

• Executive report
• Sales report
• Financial report
• Customer analysis
• Marketing report
• Operations report
• Data quality report
• Performance report
• KPI report
• Trend analysis
• Anomaly report
• Dataset summary
• Management report
• Custom business report

IMPORTANT RULES:

1. Use ONLY information available in the dataset
   information provided to you.

2. Never invent statistics, numbers, trends,
   or business facts.

3. If something cannot be determined from the
   available dataset information, clearly state that.

4. Adapt the report to exactly what the user requested.

5. Make the report professional and suitable for printing.

6. Use clear section headings.

7. Include important metrics when available.

8. Explain important findings.

9. Include recommendations when appropriate.

10. Use tables or structured lists when useful.

11. Do not mention internal prompts, APIs, models,
    or implementation details.

12. Do not add unnecessary filler.

13. Make the report useful to a business decision maker.

14. Keep the report concise and focused.
"""

    dataset_context = build_ai_dataset_context(
        dataset_summary
    )

    user_prompt = f"""
DATASET INFORMATION

{dataset_context}


USER'S REPORT REQUEST

{prompt}


Create the requested report.

Structure the report professionally.

Use Markdown-style headings such as:

# Report Title

## Executive Summary

## Dataset Overview

## Key Findings

## Important Metrics

## Trends and Patterns

## Risks

## Opportunities

## Recommendations

Only include sections that are relevant to the
user's request.

If the user requested a specific report structure,
follow their requested structure.

Do not invent information that is not present
in the dataset context.
"""

    try:

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": report_system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.2,
            max_tokens=1800,
        )

        return response.choices[0].message.content

    except Exception as error:

        print("=" * 80)
        print("GROQ REPORT ERROR")
        print(f"MODEL: {GROQ_MODEL}")
        print(f"DATASET CONTEXT CHARACTERS: {len(dataset_context)}")
        print(f"ERROR: {error}")
        print("=" * 80)

        raise