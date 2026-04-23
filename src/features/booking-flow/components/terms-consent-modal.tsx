"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TermsConsentModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onAgree: () => void | Promise<void>;
  isSubmitting?: boolean;
};

const TERMS_SUMMARY_SECTIONS = [
  {
    heading: "Driver Requirements",
    points: [
      "Minimum age is 18 years for 50cc and 21 years for 125cc/ATV rentals.",
      "A valid driving licence and passport/ID must be presented at pickup.",
      "Non-EU licence holders may need an International Driving Permit (IDP).",
    ],
  },
  {
    heading: "Rental Period",
    points: [
      "Rentals are calculated on a 24-hour basis.",
      "Late return may incur an additional fee and extra rental day charge.",
      "No-show or delays above one hour may result in cancellation.",
    ],
  },
  {
    heading: "Payments",
    points: [
      "Full rental payment is required before vehicle release.",
      "Accepted payment methods are cash and card.",
      "Displayed prices include VAT and basic insurance.",
    ],
  },
  {
    heading: "Security Deposit",
    points: [
      "A refundable security deposit is collected at pickup based on vehicle type.",
      "Deposit release may take up to 7-10 days after return checks.",
    ],
  },
  {
    heading: "Insurance & Liability",
    points: [
      "Third-party insurance is included; excess liability depends on vehicle category.",
    ],
  },
  {
    heading: "Optional Insurance (CDW)",
    points: [
      "Optional CDW can reduce excess liability according to selected plan.",
      "CDW does not cover negligence, alcohol/drug use, off-road misuse, lost keys, or tyre damage.",
    ],
  },
  {
    heading: "Delivery, Extras & Fees",
    points: [
      "Delivery and collection fees may apply depending on selected location/service.",
      "Additional driver and young driver fees apply where selected.",
      "Traffic fine administration fees apply for each violation.",
    ],
  },
  {
    heading: "Vehicle Condition",
    points: [
      "Vehicles are delivered in good working condition and should be inspected at pickup.",
      "Pickup photos are recommended to document vehicle condition.",
    ],
  },
  {
    heading: "Use of Vehicle (Strict Rules)",
    points: [
      "Dangerous driving, racing, sub-renting, and taking vehicles outside Malta are prohibited.",
      "Alcohol/drug use and any reckless use are material breaches of the contract.",
    ],
  },
  {
    heading: "Safety",
    points: [
      "Helmets are mandatory and must be used correctly during the rental period.",
      "Rider safety and responsible driving behaviour remain the renter's responsibility.",
    ],
  },
  {
    heading: "Damage & Costs",
    points: [
      "Customer is responsible for chargeable damage according to the damage assessment.",
      "Major damage, total loss, or theft may be charged up to the applicable liability.",
    ],
  },
  {
    heading: "Accident Procedure",
    points: [
      "In an accident, inform the company immediately and contact police when required.",
      "Do not admit liability to third parties before official reporting.",
      "Recovery costs, repair costs, and related losses may be charged to the customer.",
    ],
  },
  {
    heading: "Fines & Traffic Violations",
    points: [
      "Customer is responsible for all fines and traffic violations during rental.",
      "Administration fees apply per fine processed by the company.",
    ],
  },
  {
    heading: "Fuel Policy",
    points: [
      "Fuel policy is same-to-same (return with the same fuel level as pickup).",
      "Refuel service fee applies when returned fuel is below agreed level.",
    ],
  },
  {
    heading: "Breakdown",
    points: [
      "Mechanical faults are supported according to breakdown policy.",
      "Wrong fuel, lost keys, and misuse-related incidents are chargeable.",
    ],
  },
  {
    heading: "ATV / Quad Clause",
    points: [
      "Off-road use is not covered by insurance and is at customer's full risk.",
      "Any off-road related damage is fully chargeable to the customer.",
    ],
  },
  {
    heading: "Cancellation Policy",
    points: [
      "Free cancellation applies up to 48 hours before rental start.",
      "Cancellations inside 48 hours are non-refundable.",
    ],
  },
  {
    heading: "Loss / Theft",
    points: [
      "Customer remains fully liable in case of vehicle loss or theft.",
      "Charge may apply up to the full vehicle value.",
    ],
  },
  {
    heading: "GDPR Compliance",
    points: [
      "Customer data is processed under GDPR only for rental and legal compliance.",
      "Data is handled according to EU data protection obligations.",
    ],
  },
  {
    heading: "Termination",
    points: [
      "Company may terminate rental immediately for dangerous use or contract breach.",
      "No refund is issued after termination caused by customer breach.",
    ],
  },
  {
    heading: "Liability Waiver",
    points: [
      "Customer accepts the inherent risks related to vehicle operation.",
      "Company is not liable for personal belongings left in the vehicle.",
    ],
  },
] as const;

export function TermsConsentModal({ isOpen, onCancel, onAgree, isSubmitting = false }: TermsConsentModalProps) {
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="border-b border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Legal Consent</p>
          <h3 id="terms-modal-title" className="mt-1 text-lg font-bold text-slate-900">
            Terms & Conditions
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Please review the complete contract before confirming this booking.
          </p>
        </header>

        <div className="min-h-0 px-5 py-4 text-sm text-slate-700">
          <div className="max-h-[42vh] overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-slate-50/40 p-4">
            <div className="space-y-4">
              {TERMS_SUMMARY_SECTIONS.map((section) => (
                <section key={section.heading} className="rounded-md border border-slate-200 bg-white p-3">
                  <h4 className="text-sm font-semibold text-slate-900">{section.heading}</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-700 sm:text-sm">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
          <p className="mt-3">
            <Link href="/terms" target="_blank" className="font-semibold text-[var(--brand-blue)] underline">
              Open full terms in a new tab
            </Link>
          </p>
        </div>

        <footer className="border-t border-slate-200 px-5 py-4">
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={confirmChecked}
              disabled={isSubmitting}
              onChange={(event) => setConfirmChecked(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>I have read the full Terms & Conditions and agree to proceed.</span>
          </label>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmChecked(false);
                onCancel();
              }}
              disabled={isSubmitting}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmChecked(false);
                void onAgree();
              }}
              disabled={!confirmChecked || isSubmitting}
              className="rounded-full bg-[var(--brand-orange)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "I Agree"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
