"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker, type DateRange } from "react-day-picker";
import {
  addDays,
  differenceInCalendarDays,
  format,
  parse,
  startOfDay,
} from "date-fns";
import { CalendarDays, Clock, Loader2, MapPin } from "lucide-react";
import {
  CUSTOM_LOCATION_ID,
  HOTEL_DELIVERY_ID,
  groupedLocationOptions,
  locationLabelById,
  needsLocationDetailField,
} from "@/features/booking/data/locations";
import { TIME_SLOTS, nextRoundedSlot } from "@/features/booking/lib/time-slots";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/features/booking/lib/booking-schema";
import { buildVehiclesSearchUrl } from "@/features/booking/lib/build-vehicles-url";
import { vehicles } from "@/features/vehicles/data/vehicles";

const inputShell =
  "flex w-full min-h-[3rem] items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 text-left text-sm font-medium text-slate-900 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] transition hover:border-slate-300 focus-within:border-[var(--brand-blue)] focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/25";
const selectClass =
  "w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-slate-900 outline-none";

function defaultDates() {
  const from = startOfDay(new Date());
  return {
    pickupDate: format(from, "yyyy-MM-dd"),
    dropoffDate: format(addDays(from, 1), "yyyy-MM-dd"),
  };
}

export function BookingSearchForm() {
  const router = useRouter();
  const [calOpen, setCalOpen] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(1);
  const minFrom = useMemo(() => startOfDay(new Date()), []);

  const minDaily = useMemo(
    () => Math.min(...vehicles.map((v) => v.pricePerDay)),
    [],
  );

  const { pickupDate: defPu, dropoffDate: defDo } = defaultDates();
  const defaultPickupTime = nextRoundedSlot(90);
  const defaultDropoffTime = "09:30";

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupLocationId: "",
      pickupCustom: "",
      differentDropoff: false,
      dropoffLocationId: "",
      dropoffCustom: "",
      pickupDate: defPu,
      dropoffDate: defDo,
      pickupTime: defaultPickupTime,
      dropoffTime: defaultDropoffTime,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setCalendarMonths(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pickupDate = watch("pickupDate");
  const dropoffDate = watch("dropoffDate");
  const pickupId = watch("pickupLocationId");
  const dropId = watch("dropoffLocationId");
  const differentDropoff = watch("differentDropoff");

  const range: DateRange = {
    from: parse(pickupDate, "yyyy-MM-dd", new Date()),
    to: parse(dropoffDate, "yyyy-MM-dd", new Date()),
  };

  const durationDays = Math.max(
    1,
    differenceInCalendarDays(
      parse(dropoffDate, "yyyy-MM-dd", new Date()),
      parse(pickupDate, "yyyy-MM-dd", new Date()),
    ),
  );

  const pickupLabel = (() => {
    if (pickupId === CUSTOM_LOCATION_ID) {
      return watch("pickupCustom")?.trim() || "Custom address";
    }
    if (pickupId === HOTEL_DELIVERY_ID) {
      return watch("pickupCustom")?.trim() || (locationLabelById(pickupId) ?? "—");
    }
    return locationLabelById(pickupId) ?? "—";
  })();
  const dropLabel = differentDropoff
    ? (() => {
        if (dropId === CUSTOM_LOCATION_ID) {
          return watch("dropoffCustom")?.trim() || "Custom address";
        }
        if (dropId === HOTEL_DELIVERY_ID) {
          return watch("dropoffCustom")?.trim() || (locationLabelById(dropId ?? "") ?? "—");
        }
        return locationLabelById(dropId ?? "") ?? "—";
      })()
    : pickupLabel;

  const onSubmit = async (values: BookingFormValues) => {
    await new Promise((r) => setTimeout(r, 320));
    router.push(buildVehiclesSearchUrl(values));
  };

  const dateSummary =
    pickupDate && dropoffDate
      ? `${format(parse(pickupDate, "yyyy-MM-dd", new Date()), "d MMM")} → ${format(parse(dropoffDate, "yyyy-MM-dd", new Date()), "d MMM yyyy")}`
      : "Select dates";

  const groups = groupedLocationOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/95 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
          <div className="min-w-0 flex-1 lg:max-w-[22rem]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Pickup location
            </label>
            <div className={inputShell}>
              <MapPin className="h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
              <select {...register("pickupLocationId")} className={selectClass}>
                <option value="">Select your pickup location</option>
                {[...groups.entries()].map(([group, entries]) => (
                  <optgroup key={group} label={group}>
                    {entries.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {needsLocationDetailField(pickupId) && (
              <input
                {...register("pickupCustom")}
                placeholder={
                  pickupId === HOTEL_DELIVERY_ID
                    ? "Hotel name, address, or delivery instructions…"
                    : "Street, area, or landmark…"
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-inner outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
              />
            )}
            {errors.pickupLocationId && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.pickupLocationId.message}</p>
            )}
            {errors.pickupCustom && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.pickupCustom.message}</p>
            )}
          </div>

          <div className="min-w-0 flex-[1.15]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Trip dates
            </label>
            <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
              <Popover.Trigger asChild>
                <button type="button" className={`${inputShell} justify-between`}>
                  <span className="flex min-w-0 items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-[var(--brand-blue)]" aria-hidden />
                    <span className="truncate">{dateSummary}</span>
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
                    onSelect={(r) => {
                      if (!r?.from) return;
                      const to = r.to ?? addDays(r.from, 1);
                      setValue("pickupDate", format(startOfDay(r.from), "yyyy-MM-dd"), {
                        shouldValidate: true,
                      });
                      setValue("dropoffDate", format(startOfDay(to), "yyyy-MM-dd"), {
                        shouldValidate: true,
                      });
                    }}
                    disabled={{ before: minFrom }}
                  />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <p className="mt-1.5 text-xs text-slate-500">
              Tap start and end dates — we default the return to the next day after your first tap.
            </p>
            {errors.pickupDate && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.pickupDate.message}</p>
            )}
            {errors.dropoffDate && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.dropoffDate.message}</p>
            )}
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 md:max-w-md lg:max-w-none">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Pickup time
              </label>
              <div className={inputShell}>
                <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <select {...register("pickupTime")} className={selectClass}>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Drop-off time
              </label>
              <div className={inputShell}>
                <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <select {...register("dropoffTime")} className={selectClass}>
                  {TIME_SLOTS.map((t) => (
                    <option key={`d-${t}`} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Controller
            name="differentDropoff"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className="inline-flex items-center gap-3 text-left"
              >
                <span className="text-sm font-semibold text-slate-800">Drop off at a different location</span>
                <span
                  className={`relative inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
                    field.value ? "bg-[var(--brand-orange)]" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition ${
                      field.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            )}
          />

          {differentDropoff && (
            <div className="w-full sm:max-w-md">
              <div className={inputShell}>
                <MapPin className="h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
                <select {...register("dropoffLocationId")} className={selectClass}>
                  <option value="">Drop-off location</option>
                  {[...groups.entries()].map(([group, entries]) => (
                    <optgroup key={`drop-${group}`} label={group}>
                      {entries.map((e) => (
                        <option key={`drop-${e.id}`} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              {dropId && needsLocationDetailField(dropId) && (
                <input
                  {...register("dropoffCustom")}
                  placeholder={
                    dropId === HOTEL_DELIVERY_ID
                      ? "Hotel name, address, or delivery instructions…"
                      : "Street, area, or landmark…"
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                />
              )}
              {errors.dropoffLocationId && (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.dropoffLocationId.message}</p>
              )}
              {errors.dropoffCustom && (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.dropoffCustom.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-[var(--surface-soft)]/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {durationDays} day{durationDays === 1 ? "" : "s"} · Pickup: {pickupLabel}
            {differentDropoff ? ` · Drop-off: ${dropLabel}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Indicative fleet rates from €{minDaily} / day · Final price depends on vehicle and add-ons.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-7 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_rgba(255,147,15,0.85)] transition hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Searching…
            </>
          ) : (
            "Search available vehicles"
          )}
        </button>
      </div>
    </form>
  );
}
