// frontend/src/lib/notes-api.ts

const BASE_URL = "http://127.0.0.1:8000";

export type NoteItem = {
  id: string;
  course_code: string;
  title: string;
  content: string;
  updated_at: string;
};

function normalizeCourseCode(courseCode: string): string {
  return courseCode.replace(/\s+/g, "").toUpperCase();
}

export async function fetchNotesByCourse(courseCode: string): Promise<NoteItem[]> {
  const normalizedCourseCode = normalizeCourseCode(courseCode);

  const response = await fetch(
    `${BASE_URL}/api/v1/notes/${encodeURIComponent(normalizedCourseCode)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load notes.");
  }

  const data = await response.json();
  return data.notes || [];
}

export async function createNote(courseCode: string, title: string, content: string) {
  const normalizedCourseCode = normalizeCourseCode(courseCode);

  const response = await fetch(`${BASE_URL}/api/v1/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      course_code: normalizedCourseCode,
      title,
      content,
    }),
  });

  if (!response.ok) {
    let message = "Failed to create note.";

    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}

export async function updateNote(noteId: string, title: string, content: string) {
  const response = await fetch(`${BASE_URL}/api/v1/notes/${noteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      content,
    }),
  });

  if (!response.ok) {
    let message = "Failed to update note.";

    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}

export async function deleteNote(noteId: string) {
  const response = await fetch(`${BASE_URL}/api/v1/notes/${noteId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Failed to delete note.";

    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}