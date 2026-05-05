"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DocumentUploadField } from "@/features/booking-flow/components/document-upload-field";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { vehicleTypeNeedsHelmetFlow } from "@/features/booking-flow/lib/helmet-rental";
import {
  getAllowedLicenseCategories,
  getLicenseCategoryHint,
  type LicenseCategory,
} from "@/features/booking-flow/lib/license-categories";

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20";

export function AddonsStep() {
  const t = useTranslations("BookingWizard.addons");
  const tCust = useTranslations("BookingWizard.customer");
  const tSteps = useTranslations("BookingSteps.addons");
  const helmetSizeOptions = useMemo(
    () =>
      [
        { value: "", label: t("selectSize") },
        { value: "S", label: "S" },
        { value: "M", label: "M" },
        { value: "L", label: "L" },
      ] as const,
    [t],
  );
  const licenseCategoryOptions = useMemo(
    () =>
      [
        { value: "", label: t("selectCategory") },
        { value: "B", label: "B" },
        { value: "AM", label: "AM" },
        { value: "A", label: "A" },
        { value: "A1", label: "A1" },
        { value: "A2", label: "A2" },
      ] as const,
    [t],
  );
  const allCdwOptions = useMemo(
    () =>
      [
        { value: "none", label: t("cdwNone") },
        { value: "scooter_50", label: t("cdw50") },
        { value: "scooter_125", label: t("cdw125") },
        { value: "scooter_full", label: t("cdwFull") },
        { value: "atv_full", label: t("cdwAtv") },
      ] as const,
    [t],
  );

  const { state, updateSection, getFieldError, isFieldInvalid, bookingSessionId } = useBookingFlow();
  const [cdwMenuOpen, setCdwMenuOpen] = useState(false);
  const [licenseMenuOpen, setLicenseMenuOpen] = useState(false);
  const [helmetSize1MenuOpen, setHelmetSize1MenuOpen] = useState(false);
  const [helmetSize2MenuOpen, setHelmetSize2MenuOpen] = useState(false);
  const helmetEnabled = state.addons.helmet;
  const supportsHelmet = vehicleTypeNeedsHelmetFlow(state.rental.vehicleType);

  const allowedCdwValues = useMemo((): ReadonlyArray<string> => {
    const vt = (state.rental.vehicleType ?? "").toLowerCase();
    if (vt === "scooter") return ["none", "scooter_50", "scooter_full"];
    if (vt === "motorcycle") return ["none", "scooter_125", "scooter_full"];
    if (vt === "atv") return ["none", "atv_full"];
    if (vt === "bicycle") return ["none"];
    return ["none", "scooter_50", "scooter_125", "scooter_full", "atv_full"];
  }, [state.rental.vehicleType]);

  const cdwOptions = useMemo(
    () => allCdwOptions.filter((o) => allowedCdwValues.includes(o.value)),
    [allCdwOptions, allowedCdwValues],
  );

  const selectedCdwOption =
    cdwOptions.find((option) => option.value === state.addons.cdwPlan) ??
    cdwOptions[0];
  const selectedLicenseCategoryOption =
    licenseCategoryOptions.find(
      (option) => option.value === state.additionalDriver.licenseCategory,
    ) ?? licenseCategoryOptions[0];
  const allowedLicenseOptions = getAllowedLicenseCategories(
    state.rental.vehicleType,
    state.rental.vehicleId,
  );
  const allowedLicenseCategoryOptions = licenseCategoryOptions.filter(
    (option) =>
      option.value === "" || allowedLicenseOptions.includes(option.value as LicenseCategory),
  );
  const licenseCategoryHint = getLicenseCategoryHint(state.rental.vehicleType);
  const selectedHelmetSize1Option =
    helmetSizeOptions.find((option) => option.value === state.addons.helmetSize1) ??
    helmetSizeOptions[0];
  const selectedHelmetSize2Option =
    helmetSizeOptions.find((option) => option.value === state.addons.helmetSize2) ??
    helmetSizeOptions[0];

  useEffect(() => {
    if (supportsHelmet) {
      if (!state.addons.helmet) {
        updateSection("addons", { helmet: true });
      }
      return;
    }

    if (state.addons.helmet || state.addons.helmetSize1 || state.addons.helmetSize2) {
      updateSection("addons", {
        helmet: false,
        helmetSize1: "",
        helmetSize2: "",
      });
    }
  }, [
    state.addons.helmet,
    state.addons.helmetSize1,
    state.addons.helmetSize2,
    supportsHelmet,
    updateSection,
  ]);

  useEffect(() => {
    if (
      state.additionalDriver.licenseCategory &&
      !allowedLicenseOptions.includes(state.additionalDriver.licenseCategory as LicenseCategory)
    ) {
      updateSection("additionalDriver", { licenseCategory: "" });
    }
  }, [
    allowedLicenseOptions,
    state.additionalDriver.licenseCategory,
    updateSection,
  ]);

  useEffect(() => {
    if (
      state.addons.cdwPlan &&
      state.addons.cdwPlan !== "none" &&
      !allowedCdwValues.includes(state.addons.cdwPlan)
    ) {
      updateSection("addons", { cdwPlan: "none", cdw: false });
    }
  }, [allowedCdwValues, state.addons.cdwPlan, updateSection]);

  useEffect(() => {
    if (state.delivery.pickupOption === "office" && state.additionalDriver.passportIdUpload) {
      updateSection("additionalDriver", { passportIdUpload: "" });
    }
  }, [state.delivery.pickupOption, state.additionalDriver.passportIdUpload, updateSection]);

  return (
    <StepShell title={tSteps("title")} description={tSteps("description")}>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={supportsHelmet} readOnly disabled />
            {t("helmetLabel")}
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {t("helmetIncludedNote")}
          </p>

          {supportsHelmet && helmetEnabled ? (
            <div className="mt-3 space-y-3">
              <label className="text-sm font-medium text-slate-700">
                {t("helmetSize1")}
                <Popover.Root open={helmetSize1MenuOpen} onOpenChange={setHelmetSize1MenuOpen}>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      data-field="addons.helmetSize1"
                      className={`mt-1 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        isFieldInvalid("addons.helmetSize1")
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 hover:border-slate-300 focus:border-[var(--brand-blue)] focus:ring-[var(--brand-blue)]/20"
                      }`}
                    >
                      <span>{selectedHelmetSize1Option.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                          helmetSize1MenuOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      className="z-[100] w-[var(--radix-popover-trigger-width)] rounded-md border border-slate-200 bg-white p-1 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)]"
                    >
                      <div role="listbox" className="max-h-64 overflow-y-auto">
                        {helmetSizeOptions.map((option) => {
                          const selected = option.value === state.addons.helmetSize1;
                          return (
                            <button
                              key={option.label}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
                                selected
                                  ? "bg-[var(--brand-blue)]/10 text-slate-900"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                              onClick={() => {
                                updateSection("addons", { helmetSize1: option.value });
                                setHelmetSize1MenuOpen(false);
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </label>
              {getFieldError("addons.helmetSize1") ? (
                <p className="text-xs text-red-600">{getFieldError("addons.helmetSize1")}</p>
              ) : null}
              <label className="text-sm font-medium text-slate-700">
                {t("helmetSize2")}
                <Popover.Root open={helmetSize2MenuOpen} onOpenChange={setHelmetSize2MenuOpen}>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      data-field="addons.helmetSize2"
                      className={`mt-1 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        isFieldInvalid("addons.helmetSize2")
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 hover:border-slate-300 focus:border-[var(--brand-blue)] focus:ring-[var(--brand-blue)]/20"
                      }`}
                    >
                      <span>{selectedHelmetSize2Option.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                          helmetSize2MenuOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      className="z-[100] w-[var(--radix-popover-trigger-width)] rounded-md border border-slate-200 bg-white p-1 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)]"
                    >
                      <div role="listbox" className="max-h-64 overflow-y-auto">
                        {helmetSizeOptions.map((option) => {
                          const selected = option.value === state.addons.helmetSize2;
                          return (
                            <button
                              key={option.label}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
                                selected
                                  ? "bg-[var(--brand-blue)]/10 text-slate-900"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                              onClick={() => {
                                updateSection("addons", { helmetSize2: option.value });
                                setHelmetSize2MenuOpen(false);
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </label>
              {getFieldError("addons.helmetSize2") ? (
                <p className="text-xs text-red-600">{getFieldError("addons.helmetSize2")}</p>
              ) : null}
            </div>
          ) : supportsHelmet ? (
            <p className="mt-2 text-xs text-slate-600">
              {t("helmetAutoIncluded")}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-600">
              {t("helmetOnlyMotorbikeAtv")}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={state.addons.additionalDriver}
              onChange={(event) =>
                updateSection("addons", { additionalDriver: event.target.checked })
              }
            />
            {t("additionalDriver")}
          </label>

          {state.addons.additionalDriver ? (
            <div className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  {tCust("fullName")}
                  <input
                    type="text"
                    name="additionalDriver.fullName"
                    data-field="additionalDriver.fullName"
                    value={state.additionalDriver.fullName}
                    onChange={(event) =>
                      updateSection("additionalDriver", { fullName: event.target.value })
                    }
                    className={`${fieldClass} ${isFieldInvalid("additionalDriver.fullName") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  />
                  {getFieldError("additionalDriver.fullName") ? (
                    <span className="mt-1 block text-xs text-red-600">
                      {getFieldError("additionalDriver.fullName")}
                    </span>
                  ) : null}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {tCust("phone")}
                  <input
                    type="tel"
                    name="additionalDriver.phone"
                    data-field="additionalDriver.phone"
                    value={state.additionalDriver.phone}
                    onChange={(event) =>
                      updateSection("additionalDriver", { phone: event.target.value })
                    }
                    className={`${fieldClass} ${isFieldInvalid("additionalDriver.phone") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  />
                  {getFieldError("additionalDriver.phone") ? (
                    <span className="mt-1 block text-xs text-red-600">
                      {getFieldError("additionalDriver.phone")}
                    </span>
                  ) : null}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {tCust("email")}
                  <input
                    type="email"
                    name="additionalDriver.email"
                    data-field="additionalDriver.email"
                    value={state.additionalDriver.email}
                    onChange={(event) =>
                      updateSection("additionalDriver", { email: event.target.value })
                    }
                    className={`${fieldClass} ${isFieldInvalid("additionalDriver.email") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    suppressHydrationWarning
                  />
                  {getFieldError("additionalDriver.email") ? (
                    <span className="mt-1 block text-xs text-red-600">
                      {getFieldError("additionalDriver.email")}
                    </span>
                  ) : null}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {tCust("nationality")}
                  <input
                    type="text"
                    name="additionalDriver.nationality"
                    data-field="additionalDriver.nationality"
                    value={state.additionalDriver.nationality}
                    onChange={(event) =>
                      updateSection("additionalDriver", { nationality: event.target.value })
                    }
                    className={`${fieldClass} ${isFieldInvalid("additionalDriver.nationality") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  />
                  {getFieldError("additionalDriver.nationality") ? (
                    <span className="mt-1 block text-xs text-red-600">
                      {getFieldError("additionalDriver.nationality")}
                    </span>
                  ) : null}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {tCust("dateOfBirth")}
                  <input
                    type="date"
                    name="additionalDriver.dateOfBirth"
                    data-field="additionalDriver.dateOfBirth"
                    value={state.additionalDriver.dateOfBirth}
                    onChange={(event) =>
                      updateSection("additionalDriver", { dateOfBirth: event.target.value })
                    }
                    className={`${fieldClass} ${isFieldInvalid("additionalDriver.dateOfBirth") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  />
                  {getFieldError("additionalDriver.dateOfBirth") ? (
                    <span className="mt-1 block text-xs text-red-600">
                      {getFieldError("additionalDriver.dateOfBirth")}
                    </span>
                  ) : null}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {tCust("licenseCategory")}
                  <Popover.Root open={licenseMenuOpen} onOpenChange={setLicenseMenuOpen}>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        aria-haspopup="listbox"
                        className="mt-1 flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                      >
                        <span>{selectedLicenseCategoryOption.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                            licenseMenuOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        className="z-[100] w-[var(--radix-popover-trigger-width)] rounded-md border border-slate-200 bg-white p-1 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)]"
                      >
                        <div role="listbox" className="max-h-64 overflow-y-auto">
                          {allowedLicenseCategoryOptions.map((option) => {
                            const selected = option.value === state.additionalDriver.licenseCategory;
                            return (
                              <button
                                key={option.label}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
                                  selected
                                    ? "bg-[var(--brand-blue)]/10 text-slate-900"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                                onClick={() => {
                                  updateSection("additionalDriver", {
                                    licenseCategory: option.value,
                                  });
                                  setLicenseMenuOpen(false);
                                }}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                  <p className="mt-1 text-xs text-slate-500">{licenseCategoryHint}</p>
                  {getFieldError("additionalDriver.licenseCategory") ? (
                    <p className="mt-1 text-xs text-red-600">
                      {getFieldError("additionalDriver.licenseCategory")}
                    </p>
                  ) : null}
                </label>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-xs font-semibold text-slate-700">{t("addDriverIdHeading")}</p>
                <p className="mt-1 text-xs text-slate-600">{t("addDriverIdBody")}</p>
                {state.delivery.pickupOption === "delivery" ? (
                  <div className="mt-2">
                    <DocumentUploadField
                      label={t("passportUploadLabel")}
                      description={t("passportUploadDesc")}
                      category="additional_driver_passport"
                      bookingSessionId={bookingSessionId}
                      value={state.additionalDriver.passportIdUpload}
                      onPathChange={(relativePath) =>
                        updateSection("additionalDriver", { passportIdUpload: relativePath })
                      }
                      name="additionalDriver.passportIdUpload"
                      data-field="additionalDriver.passportIdUpload"
                    />
                    {getFieldError("additionalDriver.passportIdUpload") ? (
                      <p className="mt-1 text-xs text-red-600">
                        {getFieldError("additionalDriver.passportIdUpload")}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="additionalDriver.officeIdConfirmed"
                      data-field="additionalDriver.officeIdConfirmed"
                      checked={state.additionalDriver.officeIdConfirmed}
                      onChange={(event) =>
                        updateSection("additionalDriver", { officeIdConfirmed: event.target.checked })
                      }
                    />
                    {t("addDriverOfficeConfirm")}
                  </label>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">{t("cdwTitle")}</p>
        <p className="mt-2 text-xs font-semibold text-slate-700">{t("cdwDefaultIntro")}</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>{t("cdwEx1")}</li>
          <li>{t("cdwEx2")}</li>
          <li>{t("cdwCanReduce")}</li>
        </ul>
        <Popover.Root open={cdwMenuOpen} onOpenChange={setCdwMenuOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-haspopup="listbox"
              className="mt-2 flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
            >
              <span>{selectedCdwOption.label}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                  cdwMenuOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={6}
              className="z-[100] w-[var(--radix-popover-trigger-width)] rounded-md border border-slate-200 bg-white p-1 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)]"
            >
              <div role="listbox" className="max-h-64 overflow-y-auto">
                {cdwOptions.map((option) => {
                  const selected = option.value === state.addons.cdwPlan;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "bg-[var(--brand-blue)]/10 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        updateSection("addons", {
                          cdwPlan: option.value,
                          cdw: option.value !== "none",
                        });
                        setCdwMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <p className="mt-3 text-xs font-semibold text-slate-700">{t("cdwExclusionsTitle")}</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>{t("cdwEx3")}</li>
          <li>{t("cdwEx4")}</li>
          <li>{t("cdwEx5")}</li>
          <li>{t("cdwEx6")}</li>
          <li>{t("cdwEx7")}</li>
        </ul>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">{t("extraEquipment")}</p>
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.addons.storageBox}
            onChange={(event) => updateSection("addons", { storageBox: event.target.checked })}
          />
          {t("storageBoxLabel")}
        </label>
      </div>
    </StepShell>
  );
}
