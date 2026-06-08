"use client";

import { Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminHotelPaymentFormDialog } from "@/features/admin/components/admin-hotel-payment-form-dialog";
import { AdminHotelPaymentStatusDialog } from "@/features/admin/components/admin-hotel-payment-status-dialog";
import type { AdminHotelPaymentListItem, AdminHotelPaymentStatus } from "@/lib/admin/hotel-payments/types";
import type { AdminHotelPartnerOption } from "@/lib/admin/hotel-partners/types";

type AdminHotelPaymentTableProps = Readonly<{
  locale: string;
  settlements: AdminHotelPaymentListItem[];
  partners: AdminHotelPartnerOption[];
}>;

type QuickStatusDialogTarget = {
  settlement: AdminHotelPaymentListItem;
  status: "PAID" | "DUE";
};

function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPaidDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function statusBadgeClass(status: AdminHotelPaymentStatus): string {
  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "PARTIALLY_PAID") {
    return "bg-amber-50 text-amber-800";
  }
  return "bg-slate-100 text-slate-700";
}

export function AdminHotelPaymentTable({ locale, settlements, partners }: AdminHotelPaymentTableProps) {
  const t = useTranslations("Admin.hotelPayments");
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminHotelPaymentListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<QuickStatusDialogTarget | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(settlement: AdminHotelPaymentListItem) {
    setEditTarget(settlement);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditTarget(null);
  }

  function handleFormSaved() {
    setFeedback({
      type: "success",
      message: editTarget ? t("saveSuccess") : t("createSuccess"),
    });
    router.refresh();
  }

  async function handleStatusConfirm() {
    if (!statusTarget) return;

    const { settlement, status } = statusTarget;
    setActionId(settlement.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/hotel-payments/${settlement.id}/status`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        setFeedback({
          type: "error",
          message: payload.message ?? t("statusUpdateError"),
        });
        return;
      }

      setFeedback({ type: "success", message: t("statusUpdateSuccess") });
      setStatusTarget(null);
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: t("statusUpdateError") });
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex cursor-pointer items-center rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f6688]"
        >
          {t("createSettlement")}
        </button>
      </div>

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
                <th className="px-4 py-3 font-semibold">{t("table.hotel")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.period")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.bookings")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.totalAmount")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.totalDiscount")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.amountDue")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.amountPaid")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.paidDate")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => {
                  const isBusy = actionId === settlement.id;

                  return (
                    <tr key={settlement.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-slate-700">
                        {settlement.hotelName}
                        {!settlement.hotelIsActive ? (
                          <span className="ml-1 text-xs text-amber-700">({t("table.hotelInactive")})</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {t("periodLabel", { month: settlement.month, year: settlement.year })}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{settlement.bookingCountSnapshot}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatEur(settlement.totalBookingAmountSnapshot)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatEur(settlement.totalHotelDiscountSnapshot)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatEur(settlement.settlementAmountDue)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatEur(settlement.amountPaid)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            statusBadgeClass(settlement.status),
                          ].join(" ")}
                        >
                          {t(`status.${settlement.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatPaidDate(settlement.paidAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(settlement)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="size-3.5" aria-hidden />
                            {t("table.edit")}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || settlement.status === "PAID"}
                            onClick={() => setStatusTarget({ settlement, status: "PAID" })}
                            className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {isBusy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : t("table.markPaid")}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || settlement.status === "DUE"}
                            onClick={() => setStatusTarget({ settlement, status: "DUE" })}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {t("table.markDue")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminHotelPaymentFormDialog
        locale={locale}
        partners={partners}
        settlement={editTarget}
        open={formOpen}
        onClose={handleFormClose}
        onSaved={handleFormSaved}
      />

      <AdminHotelPaymentStatusDialog
        target={statusTarget}
        isSubmitting={Boolean(actionId)}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusConfirm}
      />
    </>
  );
}
