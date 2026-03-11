import re
from collections import Counter
from typing import List

from models.schemas import CourseItem

VALID_PREFIXES = [
    "CSE", "HUM", "EEE", "ECE", "ME", "CE", "BME", "BECM", "IEM",
    "MTE", "MSE", "LE", "TE", "ARCH", "URP", "CHE", "ESE", "MATH"
]

PREFIX_PATTERN = "|".join(sorted(VALID_PREFIXES, key=len, reverse=True))

COURSE_CODE_PATTERN = re.compile(
    rf"\b(?:{PREFIX_PATTERN})\s*-?\s*[0-9IOBST]{{4}}[A-Za-z]?\b",
    re.IGNORECASE,
)

PREFIX_ONLY_PATTERN = re.compile(
    rf"\b(?:{PREFIX_PATTERN})\b",
    re.IGNORECASE,
)

DIGIT_ONLY_PATTERN = re.compile(r"\b[0-9IOBST]{4}\b", re.IGNORECASE)


def normalize_course_code(raw_code: str) -> str:
    cleaned = raw_code.upper().strip()
    cleaned = cleaned.replace("-", " ")
    cleaned = re.sub(r"\s+", "", cleaned)

    match = re.match(r"([A-Z]{2,5})([0-9IOBST]{4})", cleaned)
    if not match:
        return raw_code.upper().strip()

    prefix, digits = match.groups()

    translation_map = str.maketrans({
        "I": "1",
        "O": "0",
        "B": "8",
        "S": "5",
        "T": "7",
    })
    digits = digits.translate(translation_map)

    if len(digits) != 4 or not digits.isdigit():
        return raw_code.upper().strip()

    return f"{prefix} {digits}"


def _is_valid_final_code(code: str) -> bool:
    return re.fullmatch(rf"(?:{PREFIX_PATTERN})\s\d{{4}}", code) is not None


def _extract_direct_matches(text: str) -> list[str]:
    return [m.group(0) for m in COURSE_CODE_PATTERN.finditer(text or "")]


def _extract_joined_token_matches(text: str) -> list[str]:
    """
    Handles OCR cases where prefix and digits are split:
    ECE 2101
    MATH 2109
    """
    tokens = re.findall(r"[A-Za-z0-9IOBST]+", text or "")
    results = []

    for i in range(len(tokens) - 1):
        left = tokens[i].upper()
        right = tokens[i + 1].upper()

        if re.fullmatch(rf"(?:{PREFIX_PATTERN})", left) and re.fullmatch(r"[0-9IOBST]{{4}}", right):
            results.append(f"{left} {right}")

    return results


def _confidence_for_votes(votes: int) -> float:
    if votes >= 4:
        return 0.95
    if votes >= 2:
        return 0.90
    return 0.82


def extract_course_items_from_text(text: str) -> List[CourseItem]:
    candidates = []
    candidates.extend(_extract_direct_matches(text))
    candidates.extend(_extract_joined_token_matches(text))

    normalized_codes = []
    for raw_code in candidates:
        normalized = normalize_course_code(raw_code)
        if _is_valid_final_code(normalized):
            normalized_codes.append(normalized)

    vote_counter = Counter(normalized_codes)

    distinct_items = []
    for code, votes in vote_counter.items():
        # vote filter reduces false positives like wrong single-read garbage
        if votes < 2:
            continue

        distinct_items.append(
            CourseItem(
                course_code=code,
                course_name=None,
                course_type=None,
                confidence=_confidence_for_votes(votes),
            )
        )

    distinct_items.sort(key=lambda item: item.course_code)
    return distinct_items