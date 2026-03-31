"use client";

import { saveConfirmedCourses } from "@/lib/api";
import type { CourseItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

const VALID_PREFIXES = [
  "CSE", "HUM", "EEE", "ECE", "ME", "CE", "BME", "BECM", "IEM",
  "MTE", "MSE", "LE", "TE", "ARCH", "URP", "CHE", "ESE", "MATH"
];

const COURSE_CODE_REGEX = new RegExp(
  `^(?:${VALID_PREFIXES.sort((a, b) => b.length - a.length).join("|")})\\s\\d{4}$`,
  "i"
);

function mapParsedCourseToUI(course: CourseItem): Course {
  return {
    code: course.course_code,
    title: course.course_name ?? "",
    type: (course.course_type as CourseType) || "Theory",
  };
}

function normalizeCourseCodeInput(value: string): string {
  let cleaned = value.toUpperCase().trim();
  cleaned = cleaned.replace(/-/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ");

  const compact = cleaned.replace(/\s+/g, "");
  const match = compact.match(/^([A-Z]{2,5})(\d{4})$/);

  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return cleaned;
}

function getCourseCodeError(code: string): string | null {
  const normalized = normalizeCourseCodeInput(code);

  if (!normalized) return "Course code is required.";
  if (!COURSE_CODE_REGEX.test(normalized)) {
    return "Use format like CSE 3211 or MATH 2109.";
  }

  return null;
}

export default function ConfirmPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [parseMessage, setParseMessage] = useState<string>("");
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [formError, setFormError] = useState<string>("");
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

  const duplicateCodes = useMemo(() => {
    const normalizedCodes = courses
      .map((course) => normalizeCourseCodeInput(course.code))
      .filter(Boolean);

    const counts = new Map<string, number>();
    normalizedCodes.forEach((code) => {
      counts.set(code, (counts.get(code) || 0) + 1);
    });

    return new Set(
      [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([code]) => code)
    );
  }, [courses]);

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
    setFormError("");
  };

  const updateCourse = (index: number, field: keyof Course, value: string) => {
    setCourses((prev) =>
      prev.map((course, i) => {
        if (i !== index) return course;

        if (field === "code") {
          return { ...course, code: normalizeCourseCodeInput(value) };
        }

        if (field === "type") {
          return { ...course, type: value as CourseType };
        }

        return { ...course, [field]: value } as Course;
      })
    );
    setFormError("");
  };

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      {
        code: "",
        title: "",
        type: "Theory",
      },
    ]);
    setEditingIndex(courses.length);
    setFormError("");
  };

  const validateCourses = (): boolean => {
    if (courses.length === 0) {
      setFormError("At least one course is required.");
      return false;
    }

    for (const course of courses) {
      const codeError = getCourseCodeError(course.code);
      if (codeError) {
        setFormError(`Invalid course code "${course.code || "(empty)"}": ${codeError}`);
        return false;
      }

      const normalizedCode = normalizeCourseCodeInput(course.code);
      if (duplicateCodes.has(normalizedCode)) {
        setFormError(`Duplicate course code found: ${normalizedCode}`);
        return false;
      }
    }

    setFormError("");
    return true;
  };

  const handleConfirm = async () => {
    if (!validateCourses()) return;

    setSaving(true);

    try {
      const cleanedCourses = courses.map((course) => ({
        code: normalizeCourseCodeInput(course.code),
        title: course.title.trim(),
        type: course.type,
      }));

      await saveConfirmedCourses(cleanedCourses);
      sessionStorage.setItem("confirmedCourses", JSON.stringify(cleanedCourses));
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save confirmed courses.";
      setFormError(message);
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
            Review the extracted courses. Edit, remove, or add any missing course before saving.
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

        {formError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {courses.length} course{courses.length !== 1 ? "s" : ""} detected
          </p>

          <button
            onClick={addCourse}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            + Add Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-zinc-300 p-12 text-center">
            <p className="text-zinc-500">No courses remaining. Go back and re-upload.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, index) => {
              const normalizedCode = normalizeCourseCodeInput(course.code);
              const codeError = getCourseCodeError(course.code);
              const isDuplicate = normalizedCode ? duplicateCodes.has(normalizedCode) : false;

              return (
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
                            placeholder="e.g. CSE 3211"
                            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                              codeError || isDuplicate
                                ? "border-red-300 focus:border-red-400"
                                : "border-zinc-300 focus:border-zinc-500"
                            }`}
                          />
                          {(codeError || isDuplicate) && (
                            <p className="mt-1 text-xs text-red-600">
                              {isDuplicate ? "Duplicate course code." : codeError}
                            </p>
                          )}
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
                          placeholder="Optional course title"
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
                          <span className="font-semibold text-zinc-900">
                            {course.code || "Untitled Course"}
                          </span>
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
                        <p className="mt-1 text-sm text-zinc-600">
                          {course.title || "No title added yet"}
                        </p>
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
              );
            })}
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