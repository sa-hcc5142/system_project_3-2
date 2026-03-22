# backend/routers/materials.py

from datetime import datetime

from fastapi import APIRouter, File, UploadFile
from google.cloud.firestore_v1.base_query import FieldFilter

from models.materials import MaterialListResponse, MaterialUploadResponse
from services.firebase_admin_init import db
from services.material_storage import (
    normalize_course_code,
    upload_file_to_cloudinary,
    validate_material_file,
)
import cloudinary.uploader

router = APIRouter(prefix="/api/v1/materials", tags=["Materials"])

MATERIALS_COLLECTION = "courseMaterials"


def now_string() -> str:
    return datetime.now().strftime("%Y-%m-%d %I:%M %p")


@router.post("/upload/{course_code}", response_model=MaterialUploadResponse)
def upload_material(course_code: str, file: UploadFile = File(...)):
    normalized_course_code = normalize_course_code(course_code)

    validate_material_file(file)
    uploaded = upload_file_to_cloudinary(normalized_course_code, file)

    material_doc = {
        "course_code": uploaded["course_code"],
        "title": uploaded["title"],
        "file_type": uploaded["file_type"],
        "content_type": uploaded["content_type"],
        "uploaded_at": now_string(),
        "status": "uploaded",
        "file_size_bytes": uploaded["file_size_bytes"],
        "file_url": uploaded["file_url"],
        "public_id": uploaded["public_id"],
    }

    doc_ref = db.collection(MATERIALS_COLLECTION).document()
    doc_ref.set(material_doc)

    return MaterialUploadResponse(
        material={
            "id": doc_ref.id,
            "course_code": material_doc["course_code"],
            "title": material_doc["title"],
            "file_type": material_doc["file_type"],
            "content_type": material_doc["content_type"],
            "uploaded_at": material_doc["uploaded_at"],
            "status": material_doc["status"],
            "file_size_bytes": material_doc["file_size_bytes"],
            "file_url": material_doc["file_url"],
            "public_id": material_doc["public_id"],
        }
    )


@router.get("/{course_code}", response_model=MaterialListResponse)
def get_materials_by_course(course_code: str):
    normalized_course_code = normalize_course_code(course_code)

    query = db.collection(MATERIALS_COLLECTION).where(
        filter=FieldFilter("course_code", "==", normalized_course_code)
    )
    docs = query.stream()

    materials = []
    for doc in docs:
        data = doc.to_dict()
        materials.append({
            "id": doc.id,
            "course_code": data["course_code"],
            "title": data["title"],
            "file_type": data["file_type"],
            "content_type": data["content_type"],
            "uploaded_at": data["uploaded_at"],
            "status": data["status"],
            "file_size_bytes": data["file_size_bytes"],
            "file_url": data["file_url"],
            "public_id": data["public_id"],
        })

    materials.sort(key=lambda x: x["uploaded_at"], reverse=True)

    return MaterialListResponse(
        course_code=normalized_course_code,
        materials=materials,
    )

@router.delete("/{material_id}")
def delete_material(material_id: str):
    doc_ref = db.collection("courseMaterials").document(material_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Material not found")

    data = doc.to_dict()
    public_id = data.get("public_id")

    if public_id:
        cloudinary.uploader.destroy(public_id)

    doc_ref.delete()

    return {"message": "Deleted successfully"}