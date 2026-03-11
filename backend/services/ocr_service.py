from pathlib import Path


def extract_text_from_image(image_path: str) -> str:
    """
    Placeholder OCR service for Day-2.

    Real OCR integration (EasyOCR / Tesseract / PaddleOCR)
    will be added in Day-3.
    """
    path = Path(image_path)

    if not path.exists():
        return ""

    return ""