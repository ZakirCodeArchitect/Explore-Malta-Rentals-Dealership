"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { CalendarDays, Gauge, Loader2, MapPin, Sparkles } from "lucide-react";
import { GoogleMapEmbed } from "@/components/google-map-embed";
import {
  bookingFormSchema,
  SECURITY_DEPOSIT_EUR,
  TRIP_MAX_SPAN_DAYS,
  TRIP_MIN_SPAN_DAYS,
  type BookingFormValues,
} from "@/features/booking/lib/booking-schema";
import {
  BOOKING_TIME_SLOTS,
  nextBookingSlotWithinHours,
} from "@/features/booking/lib/time-slots";
import { TimeSlotSelect } from "@/features/booking/components/time-slot-select";
import { buildVehiclesSearchUrl } from "@/features/booking/lib/build-vehicles-url";
import {
  getIndicativeMotorcycleScooterDailyRateEur,
  getIndicativeMotorcycleScooterTripTotalEur,
} from "@/features/booking/lib/indicative-motorcycle-scooter-rates";
import { pricingService } from "@/lib/pricing/service";

const inputShell =
  "flex w-full min-h-[3rem] items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 text-left text-sm font-medium text-slate-900 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] transition hover:border-slate-300 focus-within:border-[var(--brand-blue)] focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/25";

const textareaClass =
  "mt-2 w-full min-h-[5rem] rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-inner outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20";

const quickFilterChipClass =
  "group inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-[var(--brand-orange-strong)] shadow-sm transition-[transform,box-shadow,border-color,background-color,color] hover:-translate-y-px hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange)] hover:text-white hover:shadow-[0_10px_28px_-16px_rgba(255,147,15,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-1 active:translate-y-0";

