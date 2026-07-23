from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import traceback

from app.services.dataset_service import analyze_dataset
from app.services.pdf_service import extract_pdf_text
from app.services.ai_service import ask_gemini
from app.services import storage

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    try:

        filename = file.filename.lower()

        # ==========================
        # CSV
        # ==========================

        if filename.endswith(".csv"):

            df = pd.read_csv(file.file)

            result = analyze_dataset(df, file.filename)

            storage.current_dataset = df
            storage.current_summary = result

            return {
                "uploaded": True,
                "type": "dataset",
                "summary": result,
            }

        # ==========================
        # Excel
        # ==========================

        elif filename.endswith(".xlsx"):

            df = pd.read_excel(file.file)

            result = analyze_dataset(df, file.filename)

            storage.current_dataset = df
            storage.current_summary = result

            return {
                "uploaded": True,
                "type": "dataset",
                "summary": result,
            }

        # ==========================
        # PDF
        # ==========================

        elif filename.endswith(".pdf"):

            pdf_text = extract_pdf_text(file.file)

            if not pdf_text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="No readable text found inside PDF."
                )

            prompt = f"""
You are a Senior Business Intelligence Analyst.

Analyze this PDF and generate:

1. Executive Summary

2. Key Findings

3. Important Metrics

4. Risks

5. Opportunities

6. Recommendations

PDF Content:

{pdf_text[:12000]}
"""

            ai_report = ask_gemini(prompt)

            return {
                "uploaded": True,
                "type": "pdf",
                "filename": file.filename,
                "report": ai_report,
            }

        else:

            raise HTTPException(
                status_code=400,
                detail="Only CSV, Excel and PDF files are supported."
            )

    except Exception as e:

        print("=" * 80)
        print("UPLOAD ERROR")
        traceback.print_exc()
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )