import { DEFAULT_BOOKING_DISABLED_MESSAGE } from "@/lib/booking-control-constants";

type BookingUnavailableNoticeProps = Readonly<{
  className?: string;
  message?: string;
}>;

export function BookingUnavailableNotice({ className, message }: BookingUnavailableNoticeProps) {
  const text = message?.trim() || DEFAULT_BOOKING_DISABLED_MESSAGE;
  return (
    <div
      role="status"
      className={
        className ??
        "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-sm"
      }
    >
      <p className="font-medium text-amber-950">{text}</p>
    </div>
  );
}
