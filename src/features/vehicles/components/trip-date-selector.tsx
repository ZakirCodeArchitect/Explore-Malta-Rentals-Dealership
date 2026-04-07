"use client";

/** Earliest selectable day defaults to today (`minDate ?? today`); no fixed June-only floor. */

import { useEffect, useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker, type DateRange } from "react-day-picker";
import {
  addDays,
  differenceInCalendarDays,
  format,
  parse,
  startOfDay,
} from "date-fns";
import { CalendarDays } from "lucide-react";
import {
  TRIP_MAX_SPAN_DAYS,
  TRIP_MIN_SPAN_DAYS,
} from "@/features/booking/lib/booking-schema";

const tripTriggerClass =
  "mt-2 flex w-full min-h-[2.625rem] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)] transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/40 focus-visible:ring-offset-0";

export type TripDateSelectorProps = Readonly<{
  tripStart: Date;
  tripEnd: Date;
  onRangeChange: (start: Date, end: Date) => void;
  /** First selectable calendar day. Defaults to **today** (same idea as the booking form). */
  minDate?: Date;
  className?: string;
}>;

export function TripDateSelector({
  tripStart,
  tripEnd,
  onRangeChange,
  minDate,
  className,
}: TripDateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(1);
  const todayStart = useMemo(() => startOfDay(new Date()), []);
  const minDay = startOfDay(minDate ?? todayStart);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setCalendarMonths(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pickupIso = format(tripStart, "yyyy-MM-dd");
  const dropoffIso = format(tripEnd, "yyyy-MM-dd");

  const range: DateRange = {
    from: parse(pickupIso, "yyyy-MM-dd", new Date()),
    to: parse(dropoffIso, "yyyy-MM-dd", new Date()),
  };

  const dateSummary = `${format(tripStart, "d MMM")} → ${format(tripEnd, "d MMM yyyy")}`;

  return (
    <div className={className}>
      <p className="text-xs font-semibold text-slate-500">Trip dates</p>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={tripTriggerClass}
            aria-label={`Trip dates: ${dateSummary}. Change dates.`}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <CalendarDays className="h-4 w-4 shrink-0 text-[var(--brand-blue)]" aria-hidden />
              <span className="truncate text-sm font-semibold text-slate-800">
                {dateSummary}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-slate-500">Change</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align="start"
            className="z-[100] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
          >
            <DayPicker
              mode="range"
              numberOfMonths={calendarMonths}
              selected={range}
              max={TRIP_MAX_SPAN_DAYS}
              onSelect={(r) => {
                if (!r?.from) return;
                const from = startOfDay(r.from);
                let to =
                  r.to != null ? startOfDay(r.to) : addDays(from, TRIP_MIN_SPAN_DAYS);
                const span = differenceInCalendarDays(to, from);
                if (span < TRIP_MIN_SPAN_DAYS) {
                  to = addDays(from, TRIP_MIN_SPAN_DAYS);
                } else if (span > TRIP_MAX_SPAN_DAYS) {
                  to = addDays(from, TRIP_MAX_SPAN_DAYS);
                }
                onRangeChange(from, to);
              }}
              disabled={{ before: minDay }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
