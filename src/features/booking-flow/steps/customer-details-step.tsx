"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { DocumentUploadField } from "@/features/booking-flow/components/document-upload-field";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import {
  getAllowedLicenseCategories,
  getLicenseCategoryHint,
  type LicenseCategory,
} from "@/features/booking-flow/lib/license-categories";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20";

export function CustomerDetailsStep() {
  const { state, updateSection, getFieldError, isFieldInvalid, bookingSessionId } = useBookingFlow();
  const [licenseMenuOpen, setLicenseMenuOpen] = useState(false);
  const requiresUploads = state.delivery.pickupOption === "delivery";
  const allowedLicenseOptions = getAllowedLicenseCategories(state.rental.vehicleId);
  const licenseCategoryHint = getLicenseCategoryHint(state.rental.vehicleId);
  const licenseCategoryOptions = [
    { value: "", label: "Select category" },
    ...allowedLicenseOptions.map((option) => ({ value: option, label: option })),
  ] as const;
  const selectedLicenseCategoryOption =
    licenseCategoryOptions.find((option) => option.value === state.customer.licenseCategory) ??
    licenseCategoryOptions[0];

  useEffect(() => {
    if (
      state.customer.licenseCategory &&
      !allowedLicenseOptions.includes(state.customer.licenseCategory as LicenseCategory)
    ) {
      updateSection("customer", { licenseCategory: "" });
    }
  }, [allowedLicenseOptions, state.customer.licenseCategory, updateSection]);

  useEffect(() => {
    if (!requiresUploads && (state.customer.driverLicenseUpload || state.customer.passportUpload)) {
      updateSection("customer", { driverLicenseUpload: "", passportUpload: "" });
    }
  }, [requiresUploads, state.customer.driverLicenseUpload, state.customer.passportUpload, updateSection]);

  return (
    <StepShell
      title="Customer Information"
      description="Step 3 customer fields (all required except special notes)."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
          Customer fields (all required except notes)
        </p>
        <label className="text-sm font-medium text-slate-700">
          Full name
          <input
            type="text"
            name="customer.fullName"
            data-field="customer.fullName"
            value={state.customer.fullName}
            onChange={(event) => updateSection("customer", { fullName: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("customer.fullName") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
            placeholder="e.g. Alex Borg"
          />
          {getFieldError("customer.fullName") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("customer.fullName")}</span>
          ) : null}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Phone
          <input
            type="tel"
            name="customer.phone"
            data-field="customer.phone"
            value={state.customer.phone}
            onChange={(event) => updateSection("customer", { phone: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("customer.phone") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
            placeholder="e.g. +356 9912 3456"
          />
          {getFieldError("customer.phone") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("customer.phone")}</span>
          ) : null}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="customer.email"
            data-field="customer.email"
            value={state.customer.email}
            onChange={(event) => updateSection("customer", { email: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("customer.email") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
            placeholder="e.g. alex@email.com"
          />
          {getFieldError("customer.email") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("customer.email")}</span>
          ) : null}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Nationality
          <input
            type="text"
            name="customer.nationality"
            data-field="customer.nationality"
            value={state.customer.nationality}
            onChange={(event) => updateSection("customer", { nationality: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("customer.nationality") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
            placeholder="e.g. Maltese"
          />
          {getFieldError("customer.nationality") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("customer.nationality")}</span>
          ) : null}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Date of birth
          <input
            type="date"
            name="customer.dateOfBirth"
            data-field="customer.dateOfBirth"
            value={state.customer.dateOfBirth}
            onChange={(event) => updateSection("customer", { dateOfBirth: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("customer.dateOfBirth") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
          />
          {getFieldError("customer.dateOfBirth") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("customer.dateOfBirth")}</span>
          ) : null}
        </label>

        <label className="text-sm font-medium text-slate-700">
          License category
          <Popover.Root open={licenseMenuOpen} onOpenChange={setLicenseMenuOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-haspopup="listbox"
                className={`${inputClass} flex items-center justify-between`}
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
                  {licenseCategoryOptions.map((option) => {
                    const selected = option.value === state.customer.licenseCategory;
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
                          updateSection("customer", {
                            licenseCategory: option.value as "" | LicenseCategory,
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
          <p className="mt-1 text-xs text-slate-500">
            {licenseCategoryHint}
          </p>
          {getFieldError("customer.licenseCategory") ? (
            <p className="mt-1 text-xs text-red-600">{getFieldError("customer.licenseCategory")}</p>
          ) : null}
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">Driver&apos;s License (Conditional)</p>
        <p className="mt-1 text-xs text-slate-600">
          Based on your Step 2 pickup selection:{" "}
          <span className="font-semibold">
            {requiresUploads ? "Request delivery" : "Collect from office"}
          </span>
          .
        </p>
        <div className="mt-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="radio" checked={requiresUploads} readOnly />
            Delivery: Licence photo upload is required
          </span>
          <div className={`mt-2 ${!requiresUploads ? "pointer-events-none opacity-50" : ""}`}>
            <DocumentUploadField
              label="Driver's licence"
              category="customer_license"
              bookingSessionId={bookingSessionId}
              value={state.customer.driverLicenseUpload}
              onPathChange={(relativePath) => updateSection("customer", { driverLicenseUpload: relativePath })}
              disabled={!requiresUploads}
              name="customer.driverLicenseUpload"
              data-field="customer.driverLicenseUpload"
            />
          </div>
          {getFieldError("customer.driverLicenseUpload") ? (
            <span className="mt-1 block text-xs text-red-600">
              {getFieldError("customer.driverLicenseUpload")}
            </span>
          ) : null}
        </div>

        <label className="mt-3 flex flex-col gap-1 text-sm text-slate-700">
          <span className="flex items-center gap-2">
            <input type="radio" checked={!requiresUploads} readOnly />
            <span>Office pickup: In-person license presentation confirmation is required</span>
          </span>
          <span className="flex items-center gap-2 pl-7">
            <input
              type="checkbox"
              checked={state.customer.licenseConfirmationCheckbox}
              name="customer.licenseConfirmationCheckbox"
              data-field="customer.licenseConfirmationCheckbox"
              disabled={requiresUploads}
              onChange={(event) =>
                updateSection("customer", { licenseConfirmationCheckbox: event.target.checked })
              }
            />
            <span className={requiresUploads ? "text-slate-400" : ""}>
              I confirm I will present my license at pickup.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">Passport / ID (Conditional)</p>
        <p className="mt-1 text-xs text-slate-600">
          Based on your Step 2 pickup selection:{" "}
          <span className="font-semibold">
            {requiresUploads ? "Request delivery" : "Collect from office"}
          </span>
          .
        </p>
        <div className="mt-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="radio" checked={requiresUploads} readOnly />
            Delivery: Passport/ID photo upload is required
          </span>
          <div className={`mt-2 ${!requiresUploads ? "pointer-events-none opacity-50" : ""}`}>
            <DocumentUploadField
              label="Passport or national ID"
              category="customer_passport"
              bookingSessionId={bookingSessionId}
              value={state.customer.passportUpload}
              onPathChange={(relativePath) => updateSection("customer", { passportUpload: relativePath })}
              disabled={!requiresUploads}
              name="customer.passportUpload"
              data-field="customer.passportUpload"
            />
          </div>
          {getFieldError("customer.passportUpload") ? (
            <span className="mt-1 block text-xs text-red-600">
              {getFieldError("customer.passportUpload")}
            </span>
          ) : null}
        </div>
        <label className="mt-3 flex flex-col gap-1 text-sm text-slate-700">
          <span className="flex items-center gap-2">
            <input type="radio" checked={!requiresUploads} readOnly />
            <span>Office pickup: In-person Passport/ID presentation confirmation is required</span>
          </span>
          <span className="flex items-center gap-2 pl-7">
            <input
              type="checkbox"
              checked={state.customer.idConfirmationCheckbox}
              name="customer.idConfirmationCheckbox"
              data-field="customer.idConfirmationCheckbox"
              disabled={requiresUploads}
              onChange={(event) =>
                updateSection("customer", { idConfirmationCheckbox: event.target.checked })
              }
            />
            <span className={requiresUploads ? "text-slate-400" : ""}>
              I confirm I will present my Passport/ID at pickup.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Special notes
          <textarea
            value={state.customer.specialNotes}
            onChange={(event) => updateSection("customer", { specialNotes: event.target.value })}
            rows={4}
            placeholder="Any extra request or pickup information..."
            className={`${inputClass} min-h-24`}
          />
        </label>
      </div>
    </StepShell>
  );
}
