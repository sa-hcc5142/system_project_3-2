// frontend/src/lib/materials-api.ts

const BASE_URL = "http://127.0.0.1:8000";

export type MaterialItem = {
  id: string;
  filename: string;
  file_url: string;
  uploaded_at: string;
  extraction_status: string;
  extraction_error: string;
  extracted_at?: string | null;
  text_preview: string;
};

export type MaterialDetail = {
  id: string;
  filename: string;
  file_url: string;
  uploaded_at: string;
  extraction_status: string;
  extraction_error: string;
  extracted_at?: string | null;
  extracted_text: string;
};

function normalizeCourseCode(courseCode: string): string {
  return courseCode.replace(/\s+/g, "").toUpperCase();
}

function isAcceptedFile(file: File): boolean {
  const allowedExtensions = [".pdf", ".docx", ".pptx"];
  const lowerName = file.name.toLowerCase();
  return allowedExtensions.some((ext) => lowerName.endsWith(ext));
}

export function getMaterialPreviewUrl(materialId: string): string {
  return `${BASE_URL}/api/v1/materials/preview/${materialId}`;
}

export function getMaterialDownloadUrl(materialId: string): string {
  return `${BASE_URL}/api/v1/materials/download/${materialId}`;
}

export async function fetchMaterialsByCourse(courseCode: string): Promise<MaterialItem[]> {
  const normalizedCourseCode = normalizeCourseCode(courseCode);

  const response = await fetch(
    `${BASE_URL}/api/v1/materials/${encodeURIComponent(normalizedCourseCode)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load materials.");
  }

  const data = await response.json();
  return data.materials || [];
}

export async function fetchMaterialDetail(materialId: string): Promise<MaterialDetail> {
  const response = await fetch(`${BASE_URL}/api/v1/materials/detail/${materialId}`);

  if (!response.ok) {
    throw new Error("Failed to load material details.");
  }

  return response.json();
}

export async function uploadMaterial(courseCode: string, file: File) {
  if (!isAcceptedFile(file)) {
    throw new Error("Only PDF, DOCX, and PPTX files are allowed.");
  }

  const normalizedCourseCode = normalizeCourseCode(courseCode);
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}/api/v1/materials/upload?course_code=${encodeURIComponent(normalizedCourseCode)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    let message = "Failed to upload material.";

    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}

export async function deleteMaterial(materialId: string) {
  const response = await fetch(`${BASE_URL}/api/v1/materials/${materialId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Failed to delete material.";

    try {
      const data = await response.json();
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}