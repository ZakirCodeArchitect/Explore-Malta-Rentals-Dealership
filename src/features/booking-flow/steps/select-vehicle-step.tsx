"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { formatVehicleTypeLabel } from "@/features/vehicles/data/vehicles";
import { useVehicles } from "@/features/vehicles/lib/use-vehicles";

export function SelectVehicleStep() {
  const t = useTranslations("BookingSteps.selectVehicle");
  const { state, reservationHold, updateSection, getFieldError } = useBookingFlow();
  const { vehicles, isLoading, error } = useVehicles();
  const vehicleError = getFieldError("rental.vehicleType");

  const selectedVehicle = useMemo(() => {
    if (!state.rental.vehicleId) {
      return null;
    }
    return vehicles.find((vehicle) => vehicle.id === state.rental.vehicleId) ?? null;
  }, [state.rental.vehicleId, vehicles]);

  const selectedVehicleImageSrc = selectedVehicle
    ? (selectedVehicle.mainImageUrl ?? selectedVehicle.images[0] ?? null)
    : null;
  const selectedVehicleBrandModel = selectedVehicle
    ? [selectedVehicle.brand, selectedVehicle.model].filter(Boolean).join(" ")
    : "";

  const holdIsOnSelectedVehicle =
    reservationHold.status === "ACTIVE" &&
    reservationHold.holdReference !== null &&
    reservationHold.vehicleId !== null &&
    reservationHold.vehicleId === state.rental.vehicleId;

  const incomingSlug = state.rental.vehicleSlug?.trim() ?? "";

  useEffect(() => {
    if (!state.rental.vehicleSlug || state.rental.vehicleId || vehicles.length === 0) {
      return;
    }
    const preselectedBySlug = vehicles.find((vehicle) => vehicle.slug === state.rental.vehicleSlug);
    if (!preselectedBySlug) {
      return;
    }
    updateSection("rental", {
      vehicleId: preselectedBySlug.id,
      vehicleSlug: preselectedBySlug.slug,
      vehicleName: preselectedBySlug.name,
      vehicleType: preselectedBySlug.apiVehicleType,
    });
  }, [state.rental.vehicleSlug, state.rental.vehicleId, updateSection, vehicles]);

  const slugNotFound =
    !isLoading &&
    !error &&
    vehicles.length > 0 &&
    Boolean(incomingSlug) &&
    !state.rental.vehicleId &&
    !vehicles.some((v) => v.slug === state.rental.vehicleSlug);

  const staleVehicleId =
    !isLoading &&
    !error &&
    vehicles.length > 0 &&
    Boolean(state.rental.vehicleId) &&
    !selectedVehicle;

  const needsVehicleFromFleet =
    !isLoading && !error && vehicles.length > 0 && !incomingSlug && !state.rental.vehicleId;

  return (
    <StepShell title={t("title")} description={t("description")}>
      {isLoading ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="h-48 animate-pulse bg-slate-200/70 sm:h-56" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200/60" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200/60" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm font-semibold text-rose-900">{t("loadErrorTitle")}</p>
          <p className="mt-1 text-sm text-rose-800">{error}</p>
          <Link
            href="/vehicles"
            className="mt-3 inline-flex rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
          >
            {t("browseFleet")}
          </Link>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-slate-700">{t("emptyBody")}</p>
        </div>
      ) : needsVehicleFromFleet ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">{t("noneSelectedTitle")}</p>
          <p className="mt-1 text-sm text-slate-700">{t("noneSelectedBodyLong")}</p>
          <Link
            href="/vehicles"
            className="mt-4 inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            {t("browseFleet")}
          </Link>
        </div>
      ) : slugNotFound || staleVehicleId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-semibold text-amber-900">
            {slugNotFound ? t("slugNotInList") : t("noLiveMatch")}
          </p>
          <p className="mt-1 text-sm text-amber-800">{t("pickAnother")}</p>
          <Link
            href="/vehicles"
            className="mt-4 inline-flex rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
          >
            {t("browseFleet")}
          </Link>
        </div>
      ) : selectedVehicle ? (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_32px_-16px_rgba(15,23,42,0.18)]">
          {/* ── vehicle image ─────────────────────────────────────── */}
          <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {selectedVehicleImageSrc ? (
              <>
                <Image
                  src={selectedVehicleImageSrc}
                  alt={selectedVehicle.name}
                  fill
                  className="object-contain p-6 drop-shadow-md transition-transform duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 42rem"
                  priority
                />
                {/* subtle radial glow under the vehicle */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-1/2 h-1/3 w-2/3 -translate-x-1/2 rounded-full bg-slate-200/60 blur-2xl"
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                {t("imageComingSoon")}
              </div>
            )}
          </div>

          {/* ── vehicle info ──────────────────────────────────────── */}
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--brand-orange)]">
              {t("yourSelection")}
            </p>
            <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-slate-950">
              {selectedVehicle.name}
            </h3>
            {selectedVehicleBrandModel ? (
              <p className="mt-0.5 text-sm font-medium text-slate-600">{selectedVehicleBrandModel}</p>
            ) : null}
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {selectedVehicle.shortDescription ?? t("noShortDescription")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatVehicleTypeLabel(selectedVehicle.apiVehicleType)}
              {" · "}
              {t("helmetsSummary", { count: selectedVehicle.helmetIncludedCount })}
              {" · "}
              {selectedVehicle.supportsStorageBox ? t("storageYes") : t("storageNo")}
            </p>
            {holdIsOnSelectedVehicle ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                {t("reservedTemp")}
              </p>
            ) : null}
          </div>
        </article>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="h-48 animate-pulse bg-slate-200/70 sm:h-56" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200/60" />
          </div>
        </div>
      )}

      {vehicleError ? <p className="mt-3 text-sm text-red-600">{vehicleError}</p> : null}
    </StepShell>
  );
}
