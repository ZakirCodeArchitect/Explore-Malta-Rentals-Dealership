import { CalendarClock } from "lucide-react";
import { BOOKING_FORM_DISABLED_BANNER } from "@/lib/booking-availability";

type BookingFormDisabledBannerProps = Readonly<{
  /** `dark`: solid panel on photo / dark sections. `light`: solid amber on white UI. */
  variant?: "light" | "dark";
  className?: string;
}>;

/** Solid (non-transparent) notice: online booking off + contact hint, with icon. */
export function BookingFormDisabledBanner({
  variant = "light",
  className,
}: BookingFormDisabledBannerProps) {
  const surface =
    variant === "dark"
      ? "rounded-md border border-amber-400/60 bg-amber-950 text-amber-50 text-xs font-medium sm:text-sm"
      : "rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-sm font-semibold";

  return (
    <div role="status" className={[surface, "px-3 py-2.5 leading-relaxed sm:px-4 sm:py-3", className].filter(Boolean).join(" ")}>
      <p className="flex items-start gap-2.5">
        <CalendarClock
          className={[
            "mt-0.5 h-4 w-4 shrink-0 opacity-95",
            variant === "dark" ? "text-amber-200" : "text-amber-800",
          ].join(" ")}
          aria-hidden
        />
        <span>{BOOKING_FORM_DISABLED_BANNER}</span>
      </p>
    </div>
  );
}
