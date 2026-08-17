import json
import re
from typing import Any

from app.services.ai_service import client


# =========================================================
# AI ACTION PLANNER
# =========================================================
#
# The planner converts a natural-language user request into
# a structured, safe action plan.
#
# IMPORTANT:
# The planner DOES NOT execute Python or dataset operations.
# It only decides what InsightIQ should do.
#
# Example:
#
# "Find the top 10 customers by revenue"
#
# becomes:
#
# {
#     "intent": "ranking",
#     "group_by": "customer",
#     "metric": "revenue",
#     "limit": 10,
#     "sort": "desc",
#     "deliverable": "table"
# }
#
# The actual execution will be implemented in Stage 2.
# =========================================================


ALLOWED_INTENTS = {
    "answer",
    "summary",
    "ranking",
    "aggregation",
    "group_analysis",
    "filter",
    "trend",
    "anomaly",
    "data_quality",
    "visualization",
    "report",
    "dashboard",
}


ALLOWED_DELIVERABLES = {
    "answer",
    "table",
    "kpi",
    "chart",
    "report",
    "dashboard",
}


ALLOWED_CHART_TYPES = {
    "bar",
    "line",
    "pie",
    "histogram",
    "scatter",
    "area",
    "unknown",
}


# =========================================================
# NORMALIZE COLUMN NAME
# =========================================================

def normalize_column_name(value: Any) -> str | None:
    """
    Convert a planner value into a clean string.

    Returns None when the value is missing or unusable.
    """

    if value is None:
        return None

    if not isinstance(value, str):
        value = str(value)

    value = value.strip()

    if not value:
        return None

    return value


# =========================================================
# EXTRACT JSON
# =========================================================

