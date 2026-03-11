from typing import List, Optional

from pydantic import BaseModel


class CourseItem(BaseModel):
    course_code: str
    course_name: Optional[str] = None
    course_type: Optional[str] = None
    confidence: float = 0.0


class ParseResponse(BaseModel):
    success: bool
    message: str
    filename: str
    detected_courses: List[CourseItem]
    raw_text: Optional[str] = None