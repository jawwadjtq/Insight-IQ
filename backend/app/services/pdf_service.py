"""
InsightIQ PDF processing service.

This module handles:

1. PDF text extraction
2. Large-document text chunking
3. Page-aware extraction
4. Safe text limits

IMPORTANT:

The complete PDF must NEVER be sent to the AI as one request.

Large PDFs are divided into manageable chunks and each chunk
can be analyzed independently by the AI service.
"""

from __future__ import annotations

from typing import BinaryIO

import fitz


# =========================================================
# CONFIGURATION
# =========================================================

# Maximum characters in one AI-analysis chunk.
# This is intentionally conservative to protect token limits.
DEFAULT_CHUNK_SIZE = 12000


# Minimum useful text length.
MIN_TEXT_LENGTH = 20


# =========================================================
# EXTRACT PDF TEXT
# =========================================================

def extract_pdf_text(
    file: BinaryIO,
) -> str:
    """
    Extract readable text from an uploaded PDF.

    The PDF is read from the provided file object.

    Returns:
        Complete extracted text.

    IMPORTANT:
        This function extracts the text only.
        It does NOT send anything to the AI.
    """

    if file is None:
        raise ValueError(
            "No PDF file was provided."
        )

    # -----------------------------------------------------
    # Read uploaded file
    # -----------------------------------------------------

    pdf_bytes = file.read()

    if not pdf_bytes:
        raise ValueError(
            "The PDF file is empty."
        )

    # -----------------------------------------------------
    # Open PDF
    # -----------------------------------------------------

    pdf = fitz.open(
        stream=pdf_bytes,
        filetype="pdf",
    )

    try:

        text_parts: list[str] = []

        # -------------------------------------------------
        # Extract page by page
        # -------------------------------------------------

        for page in pdf:

            page_text = page.get_text(
                "text"
            )

            if not page_text:
                continue

            page_text = page_text.strip()

            if not page_text:
                continue

            text_parts.append(
                page_text
            )

        # -------------------------------------------------
        # Combine pages
        # -------------------------------------------------

        return "\n\n".join(
            text_parts
        ).strip()

    finally:

        pdf.close()


# =========================================================
# EXTRACT PDF TEXT WITH PAGE INFORMATION
# =========================================================

def extract_pdf_pages(
    file: BinaryIO,
) -> list[dict]:
    """
    Extract PDF text page-by-page.

    Returns:

    [
        {
            "page": 1,
            "text": "..."
        },
        ...
    ]

    Keeping page information is useful for large documents
    because AI findings can later be traced back to pages.
    """

    if file is None:
        raise ValueError(
            "No PDF file was provided."
        )

    pdf_bytes = file.read()

    if not pdf_bytes:
        raise ValueError(
            "The PDF file is empty."
        )

    pdf = fitz.open(
        stream=pdf_bytes,
        filetype="pdf",
    )

    pages: list[dict] = []

    try:

        for page_number, page in enumerate(
            pdf,
            start=1,
        ):

            page_text = page.get_text(
                "text"
            )

            if not page_text:
                continue

            page_text = page_text.strip()

            if not page_text:
                continue

            pages.append(
                {
                    "page": page_number,
                    "text": page_text,
                }
            )

        return pages

    finally:

        pdf.close()


# =========================================================
# SPLIT TEXT INTO CHUNKS
# =========================================================

def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
) -> list[str]:
    """
    Split large text into manageable chunks.

    The function attempts to split on paragraph boundaries
    instead of cutting sentences randomly.

    Args:
        text:
            Extracted PDF text.

        chunk_size:
            Maximum approximate number of characters
            per chunk.

    Returns:
        List of text chunks.
    """

    if not text:
        return []

    text = text.strip()

    if len(text) < MIN_TEXT_LENGTH:
        return []

    # -----------------------------------------------------
    # Protect against invalid chunk size
    # -----------------------------------------------------

    chunk_size = max(
        1000,
        int(chunk_size),
    )

    # -----------------------------------------------------
    # Already small enough
    # -----------------------------------------------------

    if len(text) <= chunk_size:
        return [text]

    # -----------------------------------------------------
    # Split into paragraphs
    # -----------------------------------------------------

    paragraphs = [
        paragraph.strip()
        for paragraph in text.split(
            "\n\n"
        )
        if paragraph.strip()
    ]

    chunks: list[str] = []

    current_chunk: list[str] = []

    current_length = 0

    # -----------------------------------------------------
    # Build chunks paragraph by paragraph
    # -----------------------------------------------------

    for paragraph in paragraphs:

        paragraph_length = len(
            paragraph
        )

        # -----------------------------------------------
        # Extremely large paragraph
        # -----------------------------------------------

        if paragraph_length > chunk_size:

            # Flush current chunk first.
            if current_chunk:

                chunks.append(
                    "\n\n".join(
                        current_chunk
                    )
                )

                current_chunk = []

                current_length = 0

            # -------------------------------------------
            # Split giant paragraph
            # -------------------------------------------

            start = 0

            while start < paragraph_length:

                end = min(
                    start + chunk_size,
                    paragraph_length,
                )

                piece = paragraph[
                    start:end
                ].strip()

                if piece:
                    chunks.append(
                        piece
                    )

                start = end

            continue

        # -----------------------------------------------
        # Would exceed chunk size
        # -----------------------------------------------

        if (
            current_length
            + paragraph_length
            + 2
            > chunk_size
        ):

            if current_chunk:

                chunks.append(
                    "\n\n".join(
                        current_chunk
                    )
                )

            current_chunk = [
                paragraph
            ]

            current_length = (
                paragraph_length
            )

        # -----------------------------------------------
        # Add to current chunk
        # -----------------------------------------------

        else:

            current_chunk.append(
                paragraph
            )

            if current_length:

                current_length += 2

            current_length += (
                paragraph_length
            )

    # -----------------------------------------------------
    # Final chunk
    # -----------------------------------------------------

    if current_chunk:

        chunks.append(
            "\n\n".join(
                current_chunk
            )
        )

    return chunks


