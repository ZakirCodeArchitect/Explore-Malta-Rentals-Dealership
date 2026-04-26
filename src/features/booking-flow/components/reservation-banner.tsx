"use client";

type ReservationBannerProps = {
  remainingLabel: string | null;
};

export function ReservationBanner({ remainingLabel }: ReservationBannerProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
      <p className="font-semibold">This vehicle is reserved for you temporarily.</p>
      {remainingLabel ? <p className="mt-1">Reservation expires in {remainingLabel}.</p> : null}
    </div>
  );
}
