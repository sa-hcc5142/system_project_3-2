import type { ParseResponse } from "./types";

const BASE_URL = "http://127.0.0.1:8000";

export async function parseRoutine(file: File): Promise<ParseResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/api/v1/routine/parse`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to process routine.";

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      // ignore json parse error
    }

    throw new Error(message);
  }

  return response.json();
}