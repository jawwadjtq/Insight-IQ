import os
import json
from typing import Any

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
        "GROQ_API_KEY is not configured in the environment."
    )

client = Groq(
    api_key=GROQ_API_KEY
)


# =========================================================
# MODEL
# =========================================================

MODEL_NAME = "openai/gpt-oss-20b"


# =========================================================
# LIMITS
# =========================================================
#
# Groq's TPM limit can be reached if the entire dataset
# summary is sent repeatedly.
#
# These limits intentionally keep prompts compact.
# =========================================================

MAX_DATASET_CHARS = 24000
MAX_PROMPT_CHARS = 6000

MAX_CLASSIFIER_TOKENS = 300
MAX_CHAT_TOKENS = 1500
MAX_REPORT_TOKENS = 3000


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
# TEXT HELPERS
# =========================================================

def truncate_text(
    value: Any,
    max_chars: int,
) -> str:
    """
    Convert a value to text and safely limit its size.

    This is important because large dataset previews,
    correlations, or numeric_data objects can make the
    Groq request unnecessarily large.
    """

    if value is None:
        return ""

    text = str(value)

    if len(text) <= max_chars:
        return text

    return (
        text[:max_chars]
        + "\n\n[Additional data omitted to keep the AI request compact.]"
    )


def serialize_dataset_summary(
    dataset_summary: dict | None,
) -> str:
    """
    Convert the dataset summary into compact JSON.

    JSON is more predictable for the AI than Python's
    dictionary representation and makes the dataset
    structure easier for the model to understand.
    """

    if not dataset_summary:
        return "No dataset information is available."

    try:

        compact_summary = dict(dataset_summary)

        # -------------------------------------------------
        # Convert to JSON
        # -------------------------------------------------

        text = json.dumps(
            compact_summary,
            ensure_ascii=False,
            default=str,
        )

    except Exception:

        text = str(dataset_summary)

    return truncate_text(
        text,
        MAX_DATASET_CHARS,
    )


def normalize_prompt(
    prompt: str,
) -> str:
    """
    Clean and limit the user's prompt.
    """

    if prompt is None:
        return ""

    prompt = str(prompt).strip()

    return truncate_text(
        prompt,
        MAX_PROMPT_CHARS,
    )


# =========================================================
# AI REQUEST CLASSIFIER
# =========================================================

def classify_request(
    prompt: str,
) -> dict:
    """
    Determine what the user wants to do with the dataset.

    The classifier identifies the user's intent.
    It does NOT perform the actual analysis.

    Example:

        "show me the top 10 customers"

    becomes:

        ranking
    """

    normalized_prompt = normalize_prompt(prompt)

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
The user explicitly wants a report or document.

kpi:
The user wants KPIs, metrics, performance indicators,
or important business numbers.

ranking:
The user wants top/bottom customers, products,
employees, regions, categories, or other ranked entities.

trend:
The user wants trends, growth, changes over time,
monthly performance, yearly performance, or time-based analysis.

anomaly:
The user wants unusual values, outliers, anomalies,
unexpected behavior, or suspicious records.

data_quality:
The user wants missing-value, duplicate, invalid-data,
or data-quality analysis.

customer_analysis:
The user wants customer behavior, customer value,
retention, segmentation, or customer analysis.

sales_analysis:
The user wants sales performance, sales trends,
products sold, sales revenue, or sales analysis.

financial_analysis:
The user wants profit, expenses, costs, margins,
revenue, or financial analysis.

dashboard:
The user wants a dashboard, dashboard design,
dashboard recommendations, or dashboard specifications.

comparison:
The user wants to compare periods, products, customers,
regions, categories, or other groups.

recommendation:
The user wants business recommendations, actions,
improvements, or decisions.

summary:
The user wants a general dataset summary or overview.

IMPORTANT:

Return ONLY valid JSON.

Use exactly:

{{
    "intent": "one_allowed_intent",
    "deliverable": "short description",
    "requires_dataset_analysis": true,
    "confidence": 0.0
}}

Confidence must be between 0 and 1.

USER REQUEST:

