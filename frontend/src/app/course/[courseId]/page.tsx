"use client";

import {
  createNote,
  deleteNote,
  fetchNotesByCourse,
  updateNote,
  type NoteItem,
} from "@/lib/notes-api";
import {
  fetchWorkspaceChat,
  fetchWorkspaceMaterials,
  fetchWorkspaceOverview,
  type ChatMessageStub,
  type MaterialStub,
  type WorkspaceOverview,
} from "@/lib/workspace-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseWorkspacePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ? decodeURIComponent(params.courseId) : "";

  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [materials, setMaterials] = useState<MaterialStub[]>([]);
  const [messages, setMessages] = useState<ChatMessageStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setLoading(true);
        setError("");

        const [overviewData, notesData, materialsData, chatData] = await Promise.all([
          fetchWorkspaceOverview(courseId),
          fetchNotesByCourse(courseId),
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

  async function reloadNotes() {
    const refreshed = await fetchNotesByCourse(courseId);
    setNotes(refreshed);
  }

  async function handleSaveNote() {
    if (!courseId) return;

    const trimmedTitle = noteTitle.trim();
    const trimmedContent = noteContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setNoteError("Title and content are required.");
      return;
    }

    try {
      setSavingNote(true);
      setNoteError("");

      if (editingNoteId) {
        await updateNote(editingNoteId, trimmedTitle, trimmedContent);
      } else {
        await createNote(courseId, trimmedTitle, trimmedContent);
      }

      setNoteTitle("");
      setNoteContent("");
      setEditingNoteId(null);

      await reloadNotes();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save note.";
      setNoteError(message);
    } finally {
      setSavingNote(false);
    }
  }

  function handleEditNote(note: NoteItem) {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteError("");
  }

  async function handleDeleteNote(noteId: string) {
    try {
      await deleteNote(noteId);

      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setNoteTitle("");
        setNoteContent("");
      }

      await reloadNotes();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete note.";
      setNoteError(message);
    }
  }

  function handleCancelEdit() {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteError("");
  }

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
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                Day 7 Active
              </span>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />

              <textarea
                placeholder="Write your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />

              {noteError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {noteError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-60"
                >
                  {savingNote
                    ? "Saving..."
                    : editingNoteId
                    ? "Update Note"
                    : "Create Note"}
                </button>

                {editingNoteId && (
                  <button
                    onClick={handleCancelEdit}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {notes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
                  No notes created for this course yet.
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-zinc-200 p-3">
                    <h3 className="font-medium text-zinc-900">{note.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
                      {note.content}
                    </p>
                    <p className="mt-2 text-xs text-zinc-400">
                      Updated: {note.updated_at}
                    </p>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
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
                  <p className="mt-1 text-sm text-zinc-600">Type: {item.file_type}</p>
                  <p className="mt-1 text-xs text-zinc-400">Status: {item.status}</p>
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