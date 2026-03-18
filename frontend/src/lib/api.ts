import type { ParseResponse } from "./types";

const BASE_URL = "http://127.0.0.1:8000";

export type ConfirmedCoursePayload = {
  code: string;
  title: string;
  type: string;
};

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
      // ignore
    }

    throw new Error(message);
  }

  return response.json();
}

export async function saveConfirmedCourses(courses: ConfirmedCoursePayload[]) {
  const response = await fetch(`${BASE_URL}/api/v1/courses/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courses }),
  });

  if (!response.ok) {
    let message = "Failed to save confirmed courses.";

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchConfirmedCourses() {
  const response = await fetch(`${BASE_URL}/api/v1/courses`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch confirmed courses.");
  }

  return response.json();
}

export async function fetchCourseByCode(courseCode: string) {
  const encoded = encodeURIComponent(courseCode);

  const response = await fetch(`${BASE_URL}/api/v1/courses/${encoded}`, {
    method: "GET",
  });

  if (!response.ok) {
    let message = "Failed to fetch course.";

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return response.json();
}