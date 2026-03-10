"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Course {
  code: string;
  title: string;
  type: "Theory" | "Lab" | "Sessional";
}

// Placeholder data — will be replaced with actual OCR results from backend
const MOCK_COURSES: Course[] = [
  { code: "CSE 3200", title: "System Development Project", type: "Sessional" },
  { code: "CSE 3105", title: "Database Systems", type: "Theory" },
  { code: "CSE 3106", title: "Database Systems Lab", type: "Lab" },
  { code: "CSE 3101", title: "Computer Networks", type: "Theory" },
  { code: "HUM 4155", title: "Professional Ethics", type: "Theory" },
];

export default function ConfirmPage() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCourse = (index: number, field: keyof Course, value: string) => {
    setCourses((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      )
    );
  };

  const handleConfirm = async () => {
    if (courses.length === 0) return;
    setSaving(true);

    try {
      // TODO: POST /api/courses with confirmed course list
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <a href="/upload" className="text-sm text-zinc-500 hover:text-zinc-700 mb-2 inline-block">
            ← Back to Upload
          </a>
          <h1 className="text-3xl font-bold">Confirm Courses</h1>
          <p className="text-zinc-600 mt-2">
            Review the extracted courses. Edit or remove any incorrect entries before saving.
          </p>
        </div>

        {/* Course Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {courses.length} course{courses.length !== 1 ? "s" : ""} detected
          </p>
        </div>

        {/* Course List */}
        {courses.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">No courses remaining. Go back and re-upload.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, index) => (
              <div
                key={index}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                {editingIndex === index ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Code</label>
                        <input
                          type="text"
                          value={course.code}
                          onChange={(e) => updateCourse(index, "code", e.target.value)}
                          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Type</label>
                        <select
                          value={course.type}
                          onChange={(e) => updateCourse(index, "type", e.target.value)}
                          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                        >
                          <option value="Theory">Theory</option>
                          <option value="Lab">Lab</option>
                          <option value="Sessional">Sessional</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Title</label>
                      <input
                        type="text"
                        value={course.title}
                        onChange={(e) => updateCourse(index, "title", e.target.value)}
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="text-sm text-zinc-600 hover:text-zinc-900"
                    >
                      Done editing
                    </button>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">{course.code}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          course.type === "Theory"
                            ? "bg-blue-100 text-blue-700"
                            : course.type === "Lab"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                        }`}>
                          {course.type}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 mt-1">{course.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeCourse(index)}
                        className="rounded-md px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {courses.length > 0 && (
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex-1 rounded-md bg-zinc-900 px-6 py-3 text-white font-medium hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : `Confirm ${courses.length} Course${courses.length !== 1 ? "s" : ""}`}
            </button>
            <a
              href="/upload"
              className="rounded-md border border-zinc-300 px-6 py-3 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors text-center"
            >
              Re-upload
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