# =========================================================
# PAGE-AWARE CHUNKING
# =========================================================

def chunk_pdf_pages(
    pages: list[dict],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
) -> list[dict]:
    """
    Convert page-level PDF text into AI-ready chunks.

    Each returned chunk contains:

    {
        "chunk_number": 1,
        "page_start": 1,
        "page_end": 3,
        "text": "..."
    }

    This allows InsightIQ to retain document location
    information while processing large PDFs.
    """

    if not pages:
        return []

    chunk_size = max(
        1000,
        int(chunk_size),
    )

    chunks: list[dict] = []

    current_text_parts: list[str] = []

    current_length = 0

    current_page_start: int | None = None

    current_page_end: int | None = None

    # -----------------------------------------------------
    # Process pages
    # -----------------------------------------------------

    for page in pages:

        page_number = int(
            page.get(
                "page",
                0,
            )
        )

        page_text = str(
            page.get(
                "text",
                "",
            )
        ).strip()

        if not page_text:
            continue

        # -------------------------------------------------
        # Page marker
        # -------------------------------------------------

        page_content = (
            f"[Page {page_number}]\n"
            f"{page_text}"
        )

        page_length = len(
            page_content
        )

        # -------------------------------------------------
        # First page
        # -------------------------------------------------

        if current_page_start is None:

            current_page_start = (
                page_number
            )

            current_page_end = (
                page_number
            )

        # -------------------------------------------------
        # Page would exceed chunk
        # -------------------------------------------------

        if (
            current_text_parts
            and current_length
            + page_length
            + 2
            > chunk_size
        ):

            chunks.append(
                {
                    "chunk_number": len(chunks) + 1,
                    "page_start": current_page_start,
                    "page_end": current_page_end,
                    "text": "\n\n".join(
                        current_text_parts
                    ),
                }
            )

            current_text_parts = []

            current_length = 0

            current_page_start = (
                page_number
            )

        # -------------------------------------------------
        # Add page
        # -------------------------------------------------

        current_text_parts.append(
            page_content
        )

        current_length += (
            page_length
        )

        current_page_end = (
            page_number
        )

        # -------------------------------------------------
        # Handle a single page larger than chunk size
        # -------------------------------------------------

        if current_length > chunk_size:

            oversized_text = (
                "\n\n".join(
                    current_text_parts
                )
            )

            oversized_chunks = chunk_text(
                oversized_text,
                chunk_size,
            )

            # Remove temporary page aggregation.
            current_text_parts = []

            current_length = 0

            for piece in oversized_chunks:

                chunks.append(
                    {
                        "chunk_number": len(chunks) + 1,
                        "page_start": current_page_start,
                        "page_end": current_page_end,
                        "text": piece,
                    }
                )

            current_page_start = None
            current_page_end = None

    # -----------------------------------------------------
    # Final chunk
    # -----------------------------------------------------

    if current_text_parts:

        chunks.append(
            {
                "chunk_number": len(chunks) + 1,
                "page_start": current_page_start,
                "page_end": current_page_end,
                "text": "\n\n".join(
                    current_text_parts
                ),
            }
        )

    # -----------------------------------------------------
    # Re-number chunks
    # -----------------------------------------------------

    for index, chunk in enumerate(
        chunks,
        start=1,
    ):

        chunk["chunk_number"] = index

    return chunks


# =========================================================
# PDF STATISTICS
# =========================================================

def get_pdf_statistics(
    file: BinaryIO,
) -> dict:
    """
    Return lightweight PDF statistics.

    Useful before starting AI processing.
    """

    if file is None:
        raise ValueError(
            "No PDF file was provided."
        )

    pdf_bytes = file.read()

    if not pdf_bytes:
        raise ValueError(
            "The PDF file is empty."
        )

    pdf = fitz.open(
        stream=pdf_bytes,
        filetype="pdf",
    )

    try:

        total_pages = len(pdf)

        total_characters = 0

        pages_with_text = 0

        for page in pdf:

            text = page.get_text(
                "text"
            )

            if text:

                text = text.strip()

                if text:

                    pages_with_text += 1

                    total_characters += len(
                        text
                    )

        return {
            "pages": total_pages,
            "pages_with_text": pages_with_text,
            "characters": total_characters,
            "has_text": (
                total_characters > 0
            ),
        }

    finally:

        pdf.close()