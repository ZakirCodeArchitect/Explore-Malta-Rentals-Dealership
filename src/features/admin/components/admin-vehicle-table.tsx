"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminVehicleDeleteDialog } from "@/features/admin/components/admin-vehicle-delete-dialog";
import type { AdminVehicleListItem } from "@/lib/admin/vehicles/types";

type AdminVehicleTableProps = Readonly<{
  locale: string;
  vehicles: AdminVehicleListItem[];
}>;

type DialogMode = "deactivate" | "delete";

type DialogTarget = {
  vehicle: AdminVehicleListItem;
  mode: DialogMode;
};

function statusBadgeClass(status: string, isActive: boolean): string {
  if (!isActive || status === "INACTIVE") {
    return "bg-slate-100 text-slate-600";
  }
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-50 text-emerald-700";
    case "BOOKED":
      return "bg-blue-50 text-blue-700";
    case "UNDER_PROCESS":
      return "bg-amber-50 text-amber-700";
    case "SOLD":
      return "bg-violet-50 text-violet-700";
    case "MAINTENANCE":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function AdminVehicleTable({ locale, vehicles }: AdminVehicleTableProps) {
  const t = useTranslations("Admin.vehicles");
  const router = useRouter();
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null);
  const [actionVehicleId, setActionVehicleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleDialogConfirm() {
    if (!dialogTarget) {
      return;
    }

    const { vehicle, mode } = dialogTarget;
    setActionVehicleId(vehicle.id);
    setFeedback(null);

    try {
      const response =
        mode === "deactivate"
          ? await fetch(`/api/admin/vehicles/${vehicle.id}/deactivate`, {
              method: "POST",
              credentials: "same-origin",
            })
          : await fetch(`/api/admin/vehicles/${vehicle.id}`, {
              method: "DELETE",
              credentials: "same-origin",
            });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload.success) {
        setFeedback({
          type: "error",
          message:
            payload.message ??
            (mode === "deactivate" ? t("deactivateError") : t("deleteError")),
        });
        return;
      }

      setFeedback({
        type: "success",
        message:
          mode === "deactivate"
            ? t("deactivateSuccess", { name: vehicle.name })
            : t("deleteSuccess", { name: vehicle.name }),
      });
      setDialogTarget(null);
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: mode === "deactivate" ? t("deactivateError") : t("deleteError"),
      });
    } finally {
      setActionVehicleId(null);
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
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">{t("table.no")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.vehicle")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.licensePlate")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.type")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.visibility")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.order")}</th>
                <th className="px-4 py-3 font-semibold">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle, index) => (
                  <tr key={vehicle.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 text-slate-500">{String(index + 1).padStart(2, "0")}</td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[14rem] items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {vehicle.mainImageUrl ? (
                            <Image
                              src={vehicle.mainImageUrl}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[10px] font-semibold text-slate-400">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{vehicle.name}</p>
                          <p className="truncate text-xs text-slate-500">{vehicle.slug}</p>
                          {vehicle.bookingCount > 0 ? (
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {t("table.bookingCount", { count: vehicle.bookingCount })}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-800">{vehicle.licensePlate}</td>
                    <td className="px-4 py-3 text-slate-700">{t(`vehicleTypes.${vehicle.vehicleType}`)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          statusBadgeClass(vehicle.catalogStatus, vehicle.isActive),
                        ].join(" ")}
                      >
                        {t(`catalogStatus.${vehicle.catalogStatus}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          vehicle.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                        ].join(" ")}
                      >
                        {vehicle.isActive ? t("table.visible") : t("table.hidden")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{vehicle.displayOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[12rem] items-center gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`/${locale}/admin/vehicles/${vehicle.id}`}
                            className="inline-flex cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#3a7ca5]/30 hover:text-[#3a7ca5]"
                          >
                            {t("table.details")}
                          </a>
                          <button
                            type="button"
                            onClick={() => setDialogTarget({ vehicle, mode: "deactivate" })}
                            disabled={!vehicle.isActive || actionVehicleId === vehicle.id}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionVehicleId === vehicle.id && dialogTarget?.mode === "deactivate" ? (
                              <Loader2 className="size-3.5 animate-spin" aria-hidden />
                            ) : null}
                            {t("table.deactivate")}
                          </button>
                          <span title={!vehicle.canDelete ? t("table.deleteDisabledTooltip") : undefined}>
                            <button
                              type="button"
                              onClick={() => setDialogTarget({ vehicle, mode: "delete" })}
                              disabled={!vehicle.canDelete || actionVehicleId === vehicle.id}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionVehicleId === vehicle.id && dialogTarget?.mode === "delete" ? (
                                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                              ) : (
                                <Trash2 className="size-3.5" aria-hidden />
                              )}
                              {t("table.delete")}
                            </button>
                          </span>
                        </div>
                        <a
                          href={`/${locale}/admin/vehicles/${vehicle.id}/edit`}
                          aria-label={t("table.edit")}
                          title={t("table.edit")}
                          className="ml-auto inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-700 transition hover:border-[#3a7ca5]/30 hover:text-[#3a7ca5]"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminVehicleDeleteDialog
        open={dialogTarget !== null}
        mode={dialogTarget?.mode ?? "deactivate"}
        vehicleName={dialogTarget?.vehicle.name ?? ""}
        bookingCount={dialogTarget?.vehicle.bookingCount ?? 0}
        isSubmitting={actionVehicleId !== null}
        onCancel={() => setDialogTarget(null)}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
}
