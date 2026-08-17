import os
import json

from dotenv import load_dotenv
from groq import Groq


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
# AI REQUEST CLASSIFIER
# =========================================================

def classify_request(prompt: str) -> dict:
    """
    Determine what the user wants to do with their dataset.

    The classifier does NOT perform the analysis.
    It only identifies the user's requested action.
    """

    classifier_prompt = f"""
You are the request classifier for InsightIQ,
an AI-powered Business Intelligence platform.

Analyze the user's request and classify it into exactly
ONE of the following intent types:

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
General question or explanation that does not require
a specific generated deliverable.

report:
User explicitly asks for a report or document.

kpi:
User asks for KPIs, metrics, performance indicators,
or important business numbers.

ranking:
User asks for top/bottom customers, products, employees,
regions, categories, or other ranked entities.

trend:
User asks about trends, growth, changes over time,
monthly performance, yearly performance, etc.

anomaly:
User asks to find unusual values, anomalies,
outliers, unexpected behavior, or suspicious records.

data_quality:
User asks about missing values, duplicates,
invalid data, inconsistent values, or data quality.

customer_analysis:
User asks to analyze customers, customer behavior,
customer value, retention, segmentation, etc.

sales_analysis:
User asks specifically about sales performance,
sales trends, products sold, revenue from sales, etc.

financial_analysis:
User asks about financial performance, profit,
expenses, costs, margins, revenue, etc.

dashboard:
User asks to create, design, or recommend a dashboard.

comparison:
User asks to compare two or more periods, products,
customers, regions, categories, or other groups.

recommendation:
User asks what actions the business should take,
what to improve, or what decisions should be made.

summary:
User asks for a general summary or overview of the dataset.

IMPORTANT:

Return ONLY valid JSON.

Use exactly this structure:

{{
    "intent": "one_of_the_allowed_intents",
    "deliverable": "short description of what should be produced",
    "requires_dataset_analysis": true,
    "confidence": 0.0
}}

The confidence must be a number between 0 and 1.

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
            max_tokens=300,
        )

        content = response.choices[0].message.content.strip()

        # -------------------------------------------------
        # Remove accidental markdown code fences
        # -------------------------------------------------

        if content.startswith("```"):
            content = content.replace("```json", "")
            content = content.replace("```", "")
            content = content.strip()

        result = json.loads(content)

        # -------------------------------------------------
        # Validate result
        # -------------------------------------------------

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

        if "deliverable" not in result:
            result["deliverable"] = "AI analysis"

        if "requires_dataset_analysis" not in result:
            result["requires_dataset_analysis"] = True

        if "confidence" not in result:
            result["confidence"] = 0.5

        return result

    except Exception as error:

        print("=" * 80)
        print("AI CLASSIFIER ERROR")
        print(error)
        print("=" * 80)

        # Safe fallback
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
    Send a normal AI question to the LLM.

    The function name is kept as ask_gemini for compatibility
    with the existing InsightIQ code, but the actual provider
    is Groq.
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
    APIs, or implementation details to the user.
"""

    if dataset_summary:

        user_prompt = f"""
UPLOADED DATASET INFORMATION

{dataset_summary}


USER REQUEST

{prompt}


Analyze the user's request using the uploaded dataset
information above.

Provide the most useful and accurate response possible.
"""

    else:

        user_prompt = prompt

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
            max_tokens=1500,
        )

        return response.choices[0].message.content

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

The user may request any kind of report, for example:

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

1. Use ONLY information available in the dataset information
   provided to you.

2. Never invent statistics, numbers, trends, or business facts.

3. If something cannot be determined from the available
   dataset information, clearly state that.

4. Adapt the report to exactly what the user requested.

5. Make the report professional and suitable for printing.

6. Use clear section headings.

7. Include important metrics when available.

8. Explain important findings.

9. Include recommendations when appropriate.

10. Use tables or structured lists when useful.

11. Do not mention internal prompts, APIs, models, or
    implementation details.

12. Do not add unnecessary filler.

13. Make the report useful to a business decision maker.
"""

    user_prompt = f"""
DATASET INFORMATION

{dataset_summary}


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

Only include sections that are relevant to the user's request.

If the user requested a specific report structure,
follow their requested structure.
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
            max_tokens=3000,
        )

        return response.choices[0].message.content

    except Exception as error:

        print("=" * 80)
        print("GROQ REPORT ERROR")
        print(error)
        print("=" * 80)

        raise