# backend/models/notes.py

from pydantic import BaseModel, Field
from typing import List


class NoteCreateRequest(BaseModel):
    course_code: str = Field(..., min_length=6)
    title: str = Field(..., min_length=1, max_length=120)
    content: str = Field(..., min_length=1)


class NoteUpdateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    content: str = Field(..., min_length=1)


class NoteItem(BaseModel):
    id: str
    course_code: str
    title: str
    content: str
    updated_at: str


class NoteListResponse(BaseModel):
    success: bool = True
    course_code: str
    notes: List[NoteItem]


class NoteSingleResponse(BaseModel):
    success: bool = True
    note: NoteItem


class NoteDeleteResponse(BaseModel):
    success: bool = True
    message: str