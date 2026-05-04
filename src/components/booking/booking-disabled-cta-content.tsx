import { CalendarClock } from "lucide-react";

type BookingDisabledCtaContentProps = Readonly<{
  message: string;
  /** Tailwind classes for the icon (size, opacity). */
  iconClassName?: string;
  /** Extra classes on the outer flex wrapper (e.g. gap tweaks). */
  className?: string;
}>;

/** Icon + disabled booking message for compact CTAs (nav, cards, footers). */
export function BookingDisabledCtaContent({
  message,
  iconClassName = "h-4 w-4 shrink-0 opacity-90",
  className,
}: BookingDisabledCtaContentProps) {
  return (
    <span
      className={["inline-flex items-center justify-center gap-2", className].filter(Boolean).join(" ")}
      title={message}
    >
      <CalendarClock className={iconClassName} aria-hidden />
      <span className="text-left break-words">{message}</span>
    </span>
  );
}
