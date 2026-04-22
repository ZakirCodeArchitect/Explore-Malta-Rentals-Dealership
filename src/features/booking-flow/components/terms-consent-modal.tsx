"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TermsConsentModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onAgree: () => void;
};

export function TermsConsentModal({ isOpen, onCancel, onAgree }: TermsConsentModalProps) {
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/60 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
      >
        <header className="border-b border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Legal Consent</p>
          <h3 id="terms-modal-title" className="mt-1 text-lg font-bold text-slate-900">
            Terms & Conditions
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Please review the complete contract before confirming this booking.
          </p>
        </header>

        <div className="max-h-[65vh] overflow-hidden px-5 py-4 text-sm text-slate-700">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <iframe
              src="/terms"
              title="Full Terms and Conditions"
              className="h-[52vh] w-full bg-white"
            />
          </div>
          <p className="mt-3">
            <Link href="/terms" target="_blank" className="font-semibold text-[var(--brand-blue)] underline">
              Open full terms in a new tab
            </Link>
          </p>
        </div>

        <footer className="border-t border-slate-200 px-5 py-4">
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(event) => setConfirmChecked(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>I have read the full Terms & Conditions and agree to proceed.</span>
          </label>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmChecked(false);
                onCancel();
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmChecked(false);
                onAgree();
              }}
              disabled={!confirmChecked}
              className="rounded-full bg-[var(--brand-orange)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              I Agree
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
