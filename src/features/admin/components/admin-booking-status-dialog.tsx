"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { BookingStatus } from "@/generated/prisma/index";

type AdminBookingStatusDialogProps = Readonly<{
  bookingReference: string;
  currentStatus: BookingStatus;
  targetStatus: BookingStatus | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
}>;

const DESTRUCTIVE_STATUSES: BookingStatus[] = ["CANCELLED", "FAILED"];

export function AdminBookingStatusDialog({
  bookingReference,
  currentStatus,
  targetStatus,
  isSubmitting,
  onCancel,
  onConfirm,
}: AdminBookingStatusDialogProps) {
  const t = useTranslations("Admin.bookings.statusDialog");
  const [note, setNote] = useState("");

  if (!targetStatus) {
    return null;
  }

  const isDestructive = DESTRUCTIVE_STATUSES.includes(targetStatus);
  const titleKey = isDestructive ? "destructiveTitle" : "confirmTitle";
  const descriptionKey = isDestructive ? "destructiveDescription" : "confirmDescription";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h3 className="text-lg font-bold text-slate-950">{t(titleKey)}</h3>
        <p className="mt-2 text-sm text-slate-600">
          {t(descriptionKey, {
            reference: bookingReference,
            from: t(`statusLabel.${currentStatus}` as "statusLabel.CONFIRMED"),
            to: t(`statusLabel.${targetStatus}` as "statusLabel.CONFIRMED"),
          })}
        </p>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("noteLabel")}
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder={t("notePlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#3a7ca5]/40 focus:ring-2 focus:ring-[#3a7ca5]/15"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={isSubmitting}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white",
              isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-[#3a7ca5] hover:bg-[#2f6688]",
            ].join(" ")}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
