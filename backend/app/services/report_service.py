from io import BytesIO
from datetime import datetime
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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
    PageBreak,
    KeepTogether,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics


# =========================================================
# PDF PAGE CONFIGURATION
# =========================================================

PAGE_WIDTH, PAGE_HEIGHT = A4

MARGIN_LEFT = 20 * mm
MARGIN_RIGHT = 20 * mm
MARGIN_TOP = 22 * mm
MARGIN_BOTTOM = 20 * mm


# =========================================================
# FONT SETUP
# =========================================================

def register_fonts():
    """
    Register common system fonts when available.

    The PDF generator falls back to Helvetica if the
    preferred fonts are not available.
    """

    font_candidates = [
        (
            "DejaVuSans",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ),
        (
            "Arial",
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ),
    ]

    for family, regular_path, bold_path in font_candidates:

        try:

            pdfmetrics.registerFont(
                TTFont(
                    family,
                    regular_path,
                )
            )

            pdfmetrics.registerFont(
                TTFont(
                    f"{family}-Bold",
                    bold_path,
                )
            )

            return family, f"{family}-Bold"

        except Exception:
            continue

    return "Helvetica", "Helvetica-Bold"


REGULAR_FONT, BOLD_FONT = register_fonts()


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_text(text: str) -> str:
    """
    Clean AI-generated text before converting it into
    PDF elements.
    """

    if not text:
        return ""

    text = str(text)

    # Normalize line endings.
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove markdown code fences.
    text = re.sub(
        r"```.*?\n",
        "",
        text,
        flags=re.DOTALL,
    )

    text = text.replace(
        "```",
        "",
    )

    return text.strip()


# =========================================================
# ESCAPE REPORTLAB HTML
# =========================================================

def escape_html(text: str) -> str:
    """
    Escape characters that ReportLab interprets as
    XML/HTML.
    """

    return (
        text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


# =========================================================
# MARKDOWN INLINE FORMATTING
# =========================================================

def format_inline_markdown(text: str) -> str:
    """
    Convert simple Markdown formatting into ReportLab
    compatible markup.
    """

    text = escape_html(text)

    # Bold: **text**
    text = re.sub(
        r"\*\*(.+?)\*\*",
        r"<b>\1</b>",
        text,
    )

    # Bold: __text__
    text = re.sub(
        r"__(.+?)__",
        r"<b>\1</b>",
        text,
    )

    # Italic: *text*
    text = re.sub(
        r"(?<!\*)\*([^*]+?)\*(?!\*)",
        r"<i>\1</i>",
        text,
    )

    # Inline code: `text`
    text = re.sub(
        r"`([^`]+)`",
        r"<font name=\"Courier\">\1</font>",
        text,
    )

    return text


# =========================================================
# REPORT STYLES
# =========================================================

def create_styles():
    """
    Create the complete visual style system used by
    InsightIQ PDF reports.
    """

    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="InsightIQTitle",
            parent=styles["Title"],
            fontName=BOLD_FONT,
            fontSize=24,
            leading=29,
            alignment=TA_CENTER,
            spaceAfter=8,
            textColor=colors.HexColor("#0f172a"),
        )
    )

    styles.add(
        ParagraphStyle(
            name="InsightIQSubtitle",
            parent=styles["Normal"],
            fontName=REGULAR_FONT,
            fontSize=10,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=4,
        )
    )

    styles.add(
        ParagraphStyle(
            name="InsightIQSection",
            parent=styles["Heading1"],
            fontName=BOLD_FONT,
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=14,
            spaceAfter=8,
        )
    )

    styles.add(
        ParagraphStyle(
            name="InsightIQSubsection",
            parent=styles["Heading2"],
            fontName=BOLD_FONT,
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=10,
            spaceAfter=5,
        )
    )

    styles.add(
        ParagraphStyle(
            name="InsightIQBody",
            parent=styles["BodyText"],
            fontName=REGULAR_FONT,
            fontSize=10,
            leading=16,
            textColor=colors.HexColor("#334155"),
            spaceAfter=7,
        )
    )

    styles.add(
        ParagraphStyle(
            name="InsightIQBullet",
            parent=styles["BodyText"],
            fontName=REGULAR_FONT,
            fontSize=10,
            leading=15,
            leftIndent=14,
            firstLineIndent=-8,
            textColor=colors.HexColor("#334155"),
            spaceAfter=5,
        )
    )

    styles.add(
        ParagraphStyle(
            name="InsightIQSmall",
            parent=styles["BodyText"],
            fontName=REGULAR_FONT,
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b"),
        )
    )

    styles.add(
        ParagraphStyle(
            name="InsightIQFooter",
            parent=styles["BodyText"],
            fontName=REGULAR_FONT,
            fontSize=8,
            leading=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#94a3b8"),
        )
    )

    return styles


