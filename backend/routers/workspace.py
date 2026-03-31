from fastapi import APIRouter
from models.workspace import (
    NotesResponse,
    MaterialsResponse,
    ChatResponse,
    WorkspaceOverviewResponse,
)

router = APIRouter(prefix="/api/v1/workspace", tags=["Workspace"])


@router.get("/{course_code}", response_model=WorkspaceOverviewResponse)
def get_workspace_overview(course_code: str):
    normalized = course_code.upper().strip()

    return WorkspaceOverviewResponse(
        course_code=normalized,
        header_title=f"{normalized} Workspace",
        header_subtitle="Notes, materials, and AI chat will appear here."
    )


@router.get("/{course_code}/notes", response_model=NotesResponse)
def get_notes_stub(course_code: str):
    normalized = course_code.upper().strip()

    return NotesResponse(
        course_code=normalized,
        notes=[
            {
                "id": "note-1",
                "course_code": normalized,
                "title": "Sample Note",
                "content": "This is a placeholder note panel for Day 6.",
                "updated_at": "2026-03-19 10:00 AM",
            }
        ],
    )


@router.get("/{course_code}/materials", response_model=MaterialsResponse)
def get_materials_stub(course_code: str):
    normalized = course_code.upper().strip()

    return MaterialsResponse(
        course_code=normalized,
        materials=[
            {
                "id": "material-1",
                "course_code": normalized,
                "filename": "No uploaded file yet",
                "file_type": "placeholder",
                "status": "pending-day-8",
            }
        ],
    )


@router.get("/{course_code}/chat", response_model=ChatResponse)
def get_chat_stub(course_code: str):
    normalized = course_code.upper().strip()

    return ChatResponse(
        course_code=normalized,
        messages=[
            {
                "id": "msg-1",
                "role": "assistant",
                "content": "Chat endpoint stub is ready. Real chat starts on Day 10.",
                "created_at": "2026-03-19 10:00 AM",
            }
        ],
    )