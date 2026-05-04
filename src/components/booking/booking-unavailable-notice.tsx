import { BOOKING_UNAVAILABLE_GLOBAL_MESSAGE } from "@/lib/booking-availability";

type BookingUnavailableNoticeProps = Readonly<{
  className?: string;
}>;

export function BookingUnavailableNotice({ className }: BookingUnavailableNoticeProps) {
  return (
    <div
      role="status"
      className={
        className ??
        "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-sm"
      }
    >
      <p className="font-medium text-amber-950">{BOOKING_UNAVAILABLE_GLOBAL_MESSAGE}</p>
    </div>
  );
}
