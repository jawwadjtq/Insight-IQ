from fastapi import APIRouter, UploadFile, File, HTTPException

import pandas as pd
import traceback

from app.services.dataset_service import analyze_dataset
from app.services.pdf_service import extract_pdf_text
from app.services.ai_service import ask_gemini
from app.services import storage


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


# =========================================================
# UPLOAD FILE
# =========================================================

@router.post("/")
async def upload_file(
    file: UploadFile = File(...)
):
    try:

        # =================================================
        # VALIDATE FILE
        # =================================================

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file was provided.",
            )

        original_filename = file.filename
        filename = original_filename.lower()

        # =================================================
        # CSV
        # =================================================

        if filename.endswith(".csv"):

            df = pd.read_csv(file.file)

            if df.empty:
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded CSV file is empty.",
                )

            result = analyze_dataset(
                df,
                original_filename,
            )

            # ---------------------------------------------
            # Store dataset
            # ---------------------------------------------

            storage.store_dataset(
                df=df,
                summary=result,
                filename=original_filename,
                file_type="csv",
            )

            # ---------------------------------------------
            # Clear previous report
            # ---------------------------------------------

            storage.current_report = None

            return {
                "uploaded": True,
                "type": "dataset",
                "file_type": "csv",
                "filename": original_filename,
                "rows": len(df),
                "columns": len(df.columns),
                "summary": result,
            }

        # =================================================
        # EXCEL
        # =================================================

        elif filename.endswith(".xlsx"):

            df = pd.read_excel(file.file)

            if df.empty:
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded Excel file is empty.",
                )

            result = analyze_dataset(
                df,
                original_filename,
            )

            # ---------------------------------------------
            # Store dataset
            # ---------------------------------------------

            storage.store_dataset(
                df=df,
                summary=result,
                filename=original_filename,
                file_type="xlsx",
            )

            # ---------------------------------------------
            # Clear previous report
            # ---------------------------------------------

            storage.current_report = None

            return {
                "uploaded": True,
                "type": "dataset",
                "file_type": "xlsx",
                "filename": original_filename,
                "rows": len(df),
                "columns": len(df.columns),
                "summary": result,
            }

        # =================================================
        # PDF
        # =================================================

        elif filename.endswith(".pdf"):

            pdf_text = extract_pdf_text(
                file.file
            )

            if not pdf_text.strip():
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No readable text found "
                        "inside PDF."
                    ),
                )

            prompt = f"""
You are a Senior Business Intelligence Analyst
working inside InsightIQ.

Analyze the uploaded PDF and generate:

1. Executive Summary
2. Key Findings
3. Important Metrics
4. Risks
5. Opportunities
6. Recommendations

Keep the response professional,
structured, and useful for business decision-making.

PDF Content:

{pdf_text[:12000]}
"""

            ai_report = ask_gemini(
                prompt
            )

            # ---------------------------------------------
            # Store PDF information
            # ---------------------------------------------

            storage.current_dataset = None
            storage.current_summary = None
            storage.current_filename = original_filename
            storage.current_file_type = "pdf"

            storage.store_report(
                {
                    "title": "PDF Analysis Report",
                    "filename": original_filename,
                    "type": "pdf",
                    "content": ai_report,
                }
            )

            return {
                "uploaded": True,
                "type": "pdf",
                "file_type": "pdf",
                "filename": original_filename,
                "report": ai_report,
            }

        # =================================================
        # UNSUPPORTED FILE
        # =================================================

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only CSV, Excel and PDF "
                    "files are supported."
                ),
            )

    # =====================================================
    # HTTP ERROR
    # =====================================================

    except HTTPException:
        raise

    # =====================================================
    # UNEXPECTED ERROR
    # =====================================================

    except Exception as error:

        print("=" * 80)
        print("UPLOAD ERROR")
        print("=" * 80)

        traceback.print_exc()

        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )