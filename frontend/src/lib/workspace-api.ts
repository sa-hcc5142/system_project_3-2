const BASE_URL = "http://127.0.0.1:8000";

export type WorkspaceOverview = {
  success: boolean;
  course_code: string;
  header_title: string;
  header_subtitle: string;
  notes_enabled: boolean;
  materials_enabled: boolean;
  chat_enabled: boolean;
};

export type NoteStub = {
  id: string;
  course_code: string;
  title: string;
  content: string;
  updated_at: string;
};

export type MaterialStub = {
  id: string;
  course_code: string;
  filename: string;
  file_type: string;
  status: string;
};

export type ChatMessageStub = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export async function fetchWorkspaceOverview(courseCode: string): Promise<WorkspaceOverview> {
  const response = await fetch(
    `${BASE_URL}/api/v1/workspace/${encodeURIComponent(courseCode)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load workspace overview.");
  }

  return response.json();
}

export async function fetchWorkspaceNotes(courseCode: string): Promise<NoteStub[]> {
  const response = await fetch(
    `${BASE_URL}/api/v1/workspace/${encodeURIComponent(courseCode)}/notes`
  );

  if (!response.ok) {
    throw new Error("Failed to load notes panel.");
  }

  const data = await response.json();
  return data.notes || [];
}

export async function fetchWorkspaceMaterials(courseCode: string): Promise<MaterialStub[]> {
  const response = await fetch(
    `${BASE_URL}/api/v1/workspace/${encodeURIComponent(courseCode)}/materials`
  );

  if (!response.ok) {
    throw new Error("Failed to load materials panel.");
  }

  const data = await response.json();
  return data.materials || [];
}

export async function fetchWorkspaceChat(courseCode: string): Promise<ChatMessageStub[]> {
  const response = await fetch(
    `${BASE_URL}/api/v1/workspace/${encodeURIComponent(courseCode)}/chat`
  );

  if (!response.ok) {
    throw new Error("Failed to load chat panel.");
  }

  const data = await response.json();
  return data.messages || [];
}