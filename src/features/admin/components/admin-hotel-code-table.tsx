"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminHotelCodeDeleteDialog } from "@/features/admin/components/admin-hotel-code-delete-dialog";
import type { AdminHotelCodeListItem } from "@/lib/admin/hotel-codes/types";

type AdminHotelCodeTableProps = Readonly<{
  locale: string;
  codes: AdminHotelCodeListItem[];
}>;

type DialogTarget = {
  code: AdminHotelCodeListItem;
  mode: "deactivate" | "delete";
};

function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminHotelCodeTable({ locale, codes }: AdminHotelCodeTableProps) {
  const t = useTranslations("Admin.hotelCodes");
  const router = useRouter();
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleDialogConfirm() {
    if (!dialogTarget) return;

    const { code, mode } = dialogTarget;
    setActionId(code.id);
    setFeedback(null);

    try {
      const response =
        mode === "deactivate"
          ? await fetch(`/api/admin/hotel-codes/${code.id}/deactivate`, {
              method: "POST",
              credentials: "same-origin",
            })
          : await fetch(`/api/admin/hotel-codes/${code.id}`, {
              method: "DELETE",
              credentials: "same-origin",
            });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        setFeedback({
          type: "error",
          message: payload.message ?? (mode === "deactivate" ? t("deactivateError") : t("deleteError")),
        });
        return;
      }

      setFeedback({
        type: "success",
        message:
          mode === "deactivate"
            ? t("deactivateSuccess", { code: code.code })
            : t("deleteSuccess", { code: code.code }),
      });
      setDialogTarget(null);
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: mode === "deactivate" ? t("deactivateError") : t("deleteError"),
      });
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      {feedback ? (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm font-medium",
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
          role="status"
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("table.code")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.hotel")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.discount")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.bookings")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.totalValue")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                codes.map((code) => (
                  <tr key={code.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{code.code}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {code.hotelPartnerName}
                      {!code.hotelPartnerIsActive ? (
                        <span className="ml-1 text-xs text-amber-700">({t("table.hotelInactive")})</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{code.discountPercent}%</td>
                    <td className="px-4 py-3 text-slate-700">{code.bookingCount}</td>
                    <td className="px-4 py-3 text-slate-700">{formatEur(code.totalBookingValue)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          code.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
                        ].join(" ")}
                      >
                        {code.isActive ? t("table.active") : t("table.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${locale}/admin/hotel-codes/${code.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          {t("table.edit")}
                        </a>
                        {code.isActive ? (
                          <button
                            type="button"
                            onClick={() => setDialogTarget({ code, mode: "deactivate" })}
                            disabled={actionId === code.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60"
                          >
                            {t("table.deactivate")}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setDialogTarget({ code, mode: "delete" })}
                          disabled={!code.canDelete || actionId === code.id}
                          title={!code.canDelete ? t("table.deleteDisabledTooltip") : undefined}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          {t("table.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminHotelCodeDeleteDialog
        target={dialogTarget}
        isSubmitting={Boolean(actionId)}
        onCancel={() => setDialogTarget(null)}
        onConfirm={() => void handleDialogConfirm()}
      />
    </>
  );
}