# =========================================================
# PAGE HEADER / FOOTER
# =========================================================

def draw_page_header_footer(
    canvas,
    document,
):
    """
    Draw InsightIQ branding and page information on
    every PDF page.
    """

    canvas.saveState()

    page_number = canvas.getPageNumber()

    # -----------------------------------------------------
    # Header
    # -----------------------------------------------------

    canvas.setStrokeColor(
        colors.HexColor("#e2e8f0")
    )

    canvas.setLineWidth(0.5)

    canvas.line(
        MARGIN_LEFT,
        PAGE_HEIGHT - 13 * mm,
        PAGE_WIDTH - MARGIN_RIGHT,
        PAGE_HEIGHT - 13 * mm,
    )

    canvas.setFont(
        BOLD_FONT,
        8,
    )

    canvas.setFillColor(
        colors.HexColor("#2563eb")
    )

    canvas.drawString(
        MARGIN_LEFT,
        PAGE_HEIGHT - 10 * mm,
        "InsightIQ",
    )

    canvas.setFont(
        REGULAR_FONT,
        8,
    )

    canvas.setFillColor(
        colors.HexColor("#64748b")
    )

    canvas.drawRightString(
        PAGE_WIDTH - MARGIN_RIGHT,
        PAGE_HEIGHT - 10 * mm,
        "AI-Powered Business Intelligence",
    )

    # -----------------------------------------------------
    # Footer
    # -----------------------------------------------------

    canvas.setStrokeColor(
        colors.HexColor("#e2e8f0")
    )

    canvas.line(
        MARGIN_LEFT,
        13 * mm,
        PAGE_WIDTH - MARGIN_RIGHT,
        13 * mm,
    )

    canvas.setFont(
        REGULAR_FONT,
        7.5,
    )

    canvas.setFillColor(
        colors.HexColor("#94a3b8")
    )

    canvas.drawString(
        MARGIN_LEFT,
        8.5 * mm,
        "Generated by InsightIQ",
    )

    canvas.drawRightString(
        PAGE_WIDTH - MARGIN_RIGHT,
        8.5 * mm,
        f"Page {page_number}",
    )

    canvas.restoreState()


# =========================================================
# REPORT TITLE
# =========================================================

def add_report_header(
    story,
    styles,
    title: str,
    dataset_name: str | None,
):
    """
    Add the professional report cover/header.
    """

    story.append(
        Spacer(
            1,
            12 * mm,
        )
    )

    story.append(
        Paragraph(
            "INSIGHTIQ",
            ParagraphStyle(
                "BrandHeader",
                parent=styles["InsightIQSubtitle"],
                fontName=BOLD_FONT,
                fontSize=11,
                textColor=colors.HexColor("#2563eb"),
                spaceAfter=10,
            ),
        )
    )

    story.append(
        Paragraph(
            escape_html(title),
            styles["InsightIQTitle"],
        )
    )

    if dataset_name:

        story.append(
            Paragraph(
                f"Dataset: {escape_html(dataset_name)}",
                styles["InsightIQSubtitle"],
            )
        )

    generated_date = datetime.now().strftime(
        "%B %d, %Y"
    )

    story.append(
        Paragraph(
            f"Generated on {generated_date}",
            styles["InsightIQSubtitle"],
        )
    )

    story.append(
        Spacer(
            1,
            12 * mm,
        )
    )


# =========================================================
# REPORT TITLE DETECTION
# =========================================================

def detect_title(
    report_text: str,
    requested_title: str | None = None,
) -> str:
    """
    Determine a professional report title.
    """

    if requested_title:
        return requested_title.strip()

    lines = [
        line.strip()
        for line in report_text.split("\n")
        if line.strip()
    ]

    if not lines:
        return "InsightIQ Business Analysis Report"

    first_line = lines[0]

    # Remove Markdown heading markers.
    first_line = re.sub(
        r"^#{1,6}\s*",
        "",
        first_line,
    )

    # Remove common title labels.
    first_line = re.sub(
        r"^(title|report title)\s*:\s*",
        "",
        first_line,
        flags=re.IGNORECASE,
    )

    if len(first_line) <= 100:
        return first_line

    return "InsightIQ Business Analysis Report"


# =========================================================
# REPORT CONTENT PARSER
# =========================================================

