"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { formatVehicleTypeLabel } from "@/features/vehicles/data/vehicles";
import { useVehicle, useVehicles } from "@/features/vehicles/lib/use-vehicles";

export function SelectVehicleStep() {
  const t = useTranslations("BookingSteps.selectVehicle");
  const { state, reservationHold, updateSection, getFieldError, getBookingValues } = useBookingFlow();
  const incomingSlug = state.rental.vehicleSlug?.trim() ?? "";

  const rentalWindow = useMemo(() => {
    const { pickupDate, pickupTime, returnDate, returnTime } = state.rental;
    if (!pickupDate.trim() || !pickupTime.trim() || !returnDate.trim() || !returnTime.trim()) {
      return null;
    }
    return {
      pickupDate: pickupDate.trim(),
      pickupTime: pickupTime.trim(),
      returnDate: returnDate.trim(),
      returnTime: returnTime.trim(),
      sessionKey: reservationHold.sessionKey?.trim() || undefined,
    };
  }, [
    reservationHold.sessionKey,
    state.rental.pickupDate,
    state.rental.pickupTime,
    state.rental.returnDate,
    state.rental.returnTime,
  ]);

  const { vehicles, isLoading, error } = useVehicles({ rentalWindow });
  const {
    vehicle: slugVehicle,
    isLoading: slugVehicleLoading,
    error: slugVehicleError,
  } = useVehicle(incomingSlug);
  const vehicleError = getFieldError("rental.vehicleType");

  const selectedVehicle = useMemo(() => {
    if (!state.rental.vehicleId) {
      return null;
    }
    return vehicles.find((vehicle) => vehicle.id === state.rental.vehicleId) ?? null;
  }, [state.rental.vehicleId, vehicles]);

  const displayVehicle = selectedVehicle ?? slugVehicle;

  const selectedVehicleImageSrc = displayVehicle
    ? (displayVehicle.mainImageUrl ?? displayVehicle.images[0] ?? null)
    : null;
  const selectedVehicleBrandModel = displayVehicle
    ? [displayVehicle.brand, displayVehicle.model].filter(Boolean).join(" ")
    : "";

  const holdIsOnSelectedVehicle =
    reservationHold.status === "ACTIVE" &&
    reservationHold.holdReference !== null &&
    reservationHold.vehicleId !== null &&
    (reservationHold.vehicleId === state.rental.vehicleId ||
      reservationHold.vehicleId === displayVehicle?.id);

  useEffect(() => {
    if (vehicles.length === 0) {
      return;
    }

    const slug = state.rental.vehicleSlug?.trim();
    const rentalId = state.rental.vehicleId;
    const holdId = reservationHold.vehicleId;

    const bySlug = slug ? vehicles.find((vehicle) => vehicle.slug === slug) : undefined;
    const byRentalId = rentalId ? vehicles.find((vehicle) => vehicle.id === rentalId) : undefined;
    const byHoldId = holdId ? vehicles.find((vehicle) => vehicle.id === holdId) : undefined;
    const resolved = bySlug ?? byRentalId ?? byHoldId;

    if (!resolved) {
      return;
    }

    if (
      rentalId !== resolved.id ||
      slug !== resolved.slug ||
      state.rental.vehicleName !== resolved.name ||
      state.rental.vehicleType !== resolved.apiVehicleType
    ) {
      updateSection("rental", {
        vehicleId: resolved.id,
        vehicleSlug: resolved.slug,
        vehicleName: resolved.name,
        vehicleLicensePlate: "",
        vehicleType: resolved.apiVehicleType,
        selectedColor: null,
      });
      if (!resolved.supportsStorageBox && getBookingValues().addons.storageBox) {
        updateSection("addons", { storageBox: false });
      }
    }
  }, [
    getBookingValues,
    reservationHold.vehicleId,
    state.rental.vehicleId,
    state.rental.vehicleName,
    state.rental.vehicleSlug,
    state.rental.vehicleType,
    updateSection,
    vehicles,
  ]);

  useEffect(() => {
    if (!slugVehicle) {
      return;
    }

    const rentalId = state.rental.vehicleId;
    const slug = state.rental.vehicleSlug?.trim();
    if (
      rentalId === slugVehicle.id &&
      slug === slugVehicle.slug &&
      state.rental.vehicleName === slugVehicle.name &&
      state.rental.vehicleType === slugVehicle.apiVehicleType
    ) {
      return;
    }

    updateSection("rental", {
      vehicleId: slugVehicle.id,
      vehicleSlug: slugVehicle.slug,
      vehicleName: slugVehicle.name,
      vehicleLicensePlate: "",
      vehicleType: slugVehicle.apiVehicleType,
      selectedColor: null,
    });
    if (!slugVehicle.supportsStorageBox && getBookingValues().addons.storageBox) {
      updateSection("addons", { storageBox: false });
    }
  }, [
    getBookingValues,
    slugVehicle,
    state.rental.vehicleId,
    state.rental.vehicleName,
    state.rental.vehicleSlug,
    state.rental.vehicleType,
    updateSection,
  ]);

  const slugNotFound =
    !isLoading &&
    !slugVehicleLoading &&
    !error &&
    !slugVehicleError &&
    vehicles.length > 0 &&
    Boolean(incomingSlug) &&
    !state.rental.vehicleId &&
    !displayVehicle &&
    !vehicles.some((v) => v.slug === state.rental.vehicleSlug);

  const staleVehicleId =
    !isLoading &&
    !slugVehicleLoading &&
    !error &&
    !slugVehicleError &&
    vehicles.length > 0 &&
    Boolean(state.rental.vehicleId) &&
    !displayVehicle &&
    !(reservationHold.status === "ACTIVE" && reservationHold.vehicleId);

  const needsVehicleFromFleet =
    !isLoading &&
    !slugVehicleLoading &&
    !error &&
    vehicles.length > 0 &&
    !incomingSlug &&
    !state.rental.vehicleId &&
    !displayVehicle;

  return (
    <StepShell title={t("title")} description={t("description")}>
      {isLoading || slugVehicleLoading ? (
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
      ) : displayVehicle ? (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_32px_-16px_rgba(15,23,42,0.18)]">
          {/* ── vehicle image ─────────────────────────────────────── */}
          <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {selectedVehicleImageSrc ? (
              <>
                <Image
                  src={selectedVehicleImageSrc}
                  alt={displayVehicle.name}
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
              {displayVehicle.name}
            </h3>
            {selectedVehicleBrandModel ? (
              <p className="mt-0.5 text-sm font-medium text-slate-600">{selectedVehicleBrandModel}</p>
            ) : null}
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {displayVehicle.shortDescription ?? t("noShortDescription")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatVehicleTypeLabel(displayVehicle.apiVehicleType)}
              {" · "}
              {t("helmetsSummary", { count: displayVehicle.helmetIncludedCount })}
              {" · "}
              {displayVehicle.supportsStorageBox ? t("storageYes") : t("storageNo")}
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
