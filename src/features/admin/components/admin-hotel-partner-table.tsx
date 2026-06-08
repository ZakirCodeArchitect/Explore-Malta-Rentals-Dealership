"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminHotelPartnerDeleteDialog } from "@/features/admin/components/admin-hotel-partner-delete-dialog";
import type { AdminHotelPartnerListItem } from "@/lib/admin/hotel-partners/types";

type AdminHotelPartnerTableProps = Readonly<{
  locale: string;
  partners: AdminHotelPartnerListItem[];
}>;

type DialogTarget = {
  partner: AdminHotelPartnerListItem;
  mode: "deactivate" | "delete";
};

export function AdminHotelPartnerTable({ locale, partners }: AdminHotelPartnerTableProps) {
  const t = useTranslations("Admin.hotels");
  const router = useRouter();
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleDialogConfirm() {
    if (!dialogTarget) return;

    const { partner, mode } = dialogTarget;
    setActionId(partner.id);
    setFeedback(null);

    try {
      const response =
        mode === "deactivate"
          ? await fetch(`/api/admin/hotel-partners/${partner.id}/deactivate`, {
              method: "POST",
              credentials: "same-origin",
            })
          : await fetch(`/api/admin/hotel-partners/${partner.id}`, {
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
            ? t("deactivateSuccess", { name: partner.name })
            : t("deleteSuccess", { name: partner.name }),
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
                <th className="px-4 py-3 font-semibold">{t("table.name")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.contact")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.codes")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.bookings")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900">{partner.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{partner.contactPerson ?? "—"}</div>
                      <div className="text-xs">{partner.email ?? partner.phone ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{partner.hotelCodeCount}</td>
                    <td className="px-4 py-3 text-slate-700">{partner.bookingCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          partner.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600",
                        ].join(" ")}
                      >
                        {partner.isActive ? t("table.active") : t("table.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${locale}/admin/hotels/${partner.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          {t("table.edit")}
                        </a>
                        {partner.isActive ? (
                          <button
                            type="button"
                            onClick={() => setDialogTarget({ partner, mode: "deactivate" })}
                            disabled={actionId === partner.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60"
                          >
                            {actionId === partner.id ? (
                              <Loader2 className="size-3.5 animate-spin" aria-hidden />
                            ) : null}
                            {t("table.deactivate")}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setDialogTarget({ partner, mode: "delete" })}
                          disabled={!partner.canDelete || actionId === partner.id}
                          title={!partner.canDelete ? t("table.deleteDisabledTooltip") : undefined}
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

      <AdminHotelPartnerDeleteDialog
        target={dialogTarget}
        isSubmitting={Boolean(actionId)}
        onCancel={() => setDialogTarget(null)}
        onConfirm={() => void handleDialogConfirm()}
      />
    </>
  );
}
