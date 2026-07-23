from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import ask_gemini
from app.services import storage

router = APIRouter(prefix="/ai", tags=["AI"])


class AIRequest(BaseModel):
    prompt: str


def get_compact_summary():
    """
    Returns only the important information about the dataset.
    This keeps the prompt small enough for Groq.
    """

    summary = storage.current_summary

    return {
        "dataset_name": summary.get("dataset_name"),
        "rows": summary.get("rows"),
        "columns": summary.get("columns"),
        "numeric_columns": summary.get("numeric_columns"),
        "categorical_columns": summary.get("categorical_columns"),
        "missing_values": summary.get("missing_values"),
        "duplicate_rows": summary.get("duplicate_rows"),
        "quality_score": summary.get("quality_score"),
        "column_names": summary.get("column_names"),
        "preview": summary.get("preview"),
    }


@router.post("/ask")
def ask_ai(request: AIRequest):

    if storage.current_summary is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded yet."
        )

    compact_summary = get_compact_summary()

    answer = ask_gemini(
        request.prompt,
        compact_summary
    )

    return {
        "response": answer
    }


@router.get("/insights")
def get_ai_insights():

    if storage.current_summary is None:
        return {
            "success": False,
            "message": "No dataset uploaded."
        }

    compact_summary = get_compact_summary()

    prompt = """
You are an expert Data Analyst.

Analyze the uploaded dataset and generate:

1. Overall dataset quality
2. Missing data issues
3. Duplicate data issues
4. Business insights
5. Recommended cleaning steps

Keep the answer professional and use bullet points.
"""

    answer = ask_gemini(
        prompt,
        compact_summary
    )

    return {
        "success": True,
        "insights": answer
    }