export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">CourseSync</h1>
        <p className="text-lg text-zinc-600 mb-8">
          Routine-Driven Course Workspace with AI-Assisted Learning
        </p>
        <a
          href="/upload"
          className="rounded-md bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