def build_report_story(
    report_text: str,
    dataset_name: str | None = None,
    title: str | None = None,
):
    """
    Convert AI-generated Markdown-like report content
    into ReportLab flowable elements.
    """

    styles = create_styles()

    story = []

    report_text = clean_text(
        report_text
    )

    report_title = detect_title(
        report_text,
        title,
    )

    # -----------------------------------------------------
    # Header
    # -----------------------------------------------------

    add_report_header(
        story,
        styles,
        report_title,
        dataset_name,
    )

    # -----------------------------------------------------
    # Parse content
    # -----------------------------------------------------

    lines = report_text.split("\n")

    previous_was_blank = False

    for raw_line in lines:

        line = raw_line.strip()

        if not line:

            previous_was_blank = True
            continue

        # -------------------------------------------------
        # Markdown headings
        # -------------------------------------------------

        heading_match = re.match(
            r"^(#{1,6})\s+(.+)$",
            line,
        )

        if heading_match:

            heading_level = len(
                heading_match.group(1)
            )

            heading_text = (
                heading_match.group(2)
                .strip()
            )

            # Don't duplicate the report title.
            if (
                heading_text.lower()
                == report_title.lower()
            ):
                continue

            heading_text = format_inline_markdown(
                heading_text
            )

            if heading_level <= 2:

                story.append(
                    Paragraph(
                        heading_text,
                        styles["InsightIQSection"],
                    )
                )

            else:

                story.append(
                    Paragraph(
                        heading_text,
                        styles["InsightIQSubsection"],
                    )
                )

            previous_was_blank = False
            continue

        # -------------------------------------------------
        # Markdown horizontal rule
        # -------------------------------------------------

        if re.match(
            r"^(-{3,}|\*{3,}|_{3,})$",
            line,
        ):

            story.append(
                Spacer(
                    1,
                    5,
                )
            )

            previous_was_blank = False
            continue

        # -------------------------------------------------
        # Bullet points
        # -------------------------------------------------

        bullet_match = re.match(
            r"^[-*•]\s+(.+)$",
            line,
        )

        if bullet_match:

            bullet_text = (
                bullet_match.group(1)
                .strip()
            )

            bullet_text = format_inline_markdown(
                bullet_text
            )

            story.append(
                Paragraph(
                    f"• {bullet_text}",
                    styles["InsightIQBullet"],
                )
            )

            previous_was_blank = False
            continue

        # -------------------------------------------------
        # Numbered list
        # -------------------------------------------------

        numbered_match = re.match(
            r"^(\d+)[.)]\s+(.+)$",
            line,
        )

        if numbered_match:

            number = numbered_match.group(1)

            numbered_text = (
                numbered_match.group(2)
                .strip()
            )

            numbered_text = format_inline_markdown(
                numbered_text
            )

            story.append(
                Paragraph(
                    f"<b>{number}.</b> {numbered_text}",
                    styles["InsightIQBullet"],
                )
            )

            previous_was_blank = False
            continue

        # -------------------------------------------------
        # Bold label / value
        # -------------------------------------------------

        label_match = re.match(
            r"^\*\*(.+?)\*\*\s*:\s*(.+)$",
            line,
        )

        if label_match:

            label = escape_html(
                label_match.group(1).strip()
            )

            value = format_inline_markdown(
                label_match.group(2).strip()
            )

            story.append(
                Paragraph(
                    f"<b>{label}:</b> {value}",
                    styles["InsightIQBody"],
                )
            )

            previous_was_blank = False
            continue

        # -------------------------------------------------
        # Regular paragraph
        # -------------------------------------------------

        paragraph = format_inline_markdown(
            line
        )

        story.append(
            Paragraph(
                paragraph,
                styles["InsightIQBody"],
            )
        )

        if previous_was_blank:
            story.append(
                Spacer(
                    1,
                    2,
                )
            )

        previous_was_blank = False

    # -----------------------------------------------------
    # Final footer text
    # -----------------------------------------------------

    story.append(
        Spacer(
            1,
            12,
        )
    )

    story.append(
        Paragraph(
            "This report was generated using InsightIQ AI.",
            styles["InsightIQFooter"],
        )
    )

    return story


# =========================================================
# GENERATE PDF
# =========================================================

def generate_pdf_report(
    report_text: str,
    dataset_name: str | None = None,
    title: str | None = None,
) -> BytesIO:
    """
    Generate a complete professional PDF report.

    Returns:
        BytesIO containing the generated PDF.
    """

    if not report_text or not report_text.strip():

        raise ValueError(
            "Report content cannot be empty."
        )

    pdf_buffer = BytesIO()

    document = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        rightMargin=MARGIN_RIGHT,
        leftMargin=MARGIN_LEFT,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        title=(
            title
            or "InsightIQ Business Analysis Report"
        ),
        author="InsightIQ",
        subject="AI-generated business intelligence report",
    )

    story = build_report_story(
        report_text=report_text,
        dataset_name=dataset_name,
        title=title,
    )

    document.build(
        story,
        onFirstPage=draw_page_header_footer,
        onLaterPages=draw_page_header_footer,
    )

    pdf_buffer.seek(0)

    return pdf_buffer