"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Clock } from "lucide-react";
import { forwardRef, useId, useState } from "react";
import { TIME_SLOTS } from "@/features/booking/lib/time-slots";

const triggerShell =
  "flex w-full min-h-[3rem] cursor-pointer items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 text-left text-sm font-medium text-slate-900 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] transition hover:border-slate-300 focus-visible:border-[var(--brand-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/25 data-[state=open]:border-[var(--brand-blue)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--brand-blue)]/20";

type TimeSlotSelectProps = Readonly<{
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  "aria-labelledby"?: string;
  /** Defaults to full day; pass booking-only slots (e.g. 09:30–19:00) when needed. */
  slots?: readonly string[];
}>;

export const TimeSlotSelect = forwardRef<HTMLButtonElement, TimeSlotSelectProps>(
  function TimeSlotSelect(
    {
      id: idProp,
      value,
      onChange,
      onBlur,
      "aria-labelledby": ariaLabelledBy,
      slots = TIME_SLOTS,
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? `time-slot-${autoId}`;
    const [open, setOpen] = useState(false);

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            id={id}
            aria-labelledby={ariaLabelledBy}
            aria-haspopup="listbox"
            className={`${triggerShell} justify-between`}
            onBlur={onBlur}
          >
          <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="min-w-0 flex-1 truncate tabular-nums">{value}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="z-[100] max-h-[min(280px,calc(100dvh-8rem))] w-[var(--radix-popover-trigger-width)] min-w-[10rem] overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)]"
        >
          <div
            role="listbox"
            aria-labelledby={ariaLabelledBy}
            className="max-h-[min(260px,calc(100dvh-9rem))] overflow-y-auto overscroll-contain py-0.5 [scrollbar-color:rgba(148,163,184,0.6)_transparent] [scrollbar-width:thin]"
          >
            {slots.map((slot) => {
              const selected = slot === value;
              return (
                <button
                  key={slot}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={[
                    "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium tabular-nums transition-colors",
                    selected
                      ? "bg-[color-mix(in_srgb,var(--brand-orange)_16%,white)] text-[var(--brand-blue-strong)]"
                      : "text-slate-800 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
                  ].join(" ")}
                  onClick={() => {
                    onChange(slot);
                    setOpen(false);
                  }}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
    );
  },
);
