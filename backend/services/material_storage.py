# backend/services/material_storage.py

import uuid
from pathlib import Path

import cloudinary.uploader
from fastapi import HTTPException, UploadFile

from services.cloudinary_init import cloudinary


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}


def normalize_course_code(code: str) -> str:
    return "".join(ch for ch in code.upper() if ch.isalnum())


def get_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_material_file(file: UploadFile):
    extension = get_extension(file.filename or "")

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF, DOCX, and PPTX are allowed.",
        )

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid content type for uploaded material.",
        )


def upload_file_to_cloudinary(course_code: str, file: UploadFile):
    normalized_course_code = normalize_course_code(course_code)
    extension = get_extension(file.filename or "")
    filename_stem = Path(file.filename or "file").stem
    unique_suffix = uuid.uuid4().hex[:10]
    public_id = f"{normalized_course_code}_{filename_stem}_{unique_suffix}"

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    result = cloudinary.uploader.upload(
        file.file,
        resource_type="raw",
        folder=f"course-materials/{normalized_course_code}",
        public_id=public_id,
        use_filename=False,
        overwrite=False,
    )

    return {
        "course_code": normalized_course_code,
        "title": file.filename or public_id + extension,
        "file_type": extension.replace(".", "").upper(),
        "content_type": file.content_type or "application/octet-stream",
        "file_size_bytes": file_size,
        "file_url": result["secure_url"],
        "public_id": result["public_id"],
    }