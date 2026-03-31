# backend/scripts/normalize_notes.py
import sys
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))
from services.firebase_admin_init import db


def normalize_course_code(code: str) -> str:
    return "".join(code.upper().split())


def run():
    print("Starting normalization...")

    docs = db.collection("courseNotes").stream()

    count = 0

    for doc in docs:
        data = doc.to_dict()

        if "course_code" not in data:
            continue

        original = data["course_code"]
        normalized = normalize_course_code(original)

        # Only update if different
        if original != normalized:
            doc.reference.update({
                "course_code": normalized
            })

            print(f"Updated: {original} → {normalized}")
            count += 1

    print(f"\nDone. Updated {count} documents.")


if __name__ == "__main__":
    run()