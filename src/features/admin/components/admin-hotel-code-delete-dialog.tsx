"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminHotelCodeListItem } from "@/lib/admin/hotel-codes/types";

type DialogTarget = {
  code: AdminHotelCodeListItem;
  mode: "deactivate" | "delete";
};

type AdminHotelCodeDeleteDialogProps = Readonly<{
  target: DialogTarget | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function AdminHotelCodeDeleteDialog({
  target,
  isSubmitting,
  onCancel,
  onConfirm,
}: AdminHotelCodeDeleteDialogProps) {
  const t = useTranslations("Admin.hotelCodes");

  if (!target) {
    return null;
  }

  const isDeactivate = target.mode === "deactivate";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-bold text-slate-950">
          {isDeactivate ? t("deleteDialog.title") : t("permanentDeleteDialog.title")}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {isDeactivate
            ? t("deleteDialog.description", { code: target.code.code })
            : t("permanentDeleteDialog.description", { code: target.code.code })}
        </p>
        {target.code.bookingCount > 0 ? (
          <p className="mt-2 text-sm font-medium text-amber-800">
            {t("deleteDialog.bookingWarning", { count: target.code.bookingCount })}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {t("deleteDialog.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white",
              isDeactivate ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700",
            ].join(" ")}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {isDeactivate ? t("deleteDialog.confirm") : t("permanentDeleteDialog.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
