"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

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

      setFile(f);

      // Generate preview
      if (f.type === "application/pdf") {
        setPreview(null); // PDF preview handled separately
      } else {
        const url = URL.createObjectURL(f);
        setPreview(url);
      }

      setState("ready");
    },
    [validateFile]
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
      // TODO: Replace with actual API call to backend
      // POST /api/routine/upload with FormData
      const formData = new FormData();
      formData.append("file", file);

      // Simulating API call for now — will connect to backend later
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success, navigate to confirmation page
      router.push("/confirm");
    } catch {
      setError("Failed to process routine. Please try again.");
      setState("error");
    }
  }, [file, router]);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-700 mb-2 inline-block">
            ← Back to Home
          </a>
          <h1 className="text-3xl font-bold">Upload Routine</h1>
          <p className="text-zinc-600 mt-2">
            Upload your class routine image or PDF to automatically extract courses.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
            state === "dragging"
              ? "border-zinc-900 bg-zinc-100"
              : state === "error"
                ? "border-red-400 bg-red-50"
                : state === "ready" || state === "uploading"
                  ? "border-green-400 bg-green-50 cursor-default"
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-lg font-medium text-zinc-700">
                {state === "dragging" ? "Drop your file here" : "Drag & drop your routine here"}
              </p>
              <p className="text-sm text-zinc-500 mt-1">or click to browse</p>
              <p className="text-xs text-zinc-400 mt-3">
                Supports PNG, JPG, WebP, PDF — Max 10MB
              </p>
            </div>
          ) : (
            <div>
              {/* File Info */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-8 w-8 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-zinc-800">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {file.type.split("/")[1].toUpperCase()} · {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Image Preview */}
        {file && preview && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-zinc-700 mb-2">Preview</h2>
            <div className="rounded-lg border border-zinc-200 overflow-hidden bg-white">
              <img
                src={preview}
                alt="Routine preview"
                className="w-full max-h-[500px] object-contain"
              />
            </div>
          </div>
        )}

        {/* PDF Notice */}
        {file && file.type === "application/pdf" && (
          <div className="mt-6 rounded-md bg-zinc-100 border border-zinc-200 p-4">
            <p className="text-sm text-zinc-600">
              📄 PDF selected: <span className="font-medium">{file.name}</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              PDF preview is not available. The file will be processed after upload.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {file && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleProcess}
              disabled={state === "uploading"}
              className="flex-1 rounded-md bg-zinc-900 px-6 py-3 text-white font-medium hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
            >
              {state === "uploading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
              className="rounded-md border border-zinc-300 px-6 py-3 text-zinc-700 font-medium hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
