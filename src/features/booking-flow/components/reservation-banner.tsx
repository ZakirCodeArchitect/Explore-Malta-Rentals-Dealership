"use client";

import { useTranslations } from "next-intl";

type ReservationBannerProps = {
  remainingLabel: string | null;
};

export function ReservationBanner({ remainingLabel }: ReservationBannerProps) {
  const t = useTranslations("BookingFlow");

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
      <p className="font-semibold">{t("reservationBannerTitle")}</p>
      {remainingLabel ? (
        <p className="mt-1">{t("reservationBannerExpires", { remaining: remainingLabel })}</p>
      ) : null}
    </div>
  );
}
