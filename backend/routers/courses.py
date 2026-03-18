import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/courses", tags=["Courses"])

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIRMED_COURSES_PATH = BASE_DIR / "data" / "confirmed_courses.json"


class ConfirmedCourse(BaseModel):
    code: str
    title: str
    type: str


class ConfirmCoursesRequest(BaseModel):
    courses: list[ConfirmedCourse]


def _read_confirmed_courses():
    if not CONFIRMED_COURSES_PATH.exists():
        return []

    with open(CONFIRMED_COURSES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_confirmed_courses(courses):
    CONFIRMED_COURSES_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIRMED_COURSES_PATH, "w", encoding="utf-8") as f:
        json.dump(courses, f, indent=2)


@router.get("")
def get_courses():
    return {
        "success": True,
        "courses": _read_confirmed_courses(),
    }


@router.post("/confirm")
def confirm_courses(payload: ConfirmCoursesRequest):
    if not payload.courses:
        raise HTTPException(status_code=400, detail="No courses provided.")

    serialized = [course.model_dump() for course in payload.courses]
    _write_confirmed_courses(serialized)

    return {
        "success": True,
        "message": f"{len(serialized)} course(s) saved successfully.",
        "courses": serialized,
    }