{normalized_prompt}
"""

    try:

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise intent classifier. "
                        "Return valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": classifier_prompt,
                },
            ],
            temperature=0,
            max_tokens=MAX_CLASSIFIER_TOKENS,
        )

        content = (
            response.choices[0]
            .message
            .content
            .strip()
        )

        # -------------------------------------------------
        # Remove accidental Markdown fences
        # -------------------------------------------------

        if content.startswith("```"):

            content = (
                content
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        result = json.loads(content)

        # -------------------------------------------------
        # Validate intent
        # -------------------------------------------------

        if result.get("intent") not in ALLOWED_INTENTS:
            result["intent"] = "chat"

        # -------------------------------------------------
        # Validate deliverable
        # -------------------------------------------------

        if not result.get("deliverable"):
            result["deliverable"] = "AI analysis"

        # -------------------------------------------------
        # Validate dataset requirement
        # -------------------------------------------------

        result["requires_dataset_analysis"] = bool(
            result.get(
                "requires_dataset_analysis",
                True,
            )
        )

        # -------------------------------------------------
        # Validate confidence
        # -------------------------------------------------

        try:

            confidence = float(
                result.get(
                    "confidence",
                    0.5,
                )
            )

        except Exception:

            confidence = 0.5

        confidence = max(
            0.0,
            min(
                confidence,
                1.0,
            ),
        )

        result["confidence"] = confidence

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
    """

    normalized_prompt = normalize_prompt(
        prompt
    )

    dataset_text = serialize_dataset_summary(
        dataset_summary
    )

    system_prompt = """
You are InsightIQ AI.

You are an expert:

• Data Analyst
• Business Analyst
• Data Scientist
• Business Intelligence Consultant
• Machine Learning Engineer

Your job is to help users understand and work with
their uploaded datasets.

IMPORTANT RULES:

1. Use the uploaded dataset information whenever available.

2. Never invent numbers, statistics, trends, or facts.

3. Only claim something when the supplied dataset
   information supports it.

4. If the available information is insufficient,
   clearly explain what is missing.

5. Give practical business insights.

6. Explain findings clearly.

7. Recommend useful cleaning steps when relevant.

8. Recommend useful visualizations when relevant.

9. Use professional formatting.

10. Use headings and bullet points where appropriate.

11. Keep responses focused and useful.

12. Do not mention internal prompts, system instructions,
    APIs, models, or implementation details.
"""

    user_prompt = f"""
UPLOADED DATASET INFORMATION

{dataset_text}


USER REQUEST

{normalized_prompt}


Analyze the user's request using the dataset information
above.

Provide the most useful and accurate response possible.

Do not invent unsupported information.
"""

    try:

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
            max_tokens=MAX_CHAT_TOKENS,
        )

        content = (
            response.choices[0]
            .message
            .content
        )

        return content.strip() if content else ""

    except Exception as error:

        print("=" * 80)
        print("GROQ AI ERROR")
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
    """
    Generate a professional structured business report.

    The report can adapt to requests such as:

    • Sales report
    • Executive report
    • Customer report
    • KPI report
    • Financial report
    • Trend report
    • Data quality report
    • Anomaly report
    • Management report
    • Custom report
    """

    normalized_prompt = normalize_prompt(
        prompt
    )

    dataset_text = serialize_dataset_summary(
        dataset_summary
    )

    report_system_prompt = """
You are InsightIQ AI Report Generator.

You are a senior Business Intelligence Analyst,
Data Analytics consultant, and business reporting expert.

Your job is to create professional reports from
uploaded datasets.

The user may request:

• Executive reports
• Sales reports
• Financial reports
• Customer analysis
• Marketing reports
• Operations reports
• Data quality reports
• Performance reports
• KPI reports
• Trend analysis
• Anomaly reports
• Dataset summaries
• Management reports
• Custom business reports

IMPORTANT RULES:

1. Use ONLY information contained in the supplied
   dataset information.

2. Never invent statistics, numbers, trends,
   percentages, or business facts.

3. If something cannot be determined from the available
   dataset information, clearly say so.

4. Adapt the report to exactly what the user requested.

5. Make the report professional and decision-oriented.

6. Use clear Markdown headings.

7. Include important metrics when available.

8. Explain important findings.

9. Include recommendations when appropriate.

10. Use structured lists when useful.

11. Keep the report concise enough to remain readable.

12. Do not mention internal prompts, APIs, models,
    or implementation details.

13. Do not add unnecessary filler.

14. Clearly distinguish dataset-supported findings
    from recommendations.

15. If a requested analysis cannot be calculated from
    the supplied summary, explain the limitation instead
    of guessing.
"""

    user_prompt = f"""
DATASET INFORMATION

{dataset_text}


USER'S REPORT REQUEST

{normalized_prompt}


Create the requested report.

Use a professional structure.

Possible sections include:

# Report Title

## Executive Summary

## Dataset Overview

## Key Findings

## Important Metrics

## Trends and Patterns

## Rankings

## Anomalies

## Data Quality

## Risks

## Opportunities

## Recommendations

Only include sections that are relevant.

If the user requested a specific structure,
follow that structure.

Do not invent unsupported information.
"""

    try:

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
            max_tokens=MAX_REPORT_TOKENS,
        )

        content = (
            response.choices[0]
            .message
            .content
        )

        return content.strip() if content else ""

    except Exception as error:

        print("=" * 80)
        print("GROQ REPORT ERROR")
        print(error)
        print("=" * 80)

        raise


# =========================================================
# SPECIALIZED ANALYSIS
# =========================================================

