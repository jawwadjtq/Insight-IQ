from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.ai_service import (
    process_request,
    ask_gemini,
    generate_report,
)

from app.services import storage

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.units import mm

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class AIRequest(BaseModel):
    prompt: str


# =========================================================
# DATASET SUMMARY
# =========================================================

def get_compact_summary():

    summary = storage.current_summary

    if summary is None:
        return None

    return {
        "dataset_name": summary.get(
            "dataset_name"
        ),
        "rows": summary.get(
            "rows"
        ),
        "columns": summary.get(
            "columns"
        ),
        "numeric_columns": summary.get(
            "numeric_columns"
        ),
        "categorical_columns": summary.get(
            "categorical_columns"
        ),
        "missing_values": summary.get(
            "missing_values"
        ),
        "duplicate_rows": summary.get(
            "duplicate_rows"
        ),
        "quality_score": summary.get(
            "quality_score"
        ),
        "column_names": summary.get(
            "column_names"
        ),
        "preview": summary.get(
            "preview"
        ),
        "correlation": summary.get(
            "correlation"
        ),
        "numeric_data": summary.get(
            "numeric_data"
        ),
    }


# =========================================================
# ASK AI
# =========================================================

@router.post("/ask")
def ask_ai(request: AIRequest):

    # =====================================================
    # VALIDATE DATASET
    # =====================================================

    if storage.current_summary is None:

        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded yet.",
        )

    # =====================================================
    # VALIDATE PROMPT
    # =====================================================

    if not request.prompt.strip():

        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    # =====================================================
    # DATASET SUMMARY
    # =====================================================

    compact_summary = get_compact_summary()

    # =====================================================
    # PROCESS AI REQUEST
    # =====================================================

    try:

        result = process_request(
            request.prompt,
            compact_summary,
            storage.current_dataset,
        )

        return result

    except Exception as error:

        print("=" * 80)
        print("AI REQUEST ERROR")
        print("=" * 80)
        print(error)
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=(
                "InsightIQ AI could not process "
                "your request."
            ),
        )


# =========================================================
# AI INSIGHTS
# =========================================================

@router.get("/insights")
def get_ai_insights():

    if storage.current_summary is None:

        return {
            "success": False,
            "message": "No dataset uploaded.",
        }

    compact_summary = get_compact_summary()

    prompt = """
Analyze the uploaded dataset.

Generate:

1. Overall dataset quality
2. Missing data issues
3. Duplicate data issues
4. Important patterns
5. Business insights
6. Potential anomalies
7. Recommended cleaning steps
8. Recommended visualizations

Keep the response professional and concise.

Do not invent unsupported information.
"""

    try:

        answer = ask_gemini(
            prompt,
            compact_summary,
        )

        return {
            "success": True,
            "insights": answer,
        }

    except Exception as error:

        print("=" * 80)
        print("AI INSIGHTS ERROR")
        print("=" * 80)
        print(error)
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI insights.",
        )


# =========================================================
# GENERATE PDF REPORT
# =========================================================

