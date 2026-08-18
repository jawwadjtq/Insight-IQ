import os
import json
import re
from typing import Any

from dotenv import load_dotenv
from groq import Groq

from app.services import storage


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# =========================================================
# MODEL
# =========================================================

MODEL_NAME = "openai/gpt-oss-20b"


# =========================================================
# LIMITS
# =========================================================

MAX_QUERY_ROWS = 100

MAX_RESULT_CHARS = 12000

MAX_AI_INPUT_CHARS = 28000


# =========================================================
# ALLOWED INTENTS
# =========================================================

ALLOWED_INTENTS = {
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


# =========================================================
# SAFE SQL CHECK
# =========================================================

def validate_sql(sql: str) -> str:
    """
    Validate AI-generated SQL before sending it to DuckDB.

    InsightIQ analysis queries are READ-ONLY.

    Dangerous statements such as DROP, DELETE, UPDATE,
    INSERT, ALTER, and CREATE are rejected.
    """

    if not sql:
        raise ValueError(
            "AI did not generate a SQL query."
        )

    sql = sql.strip()

    # -----------------------------------------------------
    # Remove markdown fences
    # -----------------------------------------------------

    sql = sql.replace(
        "```sql",
        "",
    )

    sql = sql.replace(
        "```",
        "",
    )

    sql = sql.strip()

    # -----------------------------------------------------
    # Remove trailing semicolon
    # -----------------------------------------------------

    sql = sql.rstrip(";").strip()

    # -----------------------------------------------------
    # Only allow SELECT / WITH
    # -----------------------------------------------------

    lowered = sql.lower()

    if not (
        lowered.startswith("select ")
        or lowered.startswith("with ")
    ):

        raise ValueError(
            "Only SELECT queries are allowed."
        )

    # -----------------------------------------------------
    # Dangerous SQL keywords
    # -----------------------------------------------------

    forbidden = [
        "insert ",
        "update ",
        "delete ",
        "drop ",
        "alter ",
        "create ",
        "truncate ",
        "replace ",
        "merge ",
        "attach ",
        "detach ",
        "copy ",
        "install ",
        "load ",
    ]

    for keyword in forbidden:

        if keyword in lowered:

            raise ValueError(
                "Unsafe SQL query rejected."
            )

    # -----------------------------------------------------
    # Prevent multiple statements
    # -----------------------------------------------------

    if ";" in sql:

        raise ValueError(
            "Multiple SQL statements are not allowed."
        )

    return sql


# =========================================================
# SAFE SQL EXECUTION
# =========================================================

def execute_analysis_query(
    sql: str,
) -> list[dict[str, Any]]:
    """
    Execute a validated read-only query against DuckDB.

    The result is intentionally limited so that a malicious
    or poorly generated query cannot return millions of rows
    to the API or AI model.
    """

    sql = validate_sql(sql)

    # -----------------------------------------------------
    # Add LIMIT when appropriate
    # -----------------------------------------------------

    lowered = sql.lower()

    if " limit " not in lowered:

        sql = f"""
        SELECT *
        FROM (
            {sql}
        ) AS analysis_result
        LIMIT {MAX_QUERY_ROWS}
        """

    results = storage.query(
        sql
    )

    return results[:MAX_QUERY_ROWS]


# =========================================================
# DATASET SCHEMA
# =========================================================

def get_dataset_schema_for_ai() -> list[dict[str, str]]:
    """
    Get the DuckDB schema without loading dataset rows.
    """

    try:

        return storage.get_schema()

    except Exception as error:

        print(
            "SCHEMA ERROR:",
            error,
        )

        return []


# =========================================================
# FORMAT SCHEMA
# =========================================================

def format_schema(
    schema: list[dict[str, str]],
) -> str:
    """
    Convert the database schema into compact AI-readable text.
    """

    if not schema:

        return "No dataset schema is available."

    lines = []

    for column in schema:

        name = column.get(
            "column",
            "",
        )

        data_type = column.get(
            "type",
            "",
        )

        lines.append(
            f"- {name}: {data_type}"
        )

    return "\n".join(lines)


# =========================================================
# FORMAT QUERY RESULTS
# =========================================================

def format_results(
    results: list[dict[str, Any]],
) -> str:
    """
    Convert query results into compact JSON.

    Large results are truncated before reaching the AI.
    """

    if not results:

        return "No matching records were found."

    try:

        text = json.dumps(
            results,
            default=str,
            ensure_ascii=False,
        )

    except Exception:

        text = str(results)

    if len(text) > MAX_RESULT_CHARS:

        text = (
            text[:MAX_RESULT_CHARS]
            + "\n...[results truncated]"
        )

    return text


# =========================================================
# REQUEST CLASSIFIER
# =========================================================

def classify_request(
    prompt: str,
) -> dict[str, Any]:
    """
    Determine what the user wants to do with the dataset.

    The classifier identifies intent only.
    It does not perform the actual analysis.
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
General explanation or question.

report:
User wants a report or document.

kpi:
User wants KPIs or important metrics.

ranking:
User wants top/bottom entities.

trend:
User wants changes over time.

anomaly:
User wants unusual values or outliers.

data_quality:
User wants missing, duplicate, invalid, or inconsistent data analysis.

customer_analysis:
User wants customer behavior or customer performance analysis.

sales_analysis:
User wants sales performance analysis.

financial_analysis:
User wants revenue, cost, profit, margin, or financial analysis.

dashboard:
User wants a dashboard or dashboard design.

comparison:
User wants two or more groups or periods compared.

recommendation:
User wants business recommendations or actions.

summary:
User wants a general dataset overview.

Return ONLY valid JSON.

Required structure:

{{
    "intent": "one_allowed_intent",
    "deliverable": "short description",
    "requires_dataset_analysis": true,
    "confidence": 0.0
}}

USER REQUEST:

{prompt}
"""

    try:

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise "
                        "JSON classification system."
                    ),
                },
                {
                    "role": "user",
                    "content": classifier_prompt,
                },
            ],
            temperature=0,
            max_tokens=300,
        )

        content = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        # -------------------------------------------------
        # Remove markdown fences
        # -------------------------------------------------

        if content.startswith("```"):

            content = re.sub(
                r"```(?:json)?",
                "",
                content,
            )

            content = content.replace(
                "```",
                "",
            ).strip()

        result = json.loads(
            content
        )

        # -------------------------------------------------
        # Validate intent
        # -------------------------------------------------

        if result.get("intent") not in ALLOWED_INTENTS:

            result["intent"] = "chat"

        # -------------------------------------------------
        # Defaults
        # -------------------------------------------------

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
# SQL GENERATOR
# =========================================================

