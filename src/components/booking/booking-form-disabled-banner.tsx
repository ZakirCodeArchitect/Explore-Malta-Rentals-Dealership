import { CalendarClock } from "lucide-react";

type BookingFormDisabledBannerProps = Readonly<{
  message: string;
  /** `dark`: solid panel on photo / dark sections. `light`: solid amber on white UI. */
  variant?: "light" | "dark";
  className?: string;
}>;

/** Solid notice: online booking off + configured message, with icon. */
export function BookingFormDisabledBanner({
  message,
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
        <span>{message}</span>
      </p>
    </div>
  );
}
