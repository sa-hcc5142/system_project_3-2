from pydantic import BaseModel
from typing import List


class NoteStub(BaseModel):
    id: str
    course_code: str
    title: str
    content: str
    updated_at: str


class MaterialStub(BaseModel):
    id: str
    course_code: str
    filename: str
    file_type: str
    status: str


class ChatMessageStub(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class NotesResponse(BaseModel):
    success: bool = True
    course_code: str
    notes: List[NoteStub]


class MaterialsResponse(BaseModel):
    success: bool = True
    course_code: str
    materials: List[MaterialStub]


class ChatResponse(BaseModel):
    success: bool = True
    course_code: str
    messages: List[ChatMessageStub]


class WorkspaceOverviewResponse(BaseModel):
    success: bool = True
    course_code: str
    header_title: str
    header_subtitle: str
    notes_enabled: bool = True
    materials_enabled: bool = True
    chat_enabled: bool = True