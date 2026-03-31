export type CourseItem = {
  course_code: string;
  course_name?: string | null;
  course_type?: "Theory" | "Lab" | "Sessional" | null;
  confidence: number;
};

export type ParseResponse = {
  success: boolean;
  message: string;
  filename: string;
  detected_courses: CourseItem[];
  raw_text?: string | null;
};