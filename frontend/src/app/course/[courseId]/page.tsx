"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchWorkspaceChat,
  fetchWorkspaceMaterials,
  fetchWorkspaceNotes,
  fetchWorkspaceOverview,
  type ChatMessageStub,
  type MaterialStub,
  type NoteStub,
  type WorkspaceOverview,
} from "../../../lib/workspace-api";

export default function CourseWorkspacePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ? decodeURIComponent(params.courseId) : "";

  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [notes, setNotes] = useState<NoteStub[]>([]);
  const [materials, setMaterials] = useState<MaterialStub[]>([]);
  const [messages, setMessages] = useState<ChatMessageStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setLoading(true);
        setError("");

        const [overviewData, notesData, materialsData, chatData] = await Promise.all([
          fetchWorkspaceOverview(courseId),
          fetchWorkspaceNotes(courseId),
          fetchWorkspaceMaterials(courseId),
          fetchWorkspaceChat(courseId),
        ]);

        setOverview(overviewData);
        setNotes(notesData);
        setMaterials(materialsData);
        setMessages(chatData);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load workspace.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadWorkspace();
    }
  }, [courseId]);

  if (loading) {
    return <div className="p-6">Loading workspace...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-zinc-900">
            {overview?.header_title || `${courseId} Workspace`}
          </h1>
          <p className="mt-2 text-zinc-600">
            {overview?.header_subtitle || "Course workspace shell"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Lecture Notes</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                Day 6 Shell
              </span>
            </div>

            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-zinc-200 p-3">
                  <h3 className="font-medium text-zinc-900">{note.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{note.content}</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    Updated: {note.updated_at}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
              Note create/edit/save comes on Day 7.
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Slides & Documents</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                Placeholder
              </span>
            </div>

            <div className="space-y-3">
              {materials.map((item) => (
                <div key={item.id} className="rounded-lg border border-zinc-200 p-3">
                  <p className="font-medium text-zinc-900">{item.filename}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Type: {item.file_type}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Status: {item.status}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
              Material upload/list logic comes on Day 8.
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI Chatbot</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                Stub
              </span>
            </div>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-zinc-100 p-3">
                  <p className="text-sm font-medium text-zinc-700">{msg.role}</p>
                  <p className="mt-1 text-sm text-zinc-900">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
              Real chat starts on Day 10.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}