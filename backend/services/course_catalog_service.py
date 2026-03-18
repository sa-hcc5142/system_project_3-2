from pathlib import Path
import csv


BASE_DIR = Path(__file__).resolve().parent.parent
CATALOG_PATH = BASE_DIR / "data" / "course_catalog.csv"


def normalize_code(value: str) -> str:
    return value.strip().upper().replace(" ", "").replace("-", "")


def load_course_catalog() -> dict[str, dict[str, str]]:
    catalog = {}

    with open(CATALOG_PATH, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_code = row["course_code"].strip().upper()
            normalized = normalize_code(raw_code)

            catalog[normalized] = {
                "course_code": raw_code,
                "course_name": row["course_name"].strip(),
                "course_type": row["course_type"].strip(),
            }

    return catalog


def get_course_metadata(course_code: str) -> dict[str, str | None]:
    catalog = load_course_catalog()
    normalized_code = normalize_code(course_code)

    if normalized_code in catalog:
        entry = catalog[normalized_code]
        return {
            "course_code": entry["course_code"],
            "course_name": entry["course_name"],
            "course_type": entry["course_type"],
        }

    return {
        "course_code": course_code,
        "course_name": None,
        "course_type": None,
    }


def get_all_catalog_codes() -> list[str]:
    return list(load_course_catalog().keys())