def extract_json(text: str) -> dict:
    """
    Safely extract a JSON object from an LLM response.

    The model may occasionally return:
    
    ```json
    {...}
    ```

    or additional text around the JSON.

    This function extracts the first JSON object it can find.
    """

    if not text:
        raise ValueError("AI planner returned an empty response.")

    text = text.strip()

    # -----------------------------------------------------
    # Remove markdown code fences
    # -----------------------------------------------------

    text = re.sub(
        r"^```(?:json)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"\s*```$",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = text.strip()

    # -----------------------------------------------------
    # Direct JSON
    # -----------------------------------------------------

    try:
        parsed = json.loads(text)

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # -----------------------------------------------------
    # Find JSON object inside response
    # -----------------------------------------------------

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:

        candidate = text[start:end + 1]

        try:
            parsed = json.loads(candidate)

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    raise ValueError(
        "Could not parse the AI planner response as JSON."
    )


# =========================================================
# BUILD DATASET CONTEXT
# =========================================================

def build_planner_context(
    dataset_summary: dict | None,
) -> dict:
    """
    Keep the planner context intentionally small.

    This is important because Groq has token limits and the
    planner does not need the complete dataset preview or
    large numeric arrays.

    The planner mainly needs:
    
    - dataset name
    - row count
    - column count
    - column names
    - numeric columns
    - categorical columns
    """

    if not dataset_summary:
        return {}

    return {
        "dataset_name": dataset_summary.get(
            "dataset_name"
        ),
        "rows": dataset_summary.get(
            "rows"
        ),
        "columns": dataset_summary.get(
            "columns"
        ),
        "column_names": dataset_summary.get(
            "column_names",
            [],
        ),
        "numeric_columns": dataset_summary.get(
            "numeric_columns",
            [],
        ),
        "categorical_columns": dataset_summary.get(
            "categorical_columns",
            [],
        ),
    }


# =========================================================
# PLAN USER REQUEST
# =========================================================

def plan_request(
    prompt: str,
    dataset_summary: dict | None = None,
) -> dict:
    """
    Convert a natural-language request into a structured
    InsightIQ action plan.

    This function does NOT execute the action.
    """

    if not prompt or not prompt.strip():
        raise ValueError(
            "Cannot plan an empty request."
        )

    context = build_planner_context(
        dataset_summary
    )

    planner_system_prompt = """
You are the InsightIQ AI Action Planner.

Your job is to understand what the user wants to do
with their uploaded dataset.

You MUST return ONLY valid JSON.

Do not return Markdown.
Do not return explanations.
Do not return code.
Do not use ``` fences.

Your JSON must follow this structure:

{
  "intent": "...",
  "group_by": null,
  "metric": null,
  "operation": null,
  "filter": null,
  "limit": null,
  "sort": null,
  "time_column": null,
  "time_granularity": null,
  "chart_type": null,
  "deliverable": "...",
  "title": "...",
  "reason": "..."
}

ALLOWED INTENTS:

answer
summary
ranking
aggregation
group_analysis
filter
trend
anomaly
data_quality
visualization
report
dashboard

ALLOWED DELIVERABLES:

answer
table
kpi
chart
report
dashboard

ALLOWED CHART TYPES:

bar
line
pie
histogram
scatter
area
unknown

IMPORTANT RULES:

1. Identify the user's actual goal.

2. Use the uploaded dataset column names when selecting
   group_by, metric, or time_column.

3. Never invent a column name if it does not exist.

4. If a requested column does not clearly exist, use null.

5. "Top 10 customers by revenue" should become:
   intent = ranking
   group_by = customer column
   metric = revenue column
   limit = 10
   sort = desc
   deliverable = table

6. "What is total revenue?" should become:
   intent = aggregation
   metric = revenue column
   operation = sum
   deliverable = kpi

7. "Average order value" should normally use:
   operation = mean

8. "Compare sales by region" should become:
   intent = group_analysis
   group_by = region column
   metric = sales/revenue column
   operation = sum
   deliverable = table

9. "Show monthly revenue" should become:
   intent = trend
   metric = revenue column
   time_column = appropriate date column
   time_granularity = month
   deliverable = chart

10. "Find anomalies" should become:
    intent = anomaly
    deliverable = table

11. "Check data quality" should become:
    intent = data_quality
    deliverable = answer

12. "Create a sales dashboard" should become:
    intent = dashboard
    deliverable = dashboard

13. "Create a sales report" should become:
    intent = report
    deliverable = report

14. Do not confuse a question asking for analysis with a
    request to generate a report.

15. If the user simply asks a normal business question,
    use intent = answer.

16. Never create statistics yourself.

17. Never calculate numbers.

18. The planner only decides WHAT InsightIQ should do.
"""

    planner_user_prompt = f"""
UPLOADED DATASET CONTEXT

{json.dumps(
    context,
    ensure_ascii=False,
    separators=(",", ":"),
)}


USER REQUEST

{prompt}


Return ONLY the JSON action plan.
"""

    try:

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": planner_system_prompt,
                },
                {
                    "role": "user",
                    "content": planner_user_prompt,
                },
            ],
            temperature=0,
            max_tokens=700,
        )

        content = (
            response.choices[0]
            .message
            .content
        )

        plan = extract_json(content)

        return validate_plan(
            plan,
            dataset_summary,
        )

    except Exception as error:

        print("=" * 80)
        print("INSIGHTIQ AI PLANNER ERROR")
        print(error)
        print("=" * 80)

        raise


# =========================================================
# VALIDATE PLAN
# =========================================================

def validate_plan(
    plan: dict,
    dataset_summary: dict | None = None,
) -> dict:
    """
    Validate and normalize the AI-generated plan.

    This protects the rest of the application from malformed
    LLM output.
    """

    if not isinstance(plan, dict):
        raise ValueError(
            "AI planner returned an invalid plan."
        )

    # -----------------------------------------------------
    # Intent
    # -----------------------------------------------------

    intent = plan.get("intent")

    if intent not in ALLOWED_INTENTS:
        intent = "answer"

    # -----------------------------------------------------
    # Deliverable
    # -----------------------------------------------------

    deliverable = plan.get("deliverable")

    if deliverable not in ALLOWED_DELIVERABLES:

        default_deliverables = {
            "ranking": "table",
            "aggregation": "kpi",
            "group_analysis": "table",
            "filter": "table",
            "trend": "chart",
            "anomaly": "table",
            "data_quality": "answer",
            "visualization": "chart",
            "report": "report",
            "dashboard": "dashboard",
            "summary": "answer",
            "answer": "answer",
        }

        deliverable = default_deliverables.get(
            intent,
            "answer",
        )

    # -----------------------------------------------------
    # Normalize fields
    # -----------------------------------------------------

    group_by = normalize_column_name(
        plan.get("group_by")
    )

    metric = normalize_column_name(
        plan.get("metric")
    )

    operation = normalize_column_name(
        plan.get("operation")
    )

    filter_value = plan.get("filter")

    time_column = normalize_column_name(
        plan.get("time_column")
    )

    time_granularity = normalize_column_name(
        plan.get("time_granularity")
    )

    chart_type = normalize_column_name(
        plan.get("chart_type")
    )

    title = normalize_column_name(
        plan.get("title")
    )

    reason = normalize_column_name(
        plan.get("reason")
    )

    # -----------------------------------------------------
    # Chart type
    # -----------------------------------------------------

    if chart_type not in ALLOWED_CHART_TYPES:
        chart_type = None

    # -----------------------------------------------------
    # Limit
    # -----------------------------------------------------

    limit = plan.get("limit")

    if limit is not None:

        try:
            limit = int(limit)

        except (TypeError, ValueError):
            limit = None

        if limit is not None:

            # Prevent unnecessarily huge result sets.
            limit = max(1, min(limit, 100))

    # -----------------------------------------------------
    # Sort
    # -----------------------------------------------------

    sort = plan.get("sort")

    if sort not in {"asc", "desc"}:
        sort = None

    # -----------------------------------------------------
    # Dataset columns
    # -----------------------------------------------------

    available_columns = set()

    if dataset_summary:

        for column in dataset_summary.get(
            "column_names",
            [],
        ):
            if isinstance(column, str):
                available_columns.add(
                    column.strip().lower()
                )

    # -----------------------------------------------------
    # Validate requested columns
    #
    # We only invalidate a column when it clearly does not
    # exist in the uploaded dataset.
    # -----------------------------------------------------

    def validate_column(
        column: str | None,
    ) -> str | None:

        if not column:
            return None

        if not available_columns:
            return column

        if column.lower() in available_columns:
            return column

        return None

    group_by = validate_column(group_by)
    metric = validate_column(metric)
    time_column = validate_column(time_column)

    # -----------------------------------------------------
    # Sensible defaults
    # -----------------------------------------------------

    if intent == "ranking":

        if limit is None:
            limit = 10

        if sort is None:
            sort = "desc"

    if intent == "aggregation":

        if operation is None:
            operation = "sum"

    if intent == "group_analysis":

        if operation is None:
            operation = "sum"

    if intent == "trend":

        if time_granularity is None:
            time_granularity = "month"

        if chart_type is None:
            chart_type = "line"

    if intent == "visualization":

        if chart_type is None:
            chart_type = "bar"

    # -----------------------------------------------------
    # Final structured plan
    # -----------------------------------------------------

    return {
        "intent": intent,

        "group_by": group_by,

        "metric": metric,

        "operation": operation,

        "filter": filter_value,

        "limit": limit,

        "sort": sort,

        "time_column": time_column,

        "time_granularity": time_granularity,

        "chart_type": chart_type,

        "deliverable": deliverable,

        "title": title,

        "reason": reason,
    }