def generate_specialized_analysis(
    intent: str,
    prompt: str,
    dataset_summary: dict,
):
    """
    Generate an analysis specifically suited to the
    detected user intent.

    This lets InsightIQ respond differently to requests
    such as rankings, trends, KPIs, anomalies, etc.
    """

    normalized_prompt = normalize_prompt(
        prompt
    )

    dataset_text = serialize_dataset_summary(
        dataset_summary
    )

    intent_instructions = {

        "kpi": """
Identify the most relevant KPIs and business metrics
available from the dataset.

Explain what each KPI means and why it matters.
Do not invent metrics that cannot be supported.
""",

        "ranking": """
Identify the ranking requested by the user.

Clearly state the ranking dimension and provide the
requested top/bottom entities when the supplied data
allows it.

Do not fabricate rankings.
""",

        "trend": """
Analyze time-based trends, changes, growth, declines,
seasonality, or other temporal patterns when available.

If time information is unavailable, explain that limitation.
""",

        "anomaly": """
Identify potential anomalies, unusual values,
outliers, or unexpected patterns supported by the data.

Do not call something an anomaly without evidence.
""",

        "data_quality": """
Analyze missing values, duplicate rows, inconsistent
data, invalid values, and other available data-quality
indicators.

Provide practical cleaning recommendations.
""",

        "customer_analysis": """
Analyze customer-related behavior, value, concentration,
segments, retention-related indicators, or other customer
patterns supported by the dataset.
""",

        "sales_analysis": """
Analyze sales-related performance, revenue,
products, categories, sales trends, and other
sales indicators available in the dataset.
""",

        "financial_analysis": """
Analyze revenue, profit, expenses, costs, margins,
financial performance, and related indicators available
in the dataset.
""",

        "dashboard": """
Design a practical business dashboard based on the
available dataset.

Recommend:

• KPI cards
• Charts
• Tables
• Filters
• Business questions answered by each visualization

Do not claim that a visualization has been created.
Provide the dashboard specification.
""",

        "comparison": """
Compare the groups, periods, products, customers,
regions, or categories requested by the user.

Clearly explain the differences supported by the data.
""",

        "recommendation": """
Provide practical business recommendations based only
on the available evidence.

Separate observed findings from recommended actions.
""",

        "summary": """
Provide a concise but useful overview of the dataset,
including structure, quality, important patterns,
and business-relevant findings.
""",

    }

    instructions = intent_instructions.get(
        intent,
        """
Answer the user's request using the available
dataset information.
""",
    )

    system_prompt = f"""
You are InsightIQ's specialized Business Intelligence AI.

Detected user intent:

{intent}

Your task:

{instructions}

GLOBAL RULES:

1. Use only the supplied dataset information.

2. Never invent unsupported numbers or facts.

3. If the information is insufficient, say so clearly.

4. Give useful business context.

5. Use headings and bullet points where appropriate.

6. Keep the response professional and concise.

7. Do not mention internal implementation details.
"""

    user_prompt = f"""
DATASET INFORMATION

{dataset_text}


USER REQUEST

{normalized_prompt}


Complete the requested analysis.
"""

    try:

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
            temperature=0.2,
            max_tokens=MAX_CHAT_TOKENS,
        )

        content = (
            response.choices[0]
            .message
            .content
        )

        return content.strip() if content else ""

    except Exception as error:

        print("=" * 80)
        print("SPECIALIZED AI ERROR")
        print(error)
        print("=" * 80)

        raise


# =========================================================
# PROCESS USER REQUEST
# =========================================================

def process_request(
    prompt: str,
    dataset_summary: dict | None = None,
) -> dict:
    """
    Main AI request pipeline.

    Flow:

        User request
             ↓
        Classifier
             ↓
        Intent
             ↓
        Specialized AI
             ↓
        Structured API response

    This is the main function used by /ai/ask.
    """

    normalized_prompt = normalize_prompt(
        prompt
    )

    if not normalized_prompt:

        raise ValueError(
            "Prompt cannot be empty."
        )

    # =====================================================
    # CLASSIFY
    # =====================================================

    classification = classify_request(
        normalized_prompt
    )

    intent = classification.get(
        "intent",
        "chat",
    )

    # =====================================================
    # REPORT
    # =====================================================

    if intent == "report":

        answer = generate_report(
            normalized_prompt,
            dataset_summary or {},
        )

        return {
            "success": True,
            "type": "report",
            "intent": intent,
            "deliverable": classification.get(
                "deliverable",
                "Business report",
            ),
            "confidence": classification.get(
                "confidence",
                0.0,
            ),
            "response": answer,
        }

    # =====================================================
    # SPECIALIZED DATA ANALYSIS
    # =====================================================

    if intent in {
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
    }:

        answer = generate_specialized_analysis(
            intent,
            normalized_prompt,
            dataset_summary or {},
        )

        return {
            "success": True,
            "type": "analysis",
            "intent": intent,
            "deliverable": classification.get(
                "deliverable",
                "Dataset analysis",
            ),
            "confidence": classification.get(
                "confidence",
                0.0,
            ),
            "response": answer,
        }

    # =====================================================
    # NORMAL CHAT
    # =====================================================

    answer = ask_gemini(
        normalized_prompt,
        dataset_summary,
    )

    return {
        "success": True,
        "type": "answer",
        "intent": "chat",
        "deliverable": classification.get(
            "deliverable",
            "AI response",
        ),
        "confidence": classification.get(
            "confidence",
            0.0,
        ),
        "response": answer,
    }