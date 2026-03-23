# backend/routers/materials.py

from datetime import datetime
import mimetypes
import os
import tempfile

import cloudinary.uploader
import requests
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from google.cloud.firestore_v1.base_query import FieldFilter

from services.file_text_extractor import extract_text_by_filename
from services.firebase_admin_init import db
from services.material_storage import upload_file_to_cloudinary

router = APIRouter(prefix="/api/v1/materials", tags=["Materials"])

COLLECTION = "courseMaterials"


def normalize_course_code(code: str) -> str:
    return "".join(code.upper().split())


def now_string():
    return datetime.now().strftime("%Y-%m-%d %I:%M %p")


@router.post("/upload")
def upload_material(course_code: str, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid file.")

    normalized_code = normalize_course_code(course_code)

    try:
        file_bytes = file.file.read()
        file.file.seek(0)

        result = upload_file_to_cloudinary(normalized_code, file)

        extraction_status = "processing"
        extracted_text = ""
        extraction_error = ""
        extracted_at = None

        try:
            extracted_text = extract_text_by_filename(file.filename, file_bytes)
            extraction_status = "completed"
            extracted_at = now_string()
        except Exception as extraction_exception:
            extraction_status = "failed"
            extraction_error = str(extraction_exception)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    new_doc = {
        "course_code": normalized_code,
        "filename": file.filename,
        "file_url": result["file_url"],
        "public_id": result["public_id"],
        "uploaded_at": now_string(),
        "extraction_status": extraction_status,
        "extracted_text": extracted_text,
        "extraction_error": extraction_error,
        "extracted_at": extracted_at,
    }

    doc_ref = db.collection(COLLECTION).document()
    doc_ref.set(new_doc)

    return {
        "id": doc_ref.id,
        **new_doc
    }


@router.get("/{course_code}")
def get_materials(course_code: str):
    normalized_code = normalize_course_code(course_code)

    docs = (
        db.collection(COLLECTION)
        .where(filter=FieldFilter("course_code", "==", normalized_code))
        .stream()
    )

    materials = []
    for doc in docs:
        data = doc.to_dict()
        full_text = data.get("extracted_text", "") or ""

        materials.append({
            "id": doc.id,
            "filename": data["filename"],
            "file_url": data["file_url"],
            "uploaded_at": data["uploaded_at"],
            "extraction_status": data.get("extraction_status", "processing"),
            "extraction_error": data.get("extraction_error", ""),
            "extracted_at": data.get("extracted_at"),
            "text_preview": full_text[:300],
        })

    return {"materials": materials}


@router.get("/detail/{material_id}")
def get_material_detail(material_id: str):
    doc_ref = db.collection(COLLECTION).document(material_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Material not found.")

    data = doc.to_dict()

    return {
        "id": doc.id,
        "filename": data["filename"],
        "file_url": data["file_url"],
        "uploaded_at": data["uploaded_at"],
        "extraction_status": data.get("extraction_status", "processing"),
        "extraction_error": data.get("extraction_error", ""),
        "extracted_at": data.get("extracted_at"),
        "extracted_text": data.get("extracted_text", ""),
    }


@router.get("/preview/{material_id}")
def preview_material(material_id: str):
    doc_ref = db.collection(COLLECTION).document(material_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Material not found.")

    data = doc.to_dict()
    file_url = data["file_url"]
    filename = data["filename"]

    response = requests.get(file_url, timeout=30)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch file from Cloudinary.")

    suffix = os.path.splitext(filename)[1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(response.content)
    tmp.close()

    media_type, _ = mimetypes.guess_type(filename)
    if not media_type:
        media_type = "application/octet-stream"

    return FileResponse(
        path=tmp.name,
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.get("/download/{material_id}")
def download_material(material_id: str):
    doc_ref = db.collection(COLLECTION).document(material_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Material not found.")

    data = doc.to_dict()
    file_url = data["file_url"]
    filename = data["filename"]

    response = requests.get(file_url, timeout=30)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch file from Cloudinary.")

    suffix = os.path.splitext(filename)[1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(response.content)
    tmp.close()

    media_type, _ = mimetypes.guess_type(filename)
    if not media_type:
        media_type = "application/octet-stream"

    return FileResponse(
        path=tmp.name,
        media_type=media_type,
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.delete("/{material_id}")
def delete_material(material_id: str):
    doc_ref = db.collection(COLLECTION).document(material_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Material not found.")

    data = doc.to_dict()
    public_id = data.get("public_id")

    try:
        if public_id:
            cloudinary.uploader.destroy(
                public_id,
                resource_type="raw",
                invalidate=True,
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary delete failed: {str(e)}")

    doc_ref.delete()

    return {"message": "Material deleted successfully"}