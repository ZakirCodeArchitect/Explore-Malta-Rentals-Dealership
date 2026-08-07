"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DocumentUploadField } from "@/features/booking-flow/components/document-upload-field";

type AlreadyPaidProofModalProps = {
  isOpen: boolean;
  bookingSessionId: string;
  proofPath: string;
  onProofPathChange: (path: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AlreadyPaidProofModal({
  isOpen,
  bookingSessionId,
  proofPath,
  onProofPathChange,
  onCancel,
  onConfirm,
}: AlreadyPaidProofModalProps) {
  const t = useTranslations("BookingWizard.bookingSummary");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="already-paid-proof-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="border-b border-slate-200 px-5 py-4">
          <h3 id="already-paid-proof-title" className="text-lg font-bold text-slate-900">
            {t("alreadyPaidModalTitle")}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{t("alreadyPaidModalDescription")}</p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <DocumentUploadField
            label={t("alreadyPaidUploadLabel")}
            description={t("alreadyPaidUploadHint")}
            category="payment_proof"
            bookingSessionId={bookingSessionId}
            value={proofPath}
            onPathChange={(path) => {
              setLocalError(null);
              onProofPathChange(path);
            }}
            name="paymentProof"
            data-field="payment.proofPath"
          />
          {localError ? <p className="mt-2 text-xs font-medium text-red-600">{localError}</p> : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
          >
            {t("alreadyPaidModalCancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!proofPath.trim()) {
                setLocalError(t("alreadyPaidProofRequired"));
                return;
              }
              onConfirm();
            }}
            className="rounded-full bg-[var(--brand-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t("alreadyPaidModalConfirm")}
          </button>
        </footer>
      </div>
    </div>
  );
}
