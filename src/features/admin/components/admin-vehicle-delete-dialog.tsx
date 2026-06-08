"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

type AdminVehicleDeleteDialogProps = Readonly<{
  open: boolean;
  mode: "deactivate" | "delete";
  vehicleName: string;
  bookingCount: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function AdminVehicleDeleteDialog({
  open,
  mode,
  vehicleName,
  bookingCount,
  isSubmitting,
  onCancel,
  onConfirm,
}: AdminVehicleDeleteDialogProps) {
  const t = useTranslations("Admin.vehicles");

  if (!open) {
    return null;
  }

  const isDeactivate = mode === "deactivate";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40"
        aria-label={t("deleteDialog.cancel")}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-vehicle-delete-title"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="size-5" aria-hidden />
        </div>
        <h2 id="admin-vehicle-delete-title" className="text-lg font-bold text-slate-950">
          {isDeactivate ? t("deleteDialog.title") : t("permanentDeleteDialog.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {isDeactivate
            ? t("deleteDialog.description", { name: vehicleName })
            : t("permanentDeleteDialog.description")}
        </p>
        {isDeactivate && bookingCount > 0 ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            {t("deleteDialog.bookingWarning", { count: bookingCount })}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {t("deleteDialog.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {isSubmitting
              ? isDeactivate
                ? t("deleteDialog.deactivating")
                : t("permanentDeleteDialog.deleting")
              : isDeactivate
                ? t("deleteDialog.confirm")
                : t("permanentDeleteDialog.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
