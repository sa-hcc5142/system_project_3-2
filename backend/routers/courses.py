from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/courses", tags=["Courses"])


@router.get("")
def get_courses():
    return {
        "success": True,
        "message": "Courses endpoint is ready. Database integration will be added later.",
        "data": [],
    }