def generate_analysis_sql(
    prompt: str,
    intent: str,
    schema: list[dict[str, str]],
) -> str:
    """
    Ask the AI to generate a read-only DuckDB query.

    The AI receives the schema, NOT the complete dataset.
    """

    schema_text = format_schema(
        schema
    )

    sql_prompt = f"""
You are the SQL analysis engine for InsightIQ.

The user has uploaded a dataset stored in DuckDB.

Your job is to generate ONE read-only SQL query that
answers the user's request.

DATABASE TABLE:

current_dataset

DATASET SCHEMA:

{schema_text}

USER REQUEST:

{prompt}

REQUEST INTENT:

{intent}

RULES:

1. Return ONLY SQL.
2. Use only the table current_dataset.
3. Use only columns that exist in the schema.
4. Never invent column names.
5. Never modify the database.
6. Only SELECT or WITH queries are allowed.
7. Do not use INSERT, UPDATE, DELETE, DROP, ALTER,
   CREATE, COPY, ATTACH, or other write operations.
8. Return a compact result.
9. Prefer aggregations over raw rows.
10. If the user asks for top/bottom items, use ORDER BY
    and LIMIT.
11. If the user asks for trends, identify suitable date
    columns from the schema.
12. If no date column exists, return the best possible
    aggregation and let the final AI explain the limitation.
13. Avoid SELECT * unless necessary.
14. Do not return more than {MAX_QUERY_ROWS} rows.
15. The query must work with DuckDB.

Return only the SQL query.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You generate safe "
                    "read-only DuckDB SQL."
                ),
            },
            {
                "role": "user",
                "content": sql_prompt,
            },
        ],
        temperature=0,
        max_tokens=700,
    )

    sql = (
        response
        .choices[0]
        .message
        .content
        .strip()
    )

    return validate_sql(
        sql
    )


# =========================================================
# FINAL AI ANALYSIS
# =========================================================

def explain_analysis(
    prompt: str,
    intent: str,
    query: str,
    results: list[dict[str, Any]],
) -> str:
    """
    Ask the AI to explain a small SQL result.

    The model never receives the complete dataset.
    """

    result_text = format_results(
        results
    )

    explanation_prompt = f"""
You are InsightIQ AI.

You are an expert Data Analyst, Business Analyst,
Business Intelligence Consultant, and Data Scientist.

The user's request was:

{prompt}

Detected intent:

{intent}

A DuckDB query was executed against the uploaded dataset.

Query:

{query}

Query result:

{result_text}

IMPORTANT:

- Explain the result accurately.
- Use ONLY the query result.
- Never invent numbers.
- Never claim information that is not present.
- If the result is insufficient, clearly explain the limitation.
- Give useful business insight where appropriate.
- Keep the answer professional and clear.
- Use headings and bullet points when useful.
- Do not mention internal prompts or implementation details.

Answer the user's request directly.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are InsightIQ's "
                    "professional data analyst."
                ),
            },
            {
                "role": "user",
                "content": explanation_prompt,
            },
        ],
        temperature=0.2,
        max_tokens=1800,
    )

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )


# =========================================================
# DATASET-AWARE REQUEST PROCESSOR
# =========================================================

def process_request(
    prompt: str,
    dataset_summary: dict | None = None,
) -> dict[str, Any]:
    """
    Main AI request pipeline.

    Flow:

    User request
        ↓
    Intent classification
        ↓
    SQL generation
        ↓
    DuckDB analysis
        ↓
    Small result
        ↓
    AI explanation
    """

    # =====================================================
    # CLASSIFY
    # =====================================================

    classification = classify_request(
        prompt
    )

    intent = classification.get(
        "intent",
        "chat",
    )

    # =====================================================
    # GET SCHEMA
    # =====================================================

    schema = get_dataset_schema_for_ai()

    # =====================================================
    # NO DATASET
    # =====================================================

    if not schema:

        answer = ask_gemini(
            prompt,
            dataset_summary,
        )

        return {
            "success": True,
            "type": "answer",
            "intent": intent,
            "response": answer,
            "analysis": None,
        }

    # =====================================================
    # REPORT
    # =====================================================

    if intent == "report":

        report = generate_report(
            prompt,
            dataset_summary,
        )

        return {
            "success": True,
            "type": "report",
            "intent": intent,
            "response": report,
            "analysis": None,
        }

    # =====================================================
    # DASHBOARD
    # =====================================================

    if intent == "dashboard":

        answer = generate_dashboard_plan(
            prompt,
            schema,
        )

        return {
            "success": True,
            "type": "dashboard",
            "intent": intent,
            "response": answer,
            "analysis": None,
        }

    # =====================================================
    # GENERATE SQL
    # =====================================================

    try:

        sql = generate_analysis_sql(
            prompt=prompt,
            intent=intent,
            schema=schema,
        )

    except Exception as error:

        print("=" * 80)
        print("SQL GENERATION ERROR")
        print(error)
        print("=" * 80)

        # Safe fallback to normal AI

        answer = ask_gemini(
            prompt,
            dataset_summary,
        )

        return {
            "success": True,
            "type": "answer",
            "intent": intent,
            "response": answer,
            "analysis": None,
        }

    # =====================================================
    # EXECUTE SQL
    # =====================================================

    try:

        results = execute_analysis_query(
            sql
        )

    except Exception as error:

        print("=" * 80)
        print("SQL EXECUTION ERROR")
        print(error)
        print("=" * 80)

        # -------------------------------------------------
        # Tell AI about the failure without exposing
        # internal implementation details to the user.
        # -------------------------------------------------

        fallback_prompt = f"""
The user asked:

{prompt}

The available dataset schema is:

{format_schema(schema)}

The automatic analysis could not produce a reliable
query result.

Explain what information is needed to answer the request
accurately. Do not invent data.
"""

        answer = ask_gemini(
            fallback_prompt,
            dataset_summary,
        )

        return {
            "success": True,
            "type": "answer",
            "intent": intent,
            "response": answer,
            "analysis": None,
        }

    # =====================================================
    # EXPLAIN RESULT
    # =====================================================

    try:

        answer = explain_analysis(
            prompt=prompt,
            intent=intent,
            query=sql,
            results=results,
        )

    except Exception as error:

        print("=" * 80)
        print("AI EXPLANATION ERROR")
        print(error)
        print("=" * 80)

        answer = (
            "The dataset analysis completed successfully, "
            "but the explanation could not be generated."
        )

    # =====================================================
    # RETURN
    # =====================================================

    return {
        "success": True,
        "type": "analysis",
        "intent": intent,
        "response": answer,
        "analysis": {
            "query": sql,
            "rows": results,
            "row_count": len(results),
        },
    }


# =========================================================
# NORMAL AI QUESTION
# =========================================================

def ask_gemini(
    prompt: str,
    dataset_summary: dict | None = None,
):
    """
    General AI response.

    Used when a request does not require direct SQL analysis
    or when SQL analysis is unavailable.
    """

    system_prompt = """
You are InsightIQ AI.

You are an expert:

- Data Analyst
- Business Analyst
- Data Scientist
- Business Intelligence Consultant
- Machine Learning Engineer

Help users understand their uploaded datasets.

IMPORTANT:

1. Use supplied dataset information when available.
2. Never invent numbers.
3. Never invent facts.
4. Clearly state when information is insufficient.
5. Give practical business insights.
6. Explain findings clearly.
7. Recommend useful visualizations when appropriate.
8. Use professional formatting.
9. Do not mention internal prompts, APIs, or implementation details.
"""

    if dataset_summary:

        user_prompt = f"""
DATASET INFORMATION:

{dataset_summary}

USER REQUEST:

{prompt}

Answer using only the available information.
"""

    else:

        user_prompt = prompt

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
        temperature=0.3,
        max_tokens=1500,
    )

    return (
        response
        .choices[0]
        .message
        .content
    )


