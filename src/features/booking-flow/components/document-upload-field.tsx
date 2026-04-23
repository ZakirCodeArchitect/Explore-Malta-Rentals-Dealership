"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { uploadBookingDocument } from "@/features/booking-flow/lib/upload-booking-document";
import type { UploadCategory } from "@/lib/uploads/types";

type DocumentUploadFieldProps = {
  label: string;
  description?: string;
  category: UploadCategory;
  bookingSessionId: string;
  value: string;
  onPathChange: (relativePath: string) => void;
  disabled?: boolean;
  name: string;
  "data-field"?: string;
};

export function DocumentUploadField({
  label,
  description,
  category,
  bookingSessionId,
  value,
  onPathChange,
  disabled = false,
  name,
  "data-field": dataField,
}: DocumentUploadFieldProps) {
  const reactId = useId();
  const inputId = `${reactId}-file`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasPath = value.trim().length > 0;

  const resetLocalStatus = useCallback(() => {
    setPhase("idle");
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!value.trim()) {
      resetLocalStatus();
    }
  }, [value, resetLocalStatus]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file || disabled) {
        return;
      }

      setPhase("uploading");
      setErrorMessage(null);

      const result = await uploadBookingDocument(file, category, bookingSessionId);
      if (!result.ok) {
        setPhase("error");
        setErrorMessage(result.message);
        return;
      }

      onPathChange(result.relativePath);
      setPhase("success");
    },
    [bookingSessionId, category, disabled, onPathChange],
  );

  return (
    <div className="space-y-2" data-field={dataField}>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {description ? <p className="text-xs text-slate-600">{description}</p> : null}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        disabled={disabled || phase === "uploading"}
        className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        onChange={(event) => {
          const file = event.target.files?.[0];
          void handleFile(file);
          event.target.value = "";
        }}
      />

      {phase === "uploading" ? (
        <p className="text-xs font-medium text-[var(--brand-blue)]">Uploading…</p>
      ) : null}
      {phase === "success" || (phase === "idle" && hasPath) ? (
        <p className="text-xs font-medium text-emerald-700">Uploaded successfully</p>
      ) : null}
      {phase === "error" && errorMessage ? (
        <p className="text-xs font-medium text-red-600">Upload failed, please try again. {errorMessage}</p>
      ) : null}

      {hasPath ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="break-all">Stored: {value}</span>
          <button
            type="button"
            disabled={disabled || phase === "uploading"}
            onClick={() => {
              onPathChange("");
              resetLocalStatus();
            }}
            className="rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove
          </button>
          <button
            type="button"
            disabled={disabled || phase === "uploading"}
            onClick={() => {
              resetLocalStatus();
              inputRef.current?.click();
            }}
            className="rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Replace
          </button>
        </div>
      ) : null}
    </div>
  );
}
