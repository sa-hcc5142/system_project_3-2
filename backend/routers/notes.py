# backend/routers/notes.py

from datetime import datetime

from fastapi import APIRouter, HTTPException
from google.cloud.firestore_v1.base_query import FieldFilter

from models.notes import (
    NoteCreateRequest,
    NoteUpdateRequest,
    NoteListResponse,
    NoteSingleResponse,
    NoteDeleteResponse,
)
from services.firebase_admin_init import db

router = APIRouter(prefix="/api/v1/notes", tags=["Notes"])

NOTES_COLLECTION = "courseNotes"


def now_string():
    return datetime.now().strftime("%Y-%m-%d %I:%M %p")


@router.get("/{course_code}", response_model=NoteListResponse)
def get_notes_by_course(course_code: str):
    notes_ref = db.collection(NOTES_COLLECTION)
    query = notes_ref.where(filter=FieldFilter("course_code", "==", course_code))
    docs = query.stream()

    notes = []
    for doc in docs:
        data = doc.to_dict()
        notes.append({
            "id": doc.id,
            "course_code": data["course_code"],
            "title": data["title"],
            "content": data["content"],
            "updated_at": data["updated_at"],
        })

    notes.sort(key=lambda x: x["updated_at"], reverse=True)

    return NoteListResponse(
        course_code=course_code,
        notes=notes,
    )


@router.post("", response_model=NoteSingleResponse)
def create_note(payload: NoteCreateRequest):
    new_note = {
        "course_code": payload.course_code.strip(),
        "title": payload.title.strip(),
        "content": payload.content.strip(),
        "updated_at": now_string(),
    }

    doc_ref = db.collection(NOTES_COLLECTION).document()
    doc_ref.set(new_note)

    return NoteSingleResponse(
        note={
            "id": doc_ref.id,
            **new_note
        }
    )


@router.put("/{note_id}", response_model=NoteSingleResponse)
def update_note(note_id: str, payload: NoteUpdateRequest):
    doc_ref = db.collection(NOTES_COLLECTION).document(note_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found.")

    existing = doc.to_dict()

    updated_note = {
        "course_code": existing["course_code"],
        "title": payload.title.strip(),
        "content": payload.content.strip(),
        "updated_at": now_string(),
    }

    doc_ref.set(updated_note)

    return NoteSingleResponse(
        note={
            "id": note_id,
            **updated_note
        }
    )


@router.delete("/{note_id}", response_model=NoteDeleteResponse)
def delete_note(note_id: str):
    doc_ref = db.collection(NOTES_COLLECTION).document(note_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found.")

    doc_ref.delete()

    return NoteDeleteResponse(message="Note deleted successfully.")