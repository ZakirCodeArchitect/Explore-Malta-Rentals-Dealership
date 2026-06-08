"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { normalizeHotelCode } from "@/lib/hotel-codes/normalize-hotel-code";

type ValidateResponse =
  | {
      success: true;
      valid: true;
      code: string;
      discountPercent: number;
      partnerName: string;
    }
  | {
      success: false;
      valid: false;
      message: string;
    };

export function HotelCodeField() {
  const t = useTranslations("BookingWizard.hotelCode");
  const { state, updateSection } = useBookingFlow();
  const [isValidating, setIsValidating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateCode = useCallback(
    async (rawCode: string) => {
      const normalized = normalizeHotelCode(rawCode);
      if (!normalized) {
        updateSection("hotelCode", {
          code: rawCode,
          appliedCode: null,
          discountPercent: null,
          partnerName: null,
          error: null,
        });
        return;
      }

      setIsValidating(true);
      try {
        const response = await fetch("/api/hotel-codes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: normalized }),
        });
        const payload = (await response.json()) as ValidateResponse;

        if (!response.ok || !payload.success || !payload.valid) {
          updateSection("hotelCode", {
            code: normalized,
            appliedCode: null,
            discountPercent: null,
            partnerName: null,
            error: payload.success === false ? payload.message : t("invalidGeneric"),
          });
          return;
        }

        updateSection("hotelCode", {
          code: normalized,
          appliedCode: payload.code,
          discountPercent: payload.discountPercent,
          partnerName: payload.partnerName,
          error: null,
        });
      } catch {
        updateSection("hotelCode", {
          code: normalized,
          appliedCode: null,
          discountPercent: null,
          partnerName: null,
          error: t("validateFailed"),
        });
      } finally {
        setIsValidating(false);
      }
    },
    [t, updateSection],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function handleChange(value: string) {
    updateSection("hotelCode", {
      code: value,
      appliedCode: null,
      discountPercent: null,
      partnerName: null,
      error: null,
    });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void validateCode(value);
    }, 450);
  }

  function handleBlur() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    void validateCode(state.hotelCode.code);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <label htmlFor="booking-hotel-code" className="text-sm font-semibold text-slate-900">
        {t("label")}
      </label>
      <p className="mt-1 text-xs text-slate-500">{t("description")}</p>
      <div className="relative mt-3">
        <input
          id="booking-hotel-code"
          type="text"
          value={state.hotelCode.code}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
          autoComplete="off"
          spellCheck={false}
          placeholder={t("placeholder")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm uppercase tracking-wide text-slate-900 outline-none transition focus:border-[#3a7ca5]/40 focus:bg-white focus:ring-2 focus:ring-[#3a7ca5]/15"
        />
        {isValidating ? (
          <Loader2
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400"
            aria-hidden
          />
        ) : null}
      </div>
      {state.hotelCode.error ? (
        <p className="mt-2 text-sm text-rose-600" role="alert">
          {state.hotelCode.error}
        </p>
      ) : null}
      {state.hotelCode.appliedCode && state.hotelCode.discountPercent != null ? (
        <p className="mt-2 text-sm font-medium text-emerald-700" role="status">
          {t("applied", {
            percent: state.hotelCode.discountPercent,
            partner: state.hotelCode.partnerName ?? "",
          })}
        </p>
      ) : null}
    </div>
  );
}