# =========================================================
# GENERATE REPORT
# =========================================================

def generate_report(
    prompt: str,
    dataset_summary: dict | None,
):
    """
    Generate a professional report.

    Important:
    The report generator receives compact dataset information.
    For extremely large datasets, process_request() should first
    perform SQL analysis and provide summarized results.
    """

    report_system_prompt = """
You are InsightIQ AI Report Generator.

You are a senior Business Intelligence Analyst.

Create professional reports from dataset information.

RULES:

1. Use only provided information.
2. Never invent statistics.
3. Never invent trends.
4. Never invent business facts.
5. Clearly state limitations.
6. Adapt the report to the user's request.
7. Use professional headings.
8. Include useful metrics when available.
9. Include recommendations when appropriate.
10. Avoid unnecessary filler.
11. Do not mention internal prompts, APIs, or models.
"""

    user_prompt = f"""
DATASET INFORMATION:

{dataset_summary}

USER REPORT REQUEST:

{prompt}

Create a professional report.

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

Only include relevant sections.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
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
        max_tokens=3000,
    )

    return (
        response
        .choices[0]
        .message
        .content
    )


# =========================================================
# DASHBOARD PLAN
# =========================================================

def generate_dashboard_plan(
    prompt: str,
    schema: list[dict[str, str]],
) -> str:
    """
    Generate a dashboard specification.

    This is currently a planning layer.

    The next stage can convert this specification into actual
    chart configurations and dashboard components.
    """

    schema_text = format_schema(
        schema
    )

    dashboard_prompt = f"""
You are the dashboard architect for InsightIQ.

The user wants:

{prompt}

Dataset schema:

{schema_text}

Design a useful business intelligence dashboard.

Recommend:

1. Dashboard title
2. KPI cards
3. Charts
4. Dimensions
5. Measures
6. Filters
7. Business questions answered
8. Recommended layout

Only recommend fields that exist in the dataset schema.

Do not invent columns.

Return a concise professional dashboard specification.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert "
                    "BI dashboard designer."
                ),
            },
            {
                "role": "user",
                "content": dashboard_prompt,
            },
        ],
        temperature=0.2,
        max_tokens=1600,
    )

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )


# =========================================================
# PDF CHUNK ANALYSIS
# =========================================================

def analyze_pdf_chunk(
    chunk_text: str,
    chunk_number: int,
    total_chunks: int,
) -> str:
    """
    Analyze one PDF chunk independently.

    This prevents very large PDFs from being sent to the
    model as one giant request.
    """

    # -----------------------------------------------------
    # Limit individual chunk size
    # -----------------------------------------------------

    chunk_text = chunk_text[
        :MAX_AI_INPUT_CHARS
    ]

    prompt = f"""
You are analyzing part {chunk_number}
of {total_chunks} of a large PDF.

Extract only useful factual information.

Focus on:

- important facts
- metrics
- figures
- dates
- trends
- risks
- opportunities
- business findings
- recommendations

Do not invent information.

PDF CHUNK:

{chunk_text}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise "
                    "document analyst."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.1,
        max_tokens=1200,
    )

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )


# =========================================================
# GENERATE PDF REPORT FROM CHUNKS
# =========================================================

def generate_pdf_report_from_chunks(
    prompt: str,
    chunk_summaries: list[str],
) -> str:
    """
    Combine compact PDF chunk summaries into one report.

    Only the summaries are sent to the final model,
    not the original full PDF.
    """

    combined = "\n\n".join(
        [
            f"CHUNK {index + 1}:\n{summary}"
            for index, summary
            in enumerate(chunk_summaries)
        ]
    )

    # -----------------------------------------------------
    # Final safety limit
    # -----------------------------------------------------

    if len(combined) > MAX_AI_INPUT_CHARS:

        combined = combined[
            :MAX_AI_INPUT_CHARS
        ]

    final_prompt = f"""
You are InsightIQ AI Report Generator.

Create a professional report based on the analyzed
sections of a large PDF.

USER REQUEST:

{prompt}

ANALYZED PDF INFORMATION:

{combined}

RULES:

1. Use only information contained in the analyzed sections.
2. Never invent statistics or facts.
3. Combine repeated findings intelligently.
4. Highlight important metrics.
5. Identify trends when supported.
6. Identify risks and opportunities when supported.
7. Provide practical recommendations.
8. Clearly mention limitations when information is incomplete.
9. Use professional Markdown headings.
10. Do not mention internal prompts, APIs, or models.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a senior business "
                    "intelligence report writer."
                ),
            },
            {
                "role": "user",
                "content": final_prompt,
            },
        ],
        temperature=0.2,
        max_tokens=3000,
    )

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )