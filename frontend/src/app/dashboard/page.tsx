"use client";

import { fetchConfirmedCourses } from "@/lib/api";
import { useEffect, useState } from "react";

type Course = {
  code: string;
  title: string;
  type: string;
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const result = await fetchConfirmedCourses();
        setCourses(result.courses || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard courses.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Your confirmed course list is shown below.
          </p>
        </div>

        {loading && (
          <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            Loading dashboard courses...
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No confirmed courses found yet.
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <div
                key={`${course.code}-${index}`}
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">{course.code}</h2>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                    {course.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{course.title || "Untitled course"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}