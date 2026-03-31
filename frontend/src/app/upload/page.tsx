"use client";

import { parseRoutine } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadState = "idle" | "dragging" | "validating" | "ready" | "uploading" | "error";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return "Invalid file type. Please upload a PNG, JPG, WebP image or PDF.";
    }
    if (f.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 10MB.";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      setState("validating");
      setError(null);

      const validationError = validateFile(f);
      if (validationError) {
        setError(validationError);
        setState("error");
        setFile(null);
        setPreview(null);
        return;
      }

      if (preview) URL.revokeObjectURL(preview);

      setFile(f);

      if (f.type === "application/pdf") {
        setPreview(null);
      } else {
        const url = URL.createObjectURL(f);
        setPreview(url);
      }

      setState("ready");
    },
    [validateFile, preview]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const onDragLeave = useCallback(() => {
    setState((prev) => (prev === "dragging" ? "idle" : prev));
  }, []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setState("idle");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [preview]);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setState("uploading");
    setError(null);

    try {
      const result = await parseRoutine(file);

      sessionStorage.setItem("parsedCourses", JSON.stringify(result.detected_courses ?? []));
      sessionStorage.setItem("parseMessage", result.message ?? "");
      sessionStorage.setItem("uploadedFilename", result.filename ?? file.name);
      sessionStorage.setItem("rawText", result.raw_text ?? "");

      router.push("/confirm");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process routine. Please try again.";
      setError(message);
      setState("error");
    }
  }, [file, router]);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <a href="/" className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-700">
            ← Back to Home
          </a>
          <h1 className="text-3xl font-bold">Upload Routine</h1>
          <p className="mt-2 text-zinc-600">
            Upload your class routine image or PDF to automatically extract courses.
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            state === "dragging"
              ? "border-zinc-900 bg-zinc-100"
              : state === "error"
                ? "border-red-400 bg-red-50"
                : state === "ready" || state === "uploading"
                  ? "cursor-default border-green-400 bg-green-50"
                  : "border-zinc-300 bg-white hover:border-zinc-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf"
            onChange={onFileSelect}
            className="hidden"
          />

          {!file ? (
            <div>
              <div className="mx-auto mb-4 h-12 w-12 text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-zinc-700">
                {state === "dragging" ? "Drop your file here" : "Drag & drop your routine here"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">or click to browse</p>
              <p className="mt-3 text-xs text-zinc-400">
                Supports PNG, JPG, WebP, PDF — Max 10MB
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="h-8 w-8 text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-zinc-800">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {file.type.split("/")[1]?.toUpperCase() || "FILE"} ·{" "}
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {file && preview && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-zinc-700">Preview</h2>
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
              <img
                src={preview}
                alt="Routine preview"
                className="max-h-[500px] w-full object-contain"
              />
            </div>
          </div>
        )}

        {file && file.type === "application/pdf" && (
          <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-100 p-4">
            <p className="text-sm text-zinc-600">
              📄 PDF selected: <span className="font-medium">{file.name}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              PDF preview is not available. The file will be processed after upload.
            </p>
          </div>
        )}

        {file && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleProcess}
              disabled={state === "uploading"}
              className="flex-1 rounded-md bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {state === "uploading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Process Routine"
              )}
            </button>

            <button
              onClick={removeFile}
              disabled={state === "uploading"}
              className="rounded-md border border-zinc-300 px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}