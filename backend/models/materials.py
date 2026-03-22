# backend/models/materials.py

from pydantic import BaseModel
from typing import List


class MaterialItem(BaseModel):
    id: str
    course_code: str
    title: str
    file_type: str
    content_type: str
    uploaded_at: str
    status: str
    file_size_bytes: int
    file_url: str
    public_id: str


class MaterialListResponse(BaseModel):
    success: bool = True
    course_code: str
    materials: List[MaterialItem]


class MaterialUploadResponse(BaseModel):
    success: bool = True
    material: MaterialItem