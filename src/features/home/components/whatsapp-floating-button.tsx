"use client";

import { useEffect, useId, useRef, useState } from "react";
import { WhatsAppIcon } from "@/features/home/components/whatsapp-action-link";
import { getWhatsAppChatUrl, toWhatsAppDigits } from "@/lib/whatsapp-number";

const DEFAULT_MESSAGE =
  "Hi! I'd like to book a ride / ask about availability in Malta.";

export function WhatsAppFloatingButton() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const digits = toWhatsAppDigits(raw);
  const displayNumber = raw.trim() || (digits ? `+${digits}` : "");
  const chatUrl = digits
    ? getWhatsAppChatUrl(digits, DEFAULT_MESSAGE)
    : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8"
    >
      <div className="pointer-events-auto relative flex flex-col items-end gap-2">
        {open ? (
          <div
            id={panelId}
            role="dialog"
            aria-label="WhatsApp number"
            className="w-[min(calc(100vw-2rem),18rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]"
          >
            {digits ? (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  WhatsApp number
                </p>
                <p className="mt-1 break-all text-lg font-semibold tabular-nums text-slate-950">
                  {displayNumber}
                </p>
                <a
                  href={chatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex min-h-10 w-full items-center justify-center rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                >
                  Open WhatsApp
                </a>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Set{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  whatsapp_number
                </code>{" "}
                in your <code className="text-xs">.env</code> file and restart
                the dev server.
              </p>
            )}
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_-20px_rgba(37,211,102,0.65)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <WhatsAppIcon className="h-5 w-5 shrink-0" />
          <span className="hidden sm:ml-2 sm:inline">WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