@router.post("/report/pdf")
def generate_pdf_report(request: AIRequest):

    if storage.current_summary is None:

        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded yet.",
        )

    if not request.prompt.strip():

        raise HTTPException(
            status_code=400,
            detail="Please describe the report you want.",
        )

    compact_summary = get_compact_summary()

    try:

        # =================================================
        # GENERATE AI REPORT
        # =================================================

        report_text = generate_report(
            request.prompt,
            compact_summary,
        )

        if not report_text:

            raise HTTPException(
                status_code=500,
                detail="AI returned an empty report.",
            )

        # =================================================
        # PDF BUFFER
        # =================================================

        buffer = BytesIO()

        # =================================================
        # PDF DOCUMENT
        # =================================================

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )

        # =================================================
        # STYLES
        # =================================================

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "InsightIQTitle",
            parent=styles["Title"],
            alignment=TA_CENTER,
            fontSize=22,
            leading=28,
            spaceAfter=12,
        )

        subtitle_style = ParagraphStyle(
            "InsightIQSubtitle",
            parent=styles["Heading2"],
            alignment=TA_CENTER,
            fontSize=13,
            leading=18,
            textColor=colors.HexColor(
                "#475569"
            ),
            spaceAfter=12,
        )

        heading_style = ParagraphStyle(
            "InsightIQHeading",
            parent=styles["Heading2"],
            fontSize=15,
            leading=20,
            spaceBefore=12,
            spaceAfter=7,
            textColor=colors.HexColor(
                "#0f172a"
            ),
        )

        body_style = ParagraphStyle(
            "InsightIQBody",
            parent=styles["BodyText"],
            fontSize=10.5,
            leading=16,
            spaceAfter=7,
            textColor=colors.HexColor(
                "#1e293b"
            ),
        )

        bullet_style = ParagraphStyle(
            "InsightIQBullet",
            parent=body_style,
            leftIndent=12,
            firstLineIndent=-8,
            spaceAfter=5,
        )

        small_style = ParagraphStyle(
            "InsightIQSmall",
            parent=styles["BodyText"],
            fontSize=8.5,
            textColor=colors.grey,
        )

        # =================================================
        # STORY
        # =================================================

        story = []

        # =================================================
        # TITLE
        # =================================================

        story.append(
            Paragraph(
                "InsightIQ",
                title_style,
            )
        )

        story.append(
            Paragraph(
                "AI-Powered Business Intelligence Report",
                subtitle_style,
            )
        )

        dataset_name = escape(
            str(
                compact_summary.get(
                    "dataset_name",
                    "Uploaded Dataset",
                )
            )
        )

        story.append(
            Paragraph(
                f"<b>Dataset:</b> {dataset_name}",
                body_style,
            )
        )

        story.append(
            Spacer(
                1,
                8,
            )
        )

        # =================================================
        # DATASET OVERVIEW
        # =================================================

        story.append(
            Paragraph(
                "Dataset Overview",
                heading_style,
            )
        )

        overview_data = [
            [
                "Rows",
                str(
                    compact_summary.get(
                        "rows",
                        "N/A",
                    )
                ),
            ],
            [
                "Columns",
                str(
                    compact_summary.get(
                        "columns",
                        "N/A",
                    )
                ),
            ],
            [
                "Missing Values",
                str(
                    compact_summary.get(
                        "missing_values",
                        "N/A",
                    )
                ),
            ],
            [
                "Duplicate Rows",
                str(
                    compact_summary.get(
                        "duplicate_rows",
                        "N/A",
                    )
                ),
            ],
            [
                "Quality Score",
                str(
                    compact_summary.get(
                        "quality_score",
                        "N/A",
                    )
                ),
            ],
        ]

        overview_table = Table(
            overview_data,
            colWidths=[
                55 * mm,
                100 * mm,
            ],
        )

        overview_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (0, -1),
                        colors.HexColor(
                            "#f1f5f9"
                        ),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, -1),
                        colors.HexColor(
                            "#0f172a"
                        ),
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor(
                            "#cbd5e1"
                        ),
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (0, -1),
                        "Helvetica-Bold",
                    ),
                    (
                        "FONTNAME",
                        (1, 0),
                        (1, -1),
                        "Helvetica",
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        7,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        7,
                    ),
                ]
            )
        )

        story.append(
            overview_table
        )

        story.append(
            Spacer(
                1,
                12,
            )
        )

        # =================================================
        # AI REPORT
        # =================================================

        story.append(
            Paragraph(
                "AI Analysis",
                heading_style,
            )
        )

        # =================================================
        # PARSE AI RESPONSE
        # =================================================

        lines = report_text.splitlines()

        for line in lines:

            clean_line = line.strip()

            if not clean_line:

                story.append(
                    Spacer(
                        1,
                        5,
                    )
                )

                continue

            # -------------------------------------------------
            # HEADINGS
            # -------------------------------------------------

            if clean_line.startswith("#"):

                heading = clean_line.lstrip(
                    "#"
                ).strip()

                story.append(
                    Paragraph(
                        escape(heading),
                        heading_style,
                    )
                )

            # -------------------------------------------------
            # BULLETS
            # -------------------------------------------------

            elif (
                clean_line.startswith("-")
                or clean_line.startswith("*")
                or clean_line.startswith("•")
            ):

                bullet = clean_line.lstrip(
                    "-*•"
                ).strip()

                story.append(
                    Paragraph(
                        f"• {escape(bullet)}",
                        bullet_style,
                    )
                )

            # -------------------------------------------------
            # NUMBERED POINTS
            # -------------------------------------------------

            elif (
                len(clean_line) > 2
                and clean_line[0].isdigit()
                and clean_line[1] in [
                    ".",
                    ")",
                ]
            ):

                story.append(
                    Paragraph(
                        escape(clean_line),
                        body_style,
                    )
                )

            # -------------------------------------------------
            # NORMAL TEXT
            # -------------------------------------------------

            else:

                story.append(
                    Paragraph(
                        escape(clean_line),
                        body_style,
                    )
                )

        # =================================================
        # FOOTER
        # =================================================

        story.append(
            Spacer(
                1,
                20,
            )
        )

        story.append(
            Paragraph(
                "Generated by InsightIQ AI",
                small_style,
            )
        )

        # =================================================
        # BUILD PDF
        # =================================================

        document.build(
            story
        )

        buffer.seek(0)

        # =================================================
        # DOWNLOAD
        # =================================================

        filename = (
            "InsightIQ_AI_Report.pdf"
        )

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                )
            },
        )

    except HTTPException:
        raise

    except Exception as error:

        print("=" * 80)
        print("PDF REPORT GENERATION ERROR")
        print("=" * 80)
        print(error)
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate PDF report.",
        )