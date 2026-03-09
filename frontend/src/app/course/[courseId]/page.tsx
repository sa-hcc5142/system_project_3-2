export default function CourseWorkspacePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Course Workspace</h1>
      <p className="text-zinc-600">Notes, Materials, and Chat for this course.</p>
      {/* TODO: Three-panel layout — Notes | Materials | Chat */}
    </div>
  );
}
