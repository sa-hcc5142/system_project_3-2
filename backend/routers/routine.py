from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from config import get_settings
from models.schemas import ParseResponse
from services.ocr_service import extract_text_from_image
from services.parser_service import extract_course_items_from_text

router = APIRouter(prefix="/api/v1/routine", tags=["Routine"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".pdf"}


@router.post("/parse", response_model=ParseResponse)
async def parse_routine(file: UploadFile = File(...)):
    settings = get_settings()

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename received.",
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {extension}. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max allowed size is {settings.max_file_size_mb} MB.",
        )

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{uuid4().hex}{extension}"
    saved_path = upload_dir / safe_name

    with open(saved_path, "wb") as f:
        f.write(content)

    try:
        raw_text = extract_text_from_image(str(saved_path))
        detected_courses = extract_course_items_from_text(raw_text)

        if len(detected_courses) == 0:
            message = (
                "Routine processed successfully, but no course codes were detected. "
                "Try a clearer image or correct them manually in confirmation."
            )
        else:
            structured_count = sum(
                1 for item in detected_courses
                if item.course_name is not None and item.course_type is not None
            )
            uncertain_count = len(detected_courses) - structured_count

            if uncertain_count == 0:
                message = (
                    f"Routine processed successfully. {len(detected_courses)} structured course(s) detected."
                )
            else:
                message = (
                    f"Routine processed successfully. {len(detected_courses)} course(s) detected, "
                    f"including {uncertain_count} uncertain item(s) that may need confirmation."
                )

        return ParseResponse(
            success=True,
            message=message,
            filename=file.filename,
            detected_courses=detected_courses,
            raw_text=raw_text,
        )

    except ValueError as exc:
        return ParseResponse(
            success=True,
            message=str(exc),
            filename=file.filename,
            detected_courses=[],
            raw_text="",
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Routine parsing failed: {str(exc)}",
        )