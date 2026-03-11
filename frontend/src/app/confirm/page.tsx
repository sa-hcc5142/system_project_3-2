"use client";

import type { CourseItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CourseType = "Theory" | "Lab" | "Sessional";

interface Course {
  code: string;
  title: string;
  type: CourseType;
}

const MOCK_COURSES: Course[] = [
  { code: "CSE 3200", title: "System Development Project", type: "Sessional" },
  { code: "CSE 3105", title: "Database Systems", type: "Theory" },
  { code: "CSE 3106", title: "Database Systems Lab", type: "Lab" },
  { code: "CSE 3101", title: "Computer Networks", type: "Theory" },
  { code: "HUM 4155", title: "Professional Ethics", type: "Theory" },
];

function mapParsedCourseToUI(course: CourseItem): Course {
  return {
    code: course.course_code,
    title: course.course_name ?? "",
    type: (course.course_type as CourseType) || "Theory",
  };
}

export default function ConfirmPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [parseMessage, setParseMessage] = useState<string>("");
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedCourses = sessionStorage.getItem("parsedCourses");
    const storedMessage = sessionStorage.getItem("parseMessage");
    const storedFilename = sessionStorage.getItem("uploadedFilename");

    if (storedMessage) setParseMessage(storedMessage);
    if (storedFilename) setUploadedFilename(storedFilename);

    if (storedCourses) {
      try {
        const parsed = JSON.parse(storedCourses) as CourseItem[];

        if (Array.isArray(parsed) && parsed.length > 0) {
          setCourses(parsed.map(mapParsedCourseToUI));
        } else {
          setCourses(MOCK_COURSES);
        }
      } catch {
        setCourses(MOCK_COURSES);
      }
    } else {
      setCourses(MOCK_COURSES);
    }

    setLoaded(true);
  }, []);

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };
const updateCourse = (
  index: number,
  field: keyof Course,
  value: string
) => {
  setCourses((prev) =>
    prev.map((c, i) => {
      if (i !== index) return c;

      if (field === "type") {
        return { ...c, type: value as CourseType };
      }

      return { ...c, [field]: value } as Course;
    })
  );
};

  const handleConfirm = async () => {
    if (courses.length === 0) return;
    setSaving(true);

    try {
      sessionStorage.setItem("confirmedCourses", JSON.stringify(courses));
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-zinc-500">Loading detected courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <a href="/upload" className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-700">
            ← Back to Upload
          </a>
          <h1 className="text-3xl font-bold">Confirm Courses</h1>
          <p className="mt-2 text-zinc-600">
            Review the extracted courses. Edit or remove any incorrect entries before saving.
          </p>
        </div>

        {uploadedFilename && (
          <div className="mb-4 rounded-md border border-zinc-200 bg-white p-3">
            <p className="text-sm text-zinc-700">
              <span className="font-medium">Uploaded file:</span> {uploadedFilename}
            </p>
          </div>
        )}

        {parseMessage && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-700">{parseMessage}</p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {courses.length} course{courses.length !== 1 ? "s" : ""} detected
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">No courses remaining. Go back and re-upload.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, index) => (
              <div key={index} className="rounded-lg border border-zinc-200 bg-white p-4">
                {editingIndex === index ? (
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
                          onChange={(e) =>
                            updateCourse(index, "type", e.target.value as CourseType)
                          }
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
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">{course.code}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            course.type === "Theory"
                              ? "bg-blue-100 text-blue-700"
                              : course.type === "Lab"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {course.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">{course.title}</p>
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

        {courses.length > 0 && (
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex-1 rounded-md bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {saving ? "Saving..." : `Confirm ${courses.length} Course${courses.length !== 1 ? "s" : ""}`}
            </button>
            <a
              href="/upload"
              className="rounded-md border border-zinc-300 px-6 py-3 text-center font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Re-upload
            </a>
          </div>
        )}
      </div>
    </div>
  );
}