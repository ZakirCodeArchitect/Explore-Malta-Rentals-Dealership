"use client";

import { useEffect, useRef, useState } from "react";
import { Bike, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type NoVehicleModalProps = {
  show: boolean;
  onDismiss: () => void;
};

export function NoVehicleModal({ show, onDismiss }: NoVehicleModalProps) {
  const t = useTranslations("BookingSteps.selectVehicle");
  const tFlow = useTranslations("BookingFlow");
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // small delay so the CSS transition fires after mount
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const id = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(id);
    }
  }, [show]);

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onDismiss();
  }

  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onDismiss]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-[var(--dur-base)] ease-[var(--ease-standard)] sm:p-6 ${
        visible ? "bg-[var(--ink-950)]/55 backdrop-blur-md" : "bg-transparent backdrop-blur-none"
      }`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="no-vehicle-modal-title"
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-[var(--r-panel)] bg-[var(--surface-card)] shadow-[var(--elev-5)] ring-1 ring-[var(--line)] transition-all duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.97] opacity-0"
        }`}
      >
        {/* Decorative gradient header band */}
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,var(--orange-400),var(--orange-300),var(--orange-500))]" />

        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label={tFlow("noVehicleDismiss")}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pt-7 pb-7 text-center sm:px-8 sm:pb-8">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[var(--r-card)] bg-orange-50 ring-1 ring-orange-200/70">
            <Bike className="h-8 w-8 text-orange-600" strokeWidth={1.75} />
          </div>

          <h2 id="no-vehicle-modal-title" className="type-h3 text-[var(--text-primary)]">
            {t("noneSelectedTitle")}
          </h2>

          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
            {t("noneSelectedBodyLong")}
          </p>

          {/* CTA */}
          <Link
            href="/vehicles"
            className="mt-6 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-[var(--r-field)] bg-orange-400 px-6 text-sm font-semibold text-white shadow-[var(--elev-orange)] transition duration-[var(--dur-base)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-[var(--elev-orange-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            <Bike className="h-4 w-4" />
            {t("browseFleet")}
          </Link>

          {/* Dismiss link */}
          <button
            type="button"
            onClick={onDismiss}
            className="mt-2.5 w-full rounded-[var(--r-field)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {tFlow("noVehicleChooseLater")}
          </button>
        </div>
      </div>
    </div>
  );
}
