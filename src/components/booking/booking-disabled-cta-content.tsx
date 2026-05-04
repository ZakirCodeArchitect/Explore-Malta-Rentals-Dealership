import { CalendarClock } from "lucide-react";
import { BOOKING_DISABLED_CTA_LABEL } from "@/lib/booking-availability";

type BookingDisabledCtaContentProps = Readonly<{
  /** Tailwind classes for the icon (size, opacity). */
  iconClassName?: string;
  /** Extra classes on the outer flex wrapper (e.g. gap tweaks). */
  className?: string;
}>;

/** Icon + “Online Booking Available Soon” for disabled booking CTAs. */
export function BookingDisabledCtaContent({
  iconClassName = "h-4 w-4 shrink-0 opacity-90",
  className,
}: BookingDisabledCtaContentProps) {
  return (
    <span
      className={["inline-flex items-center justify-center gap-2", className].filter(Boolean).join(" ")}
    >
      <CalendarClock className={iconClassName} aria-hidden />
      <span>{BOOKING_DISABLED_CTA_LABEL}</span>
    </span>
  );
}
