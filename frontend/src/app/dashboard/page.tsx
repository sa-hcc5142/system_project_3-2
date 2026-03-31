"use client";

import { fetchConfirmedCourses } from "@/lib/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Course = {
  code: string;
  title: string;
  type: string;
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((course) => {
      return (
        course.code.toLowerCase().includes(q) ||
        course.title.toLowerCase().includes(q) ||
        course.type.toLowerCase().includes(q)
      );
    });
  }, [courses, query]);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Your confirmed course list is shown below.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course code, title, or type"
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm focus:border-zinc-500 focus:outline-none"
          />
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

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No matching courses found.
          </div>
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <Link
                key={`${course.code}-${index}`}
                href={`/course/${encodeURIComponent(course.code)}`}
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400 hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">{course.code}</h2>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                    {course.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{course.title || "Untitled course"}</p>
                <p className="mt-4 text-xs font-medium text-zinc-500">Open workspace →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}