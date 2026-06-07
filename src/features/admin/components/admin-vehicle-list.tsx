import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { AdminDashboardVehicle } from "@/lib/admin/getAdminDashboardOverview";

type AdminVehicleListProps = Readonly<{
  vehicles: AdminDashboardVehicle[];
}>;

function vehicleTypeLabel(type: string): string {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export async function AdminVehicleList({ vehicles }: AdminVehicleListProps) {
  const t = await getTranslations("Admin");

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{t("vehicleListTitle")}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{t("vehicleListDescription")}</p>
        </div>
        <span className="rounded-full bg-[#3a7ca5]/10 px-3 py-1 text-xs font-semibold text-[#3a7ca5]">
          {t("vehicleCount", { count: vehicles.length })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-3 font-semibold">{t("vehicleTable.no")}</th>
              <th className="px-2 py-3 font-semibold">{t("vehicleTable.vehicle")}</th>
              <th className="px-2 py-3 font-semibold">{t("vehicleTable.type")}</th>
              <th className="px-2 py-3 font-semibold">{t("vehicleTable.status")}</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-2 py-8 text-center text-sm text-slate-500">
                  {t("vehicleTable.empty")}
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle, index) => (
                <tr key={vehicle.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-2 py-3 text-slate-500">{String(index + 1).padStart(2, "0")}</td>
                  <td className="px-2 py-3">
                    <div className="flex min-w-[12rem] items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {vehicle.mainImageUrl ? (
                          <Image
                            src={vehicle.mainImageUrl}
                            alt=""
                            fill
                            sizes="40px"
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
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-slate-700">{vehicleTypeLabel(vehicle.vehicleType)}</td>
                  <td className="px-2 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        vehicle.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700",
                      ].join(" ")}
                    >
                      {vehicle.isActive ? t("vehicleTable.active") : t("vehicleTable.inactive")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
