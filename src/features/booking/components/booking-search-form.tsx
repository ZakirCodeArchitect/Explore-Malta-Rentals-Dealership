"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
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
  createBookingFormSchema,
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
import { BookingFormDisabledBanner } from "@/components/booking/booking-form-disabled-banner";
import { useBookingControl } from "@/components/booking/booking-control-provider";

const inputShell =
  "flex w-full min-h-[3rem] items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 text-left text-sm font-medium text-slate-900 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] transition hover:border-slate-300 focus-within:border-[var(--brand-blue)] focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/25";

const textareaClass =
  "mt-2 w-full min-h-[5rem] rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-inner outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20";

const quickFilterChipClass =
  "group inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-[transform,box-shadow,border-color,background-color,color] hover:-translate-y-px hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 hover:shadow-[0_10px_24px_-16px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 active:translate-y-0";

const quickFilterChipIcon = "size-3.5 shrink-0";

function defaultDates() {
  const from = startOfDay(new Date());
  return {
    pickupDate: format(from, "yyyy-MM-dd"),
    dropoffDate: format(addDays(from, 1), "yyyy-MM-dd"),
  };
}

export function BookingSearchForm() {
  const { enabled: bookingEnabled, disabledMessage } = useBookingControl();
  const router = useRouter();
  const tSearch = useTranslations("BookingSearch");
  const tForm = useTranslations("BookingForm");
  const tCommon = useTranslations("Common");
  const [calOpen, setCalOpen] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(1);
  const minFrom = useMemo(() => startOfDay(new Date()), []);

  const { pickupDate: defPu, dropoffDate: defDo } = defaultDates();
  const defaultPickupTime = nextBookingSlotWithinHours(90);
  const defaultDropoffTime = "19:00";

  const bookingFormSchema = useMemo(
    () =>
      createBookingFormSchema({
        invalidPickupDate: tForm("invalidPickupDate"),
        invalidDropoffDate: tForm("invalidDropoffDate"),
        selectPickupTime: tForm("selectPickupTime"),
        pickupTimeWindow: tForm("pickupTimeWindow"),
        selectDropoffTime: tForm("selectDropoffTime"),
        dropoffTimeWindow: tForm("dropoffTimeWindow"),
        alternateAddressDetail: tForm("alternateAddressDetail"),
        dropoffAddressDetail: tForm("dropoffAddressDetail"),
        tripMinDays: tForm("tripMinDays", { min: TRIP_MIN_SPAN_DAYS }),
        tripMaxDays: tForm("tripMaxDays", { max: TRIP_MAX_SPAN_DAYS }),
        dropoffAfterPickup: tForm("dropoffAfterPickup"),
      }),
    [tForm],
  );

  const formResolver = useMemo(
    () => zodResolver(bookingFormSchema),
    [bookingFormSchema],
  );

  const form = useForm<BookingFormValues>({
    resolver: formResolver,
    defaultValues: {
      alternatePickupRequested: false,
      alternatePickupAddress: "",
      differentDropoff: false,
      dropoffAddress: "",
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

  /* eslint-disable react-hooks/incompatible-library -- react-hook-form watch() */
  const pickupDate = watch("pickupDate");
  const dropoffDate = watch("dropoffDate");
  const alternatePickupRequested = watch("alternatePickupRequested");
  const alternatePickupAddress = watch("alternatePickupAddress");
  const differentDropoff = watch("differentDropoff");
  const dropoffAddress = watch("dropoffAddress");
  /* eslint-enable react-hooks/incompatible-library */

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
      : tSearch("dateSummaryPick");

  const offSiteDiscountPart = offSiteQuote.hasBundleDiscount
    ? tSearch("bundleDiscount", { amount: offSiteQuote.discountEur })
    : "";

  const summaryDayLabel = durationDays === 1 ? tCommon("day") : tCommon("days");

  if (!bookingEnabled) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <p className="w-full text-xs font-semibold tracking-normal text-slate-600">
            {tSearch("quickFilterTitle")}
          </p>
          <Link href="/vehicles?cc=125&type=scooter" className={quickFilterChipClass}>
            <Gauge className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
            <span className="tabular-nums tracking-tight">{tSearch("chip125")}</span>
          </Link>
          <Link href="/vehicles?cc=50&type=scooter" className={quickFilterChipClass}>
            <Gauge className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
            <span className="tabular-nums tracking-tight">{tSearch("chip50")}</span>
          </Link>
          <Link href="/#services" className={quickFilterChipClass}>
            <Sparkles className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
            <span className="tracking-tight">{tSearch("chipServices")}</span>
          </Link>
        </div>

        <BookingFormDisabledBanner
          message={disabledMessage}
          variant="light"
          className="rounded-[1.35rem] p-5 text-[0.95rem] shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)] sm:p-6 sm:text-base lg:p-7"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <p className="w-full text-xs font-semibold tracking-normal text-slate-600">
          {tSearch("quickFilterTitle")}
        </p>
        <Link href="/vehicles?cc=125&type=scooter" className={quickFilterChipClass}>
          <Gauge className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
          <span className="tabular-nums tracking-tight">{tSearch("chip125")}</span>
        </Link>
        <Link href="/vehicles?cc=50&type=scooter" className={quickFilterChipClass}>
          <Gauge className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
          <span className="tabular-nums tracking-tight">{tSearch("chip50")}</span>
        </Link>
        <Link href="/#services" className={quickFilterChipClass}>
          <Sparkles className={quickFilterChipIcon} strokeWidth={2} aria-hidden />
          <span className="tracking-tight">{tSearch("chipServices")}</span>
        </Link>
      </div>

      <div className="rounded-[1.35rem] border border-slate-200/80 bg-[color-mix(in_srgb,var(--surface-card)_96%,white)] p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-100 bg-[var(--surface-soft)]/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {tSearch("pickupLocationTitle")}
            </p>
            <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
              {tSearch("shopPickupLine")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {tSearch("pickupHoursNote", { openTime: "09:30", closeTime: "19:00" })}
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
                <span className="text-sm font-semibold text-slate-900">{tSearch("alternatePickupTitle")}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                  {tSearch("alternatePickupHelp", { fee: singleLegOffSiteQuote.perLegFeeEur })}
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
                    <span className="text-sm font-semibold text-slate-900">{tSearch("differentDropoffTitle")}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                      {tSearch("differentDropoffHelp", { fee: singleLegOffSiteQuote.perLegFeeEur })}
                    </span>
                  </span>
                </label>
              )}
            />
          </div>

          {alternatePickupRequested ? (
            <div>
              <label htmlFor="alternate-pickup-address" className="text-xs font-semibold text-slate-500">
                {tSearch("exactPickupLabel")}
              </label>
              <textarea
                id="alternate-pickup-address"
                placeholder={tSearch("addressPlaceholder")}
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
                <p className="mt-2 text-xs text-slate-500">{tSearch("mapPreviewHint")}</p>
              )}
            </div>
          ) : null}

          {differentDropoff ? (
            <div>
              <label htmlFor="dropoff-address" className="text-xs font-semibold text-slate-500">
                {tSearch("exactDropoffLabel")}
              </label>
              <textarea
                id="dropoff-address"
                placeholder={tSearch("addressPlaceholder")}
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
                <p className="mt-2 text-xs text-slate-500">{tSearch("mapPreviewHint")}</p>
              )}
            </div>
          ) : null}

          {offSiteQuote.selectedLegs > 0 ? (
            <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
              {tSearch("offSiteTotalLine", {
                total: offSiteQuote.totalEur,
                legs: offSiteQuote.selectedLegs,
                perLeg: offSiteQuote.perLegFeeEur,
                discount: offSiteDiscountPart,
              })}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1.15fr_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">{tSearch("tripDatesLabel")}</label>
              <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
                <Popover.Trigger asChild>
                  <button type="button" className={`${inputShell} justify-between`}>
                    <span className="flex min-w-0 items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                      <span className="truncate">{dateSummary}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-slate-500">{tCommon("change")}</span>
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
                {tSearch("tripLengthNote", { min: TRIP_MIN_SPAN_DAYS, max: TRIP_MAX_SPAN_DAYS })}
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
                  {tSearch("pickupTime")}
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
                  {tSearch("dropoffTime")}
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
            {tSearch("summaryLine", {
              days: durationDays,
              offPickup: alternatePickupRequested ? tSearch("offPickup") : "",
              offDropoff: differentDropoff ? tSearch("offDropoff") : "",
              offSite:
                offSiteQuote.selectedLegs > 0
                  ? tSearch("offSiteExtra", { amount: offSiteQuote.totalEur })
                  : "",
            })}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            {tSearch("indicativeSummary", {
              tripEur: indicativeTripTotalEur,
              dailyEur: indicativeDailyEur,
              days: durationDays,
              dayLabel: summaryDayLabel,
            })}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-7 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_rgba(255,147,15,0.85)] transition hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {tSearch("submitSearching")}
              </>
            ) : (
              tSearch("submitIdle")
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
