"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminHotelPaymentListItem } from "@/lib/admin/hotel-payments/types";

type QuickStatusDialogTarget = {
  settlement: AdminHotelPaymentListItem;
  status: "PAID" | "DUE";
};

type AdminHotelPaymentStatusDialogProps = Readonly<{
  target: QuickStatusDialogTarget | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function AdminHotelPaymentStatusDialog({
  target,
  isSubmitting,
  onCancel,
  onConfirm,
}: AdminHotelPaymentStatusDialogProps) {
  const t = useTranslations("Admin.hotelPayments");

  if (!target) {
    return null;
  }

  const statusLabelKey = target.status === "PAID" ? "statusDialog.paidTitle" : "statusDialog.dueTitle";
  const descriptionKey = target.status === "PAID" ? "statusDialog.paidDescription" : "statusDialog.dueDescription";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-bold text-slate-950">{t(statusLabelKey)}</h3>
        <p className="mt-2 text-sm text-slate-600">
          {t(descriptionKey, {
            hotel: target.settlement.hotelName,
            period: t("periodLabel", { month: target.settlement.month, year: target.settlement.year }),
          })}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("statusDialog.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3a7ca5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f6688]"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t("statusDialog.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
