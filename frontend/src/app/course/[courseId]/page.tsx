"use client";

import {
  deleteMaterial,
  fetchMaterialDetail,
  fetchMaterialsByCourse,
  getMaterialDownloadUrl,
  getMaterialPreviewUrl,
  uploadMaterial,
  type MaterialDetail,
  type MaterialItem,
} from "@/lib/materials-api";
import {
  createNote,
  deleteNote,
  fetchNotesByCourse,
  updateNote,
  type NoteItem,
} from "@/lib/notes-api";
import {
  fetchWorkspaceChat,
  fetchWorkspaceOverview,
  type ChatMessageStub,
  type WorkspaceOverview,
} from "@/lib/workspace-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CourseWorkspacePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ? decodeURIComponent(params.courseId) : "";

  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [messages, setMessages] = useState<ChatMessageStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [materialError, setMaterialError] = useState("");
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDetail | null>(null);
  const [loadingMaterialDetail, setLoadingMaterialDetail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setLoading(true);
        setError("");

        const [overviewData, notesData, materialsData, chatData] = await Promise.all([
          fetchWorkspaceOverview(courseId),
          fetchNotesByCourse(courseId),
          fetchMaterialsByCourse(courseId),
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
    setNotes(await fetchNotesByCourse(courseId));
  }

  async function reloadMaterials() {
    setMaterials(await fetchMaterialsByCourse(courseId));
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
      setNoteError(err instanceof Error ? err.message : "Failed to save note.");
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
      setNoteError(err instanceof Error ? err.message : "Failed to delete note.");
    }
  }

  function handleCancelEdit() {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteError("");
  }

  function handleOpenUploadPicker() {
    fileInputRef.current?.click();
  }

  async function handleMaterialUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !courseId) return;

    try {
      setUploadingMaterial(true);
      setMaterialError("");

      await uploadMaterial(courseId, file);
      await reloadMaterials();
    } catch (err) {
      setMaterialError(err instanceof Error ? err.message : "Failed to upload material.");
    } finally {
      setUploadingMaterial(false);
      event.target.value = "";
    }
  }

  function toggleMaterialActions(materialId: string) {
    setActiveMaterialId((prev) => (prev === materialId ? null : materialId));
  }

  function handlePreview(materialId: string) {
    window.open(getMaterialPreviewUrl(materialId), "_blank", "noopener,noreferrer");
    setActiveMaterialId(null);
  }

  function handleDownload(materialId: string, filename: string) {
    const link = document.createElement("a");
    link.href = getMaterialDownloadUrl(materialId);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveMaterialId(null);
  }

  async function handleDeleteMaterial(materialId: string) {
    try {
      setMaterialError("");
      await deleteMaterial(materialId);
      await reloadMaterials();

      if (selectedMaterial?.id === materialId) {
        setSelectedMaterial(null);
      }

      setActiveMaterialId(null);
    } catch (err) {
      setMaterialError(err instanceof Error ? err.message : "Failed to delete material.");
    }
  }

  async function handleOpenMaterialDetail(materialId: string) {
    try {
      setLoadingMaterialDetail(true);
      setMaterialError("");
      const detail = await fetchMaterialDetail(materialId);
      setSelectedMaterial(detail);
    } catch (err) {
      setMaterialError(err instanceof Error ? err.message : "Failed to load material details.");
    } finally {
      setLoadingMaterialDetail(false);
      setActiveMaterialId(null);
    }
  }

  function renderStatusBadge(status: string) {
    if (status === "completed") {
      return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Extracted</span>;
    }
    if (status === "failed") {
      return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">Failed</span>;
    }
    return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">Processing</span>;
  }

  if (loading) return <div className="p-6">Loading workspace...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900">
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
          {/* Notes */}
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
                  {savingNote ? "Saving..." : editingNoteId ? "Update Note" : "Create Note"}
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
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{note.content}</p>
                    <p className="mt-2 text-xs text-zinc-400">Updated: {note.updated_at}</p>

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

          {/* Materials */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Slides & Documents</h2>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700">
                Day 9 Active
              </span>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleOpenUploadPicker}
                disabled={uploadingMaterial}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lg text-white hover:bg-zinc-700 disabled:opacity-60"
                title="Upload material"
              >
                +
              </button>

              <div className="text-sm text-zinc-600">
                Click + to upload PDF, DOCX, or PPTX materials.
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.pptx"
                className="hidden"
                onChange={handleMaterialUpload}
                disabled={uploadingMaterial}
              />
            </div>

            {uploadingMaterial && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                Uploading and extracting text...
              </div>
            )}

            {materialError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {materialError}
              </div>
            )}

            <div className="space-y-3">
              {materials.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
                  No materials uploaded for this course yet.
                </div>
              ) : (
                materials.map((item) => (
                  <div key={item.id} className="rounded-lg border border-zinc-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-900">{item.filename}</p>
                        <div className="mt-1">{renderStatusBadge(item.extraction_status)}</div>
                        <p className="mt-1 text-xs text-zinc-500">Uploaded: {item.uploaded_at}</p>

                        {item.extraction_status === "completed" && item.text_preview && (
                          <p className="mt-2 text-xs text-zinc-600 whitespace-pre-wrap">
                            {item.text_preview}
                          </p>
                        )}

                        {item.extraction_status === "failed" && item.extraction_error && (
                          <p className="mt-2 text-xs text-red-600">
                            Error: {item.extraction_error}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => toggleMaterialActions(item.id)}
                          className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
                        >
                          Open
                        </button>

                        {activeMaterialId === item.id && (
                          <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-zinc-200 bg-white shadow-lg">
                            <button
                              onClick={() => handleOpenMaterialDetail(item.id)}
                              className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handlePreview(item.id)}
                              className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleDownload(item.id, item.filename)}
                              className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(item.id)}
                              className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
              PDF and DOCX are prioritized for reliable extraction. PPTX is best-effort.
            </div>
          </section>

          {/* Detail View */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Material Detail</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                Extraction View
              </span>
            </div>

            {loadingMaterialDetail ? (
              <div className="text-sm text-zinc-600">Loading material detail...</div>
            ) : !selectedMaterial ? (
              <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
                Select “View Details” on a material to inspect extracted text and processing result.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-zinc-900">{selectedMaterial.filename}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Uploaded: {selectedMaterial.uploaded_at}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Extracted at: {selectedMaterial.extracted_at || "Not available"}
                  </p>
                </div>

                <div>{renderStatusBadge(selectedMaterial.extraction_status)}</div>

                {selectedMaterial.extraction_error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {selectedMaterial.extraction_error}
                  </div>
                )}

                <div className="max-h-[420px] overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 whitespace-pre-wrap">
                  {selectedMaterial.extracted_text || "No extracted text available."}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}