const quickFilterChipIcon = "size-3.5 shrink-0";

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

  const { pickupDate: defPu, dropoffDate: defDo } = defaultDates();
  const defaultPickupTime = nextBookingSlotWithinHours(90);
  const defaultDropoffTime = "19:00";

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      alternatePickupRequested: false,
      alternatePickupAddress: "",
      differentDropoff: false,
      dropoffAddress: "",
      depositPreference: "pay_at_meeting",
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
  const alternatePickupRequested = watch("alternatePickupRequested");
  const alternatePickupAddress = watch("alternatePickupAddress");
  const differentDropoff = watch("differentDropoff");
  const dropoffAddress = watch("dropoffAddress");

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

  const indicativeDailyEur =
    getIndicativeMotorcycleScooterDailyRateEur(durationDays);
  const indicativeTripTotalEur =
    getIndicativeMotorcycleScooterTripTotalEur(durationDays);

  const offSiteQuote = pricingService.quoteOffSiteService({
    pickupOffSite: alternatePickupRequested,
    dropoffOffSite: differentDropoff,
  });
  const singleLegOffSiteQuote = pricingService.quoteOffSiteService({
    pickupOffSite: true,
    dropoffOffSite: false,
  });

  const onSubmit = async (values: BookingFormValues) => {
    await new Promise((r) => setTimeout(r, 320));
    router.push(buildVehiclesSearchUrl(values));
  };

  const dateSummary =
    pickupDate && dropoffDate
      ? `${format(parse(pickupDate, "yyyy-MM-dd", new Date()), "d MMM")} → ${format(parse(dropoffDate, "yyyy-MM-dd", new Date()), "d MMM yyyy")}`
      : "Select dates";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <p className="w-full text-xs font-semibold tracking-normal text-[var(--brand-orange-strong)]">
          Quick filter by engine size
        </p>
        <Link href="/vehicles?cc=125&type=scooter" className={quickFilterChipClass}>
          <Gauge className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
          <span className="tabular-nums tracking-tight">125cc rent</span>
        </Link>
        <Link href="/vehicles?cc=50&type=scooter" className={quickFilterChipClass}>
          <Gauge className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
          <span className="tabular-nums tracking-tight">50cc rent</span>
        </Link>
        <Link href="/#services" className={quickFilterChipClass}>
          <Sparkles className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
          <span className="tracking-tight">Services &amp; benefits</span>
        </Link>
      </div>

      <div className="rounded-[1.35rem] border border-slate-200/80 bg-[color-mix(in_srgb,var(--surface-card)_96%,white)] p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-100 bg-[var(--surface-soft)]/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Pickup location
            </p>
            <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
              Pietà — shop pickup at Explore Malta Rentals
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Pickup and drop-off times are between <span className="font-semibold text-slate-800">09:30</span> and{" "}
              <span className="font-semibold text-slate-800">19:00</span>.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--brand-orange)]"
                {...register("alternatePickupRequested")}
              />
              <span>
                <span className="text-sm font-semibold text-slate-900">Request pickup at a different address</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                  Subject to availability. Additional{" "}
                  <span className="font-semibold text-slate-800">€{singleLegOffSiteQuote.perLegFeeEur}</span> —
                  payable when you check out.
                </span>
              </span>
            </label>

            <Controller
              name="differentDropoff"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--brand-orange)]"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>
                    <span className="text-sm font-semibold text-slate-900">Drop off at a different address</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                      Additional{" "}
                      <span className="font-semibold text-slate-800">€{singleLegOffSiteQuote.perLegFeeEur}</span> —
                      payable when you check out.
                    </span>
                  </span>
                </label>
              )}
            />
          </div>

          {alternatePickupRequested ? (
            <div>
              <label htmlFor="alternate-pickup-address" className="text-xs font-semibold text-slate-500">
                Exact pickup address
              </label>
              <textarea
                id="alternate-pickup-address"
                placeholder="Street, building, postcode, area…"
                className={textareaClass}
                {...register("alternatePickupAddress")}
              />
              {errors.alternatePickupAddress ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.alternatePickupAddress.message}</p>
              ) : null}
              {alternatePickupAddress?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <GoogleMapEmbed query={alternatePickupAddress} className="aspect-[16/9] min-h-[180px] w-full" />
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Map preview appears after you enter an address.</p>
              )}
            </div>
          ) : null}

          {differentDropoff ? (
            <div>
              <label htmlFor="dropoff-address" className="text-xs font-semibold text-slate-500">
                Exact drop-off address
              </label>
              <textarea
                id="dropoff-address"
                placeholder="Street, building, postcode, area…"
                className={textareaClass}
                {...register("dropoffAddress")}
              />
              {errors.dropoffAddress ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.dropoffAddress.message}</p>
              ) : null}
              {dropoffAddress?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <GoogleMapEmbed query={dropoffAddress} className="aspect-[16/9] min-h-[180px] w-full" />
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Map preview appears after you enter an address.</p>
              )}
            </div>
          ) : null}

          {offSiteQuote.selectedLegs > 0 ? (
            <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
              Off-site service total: <span className="font-semibold">€{offSiteQuote.totalEur}</span> (
              {offSiteQuote.selectedLegs} × €{offSiteQuote.perLegFeeEur}
              {offSiteQuote.hasBundleDiscount ? ` - €${offSiteQuote.discountEur} bundle discount` : ""}) —
              collected at checkout.
            </p>
          ) : null}

          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Security deposit (EUR {SECURITY_DEPOSIT_EUR})
            </legend>
            <p className="mt-1 text-xs text-slate-600">
              Choose whether you&apos;d like to pay the deposit online when you book, or at the first meeting when you
              collect the bike.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                <input type="radio" value="pay_at_meeting" className="text-[var(--brand-orange)]" {...register("depositPreference")} />
                Pay at first meeting
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                <input type="radio" value="pay_online" className="text-[var(--brand-orange)]" {...register("depositPreference")} />
                Pay online when booking
              </label>
            </div>
          </fieldset>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">Trip dates</label>
              <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
                <Popover.Trigger asChild>
                  <button type="button" className={`${inputShell} justify-between`}>
                    <span className="flex min-w-0 items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
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
                      max={TRIP_MAX_SPAN_DAYS}
                      onSelect={(r) => {
                        if (!r?.from) return;
                        const from = startOfDay(r.from);
                        let to = r.to != null ? startOfDay(r.to) : addDays(from, TRIP_MIN_SPAN_DAYS);
                        const span = differenceInCalendarDays(to, from);
                        if (span < TRIP_MIN_SPAN_DAYS) {
                          to = addDays(from, TRIP_MIN_SPAN_DAYS);
                        } else if (span > TRIP_MAX_SPAN_DAYS) {
                          to = addDays(from, TRIP_MAX_SPAN_DAYS);
                        }
                        setValue("pickupDate", format(from, "yyyy-MM-dd"), {
                          shouldValidate: true,
                        });
                        setValue("dropoffDate", format(to, "yyyy-MM-dd"), {
                          shouldValidate: true,
                        });
                      }}
                      disabled={{ before: minFrom }}
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
              <p className="mt-1.5 text-xs text-slate-500">
                Trips from {TRIP_MIN_SPAN_DAYS} to {TRIP_MAX_SPAN_DAYS} days.
              </p>
              {errors.pickupDate ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.pickupDate.message}</p>
              ) : null}
              {errors.dropoffDate ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{errors.dropoffDate.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  id="booking-pickup-time-label"
                  className="mb-1.5 block text-xs font-semibold text-slate-500"
                >
                  Pickup time
                </label>
                <Controller
                  name="pickupTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSlotSelect
                      ref={field.ref}
                      id="booking-pickup-time"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-labelledby="booking-pickup-time-label"
                      slots={BOOKING_TIME_SLOTS}
                    />
                  )}
                />
              </div>
              <div>
                <label
                  id="booking-dropoff-time-label"
                  className="mb-1.5 block text-xs font-semibold text-slate-500"
                >
                  Drop-off time
                </label>
                <Controller
                  name="dropoffTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSlotSelect
                      ref={field.ref}
                      id="booking-dropoff-time"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-labelledby="booking-dropoff-time-label"
                      slots={BOOKING_TIME_SLOTS}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-[var(--surface-soft)]/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {durationDays} day{durationDays === 1 ? "" : "s"} · Shop pickup Pietà
            {alternatePickupRequested ? " · Off-site pickup requested" : ""}
            {differentDropoff ? " · Different drop-off" : ""}
            {offSiteQuote.selectedLegs > 0 ? ` · +€${offSiteQuote.totalEur} off-site` : ""}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Indicative motorcycles/scooters total ~€{indicativeTripTotalEur} (€{indicativeDailyEur}/day × {durationDays}{" "}
            {durationDays === 1 ? "day" : "days"}) · Final price depends on vehicle and add-ons.
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
