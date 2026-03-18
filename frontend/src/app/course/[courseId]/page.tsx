"use client";

import { fetchCourseByCode } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Course = {
  code: string;
  title: string;
  type: string;
};

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const rawCourseId = params?.courseId;

        if (!rawCourseId) {
          setError("Course not found.");
          return;
        }

        const decodedCourseId = decodeURIComponent(rawCourseId);
        const result = await fetchCourseByCode(decodedCourseId);
        setCourse(result.course || null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load course.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [params]);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-700"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Course Workspace</h1>
          <p className="mt-2 text-zinc-600">
            This is the course workspace shell for the selected course.
          </p>
        </div>

        {loading && (
          <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Loading course...
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && course && (
          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-zinc-900">
                  {course.code}
                </h2>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                  {course.type}
                </span>
              </div>
              <p className="mt-3 text-zinc-600">{course.title}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <h3 className="text-lg font-semibold">Lecture Notes</h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Placeholder panel for lecture notes.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <h3 className="text-lg font-semibold">Slides & Documents</h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Placeholder panel for course materials.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <h3 className="text-lg font-semibold">AI Chatbot</h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Placeholder panel for course-specific AI chat.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}