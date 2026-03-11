import re
from typing import List

from models.schemas import CourseItem

COURSE_CODE_PATTERN = re.compile(r"\b(?:CSE|HUM|ECE|EEE|ME)\s*-?\s*\d{4}[A-Za-z]?\b", re.IGNORECASE)


def normalize_course_code(raw_code: str) -> str:
    """
    Normalizes OCR-like variations:
    - CSE3219 -> CSE 3219
    - CSE-3219 -> CSE 3219
    - cse 3219 -> CSE 3219
    """
    cleaned = raw_code.upper().strip()
    cleaned = cleaned.replace("-", " ")
    cleaned = re.sub(r"\s+", " ", cleaned)

    # split prefix and code safely
    match = re.match(r"([A-Z]+)\s*(\d{4})", cleaned.replace(" ", ""))
    if match:
        prefix, digits = match.groups()
        return f"{prefix} {digits}"

    # fallback for already spaced forms
    match = re.match(r"([A-Z]+)\s+(\d{4})", cleaned)
    if match:
        prefix, digits = match.groups()
        return f"{prefix} {digits}"

    return cleaned


def extract_course_items_from_text(text: str) -> List[CourseItem]:
    matches = COURSE_CODE_PATTERN.findall(text or "")
    normalized = [normalize_course_code(item) for item in matches]

    distinct_codes = []
    seen = set()

    for code in normalized:
        if code not in seen:
            seen.add(code)
            distinct_codes.append(code)

    return [
        CourseItem(
            course_code=code,
            course_name=None,
            course_type=None,
            confidence=0.8,
        )
        for code in distinct_codes
    ]