"use client";

import { useTranslations } from "next-intl";

type HoldExpiredNoticeProps = {
  message: string;
};

export function HoldExpiredNotice({ message }: HoldExpiredNoticeProps) {
  const t = useTranslations("BookingFlow");

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
      <p className="font-semibold">{t("holdExpiredTitle")}</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
