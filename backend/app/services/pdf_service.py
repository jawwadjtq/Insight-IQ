import fitz


def extract_pdf_text(file) -> str:
    """
    Extract all text from a PDF file.
    """

    pdf = fitz.open(stream=file.read(), filetype="pdf")

    text = ""

    for page in pdf:
        text += page.get_text()

    pdf.close()

    return text