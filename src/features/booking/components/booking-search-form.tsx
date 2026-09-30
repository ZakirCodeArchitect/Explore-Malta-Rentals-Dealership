"use client";

import "react-day-picker/style.css";

import Image from "next/image";
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
import { calculateCalendarRentalDays } from "@/lib/pricing/rental-duration";
import Select, {
  components as selectComponents,
  type DropdownIndicatorProps,
} from "react-select";
import { CalendarDays, Loader2, MapPin, Search, SlidersHorizontal, Tag } from "lucide-react";
import type { BookingOption } from "@/features/home/data/hero-booking-options";
import { VEHICLE_TYPES } from "@/features/vehicles/data/vehicles";
import { vehicleFilterReactSelectStyles } from "@/features/vehicles/components/vehicle-pickup-fields";
import { resolveBrandFilterLabel } from "@/lib/vehicles/brand-utils";
import { useVehicleBrands } from "@/features/vehicles/lib/use-vehicle-brands";
import { GoogleMapEmbed } from "@/components/google-map-embed";
import {
  createBookingFormSchema,
  TRIP_MAX_SPAN_DAYS,
  TRIP_MIN_SPAN_DAYS,
  type BookingFormValues,
} from "@/features/booking/lib/booking-schema";
import {
  BOOKING_PICKUP_TIME_FALLBACK,
  BOOKING_TIME_SLOTS,
  nextBookingSlotWithinHours,
} from "@/features/booking/lib/time-slots";
import { TimeSlotSelect } from "@/features/booking/components/time-slot-select";
import { buildVehiclesSearchUrl } from "@/features/booking/lib/build-vehicles-url";
import { getPricingTierForDays } from "@/lib/pricing/pricing-tiers";
import { pricingService } from "@/lib/pricing/service";
import { SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";

/* ── Field system ───────────────────────────────────────────────────────────
   Every control in the panel (location, brand, date range, both times) shares
   this shell so they read as siblings: hairline border, `--r-field`, ink value
   text, blue focus ring. */
const inputShell = [
  "group flex w-full min-h-12 items-center gap-2 rounded-[var(--r-field)] border border-[var(--line)]",
  "bg-[var(--surface-card)] px-3.5 py-2 text-left text-sm font-semibold tracking-[-0.01em] text-[var(--ink-900)]",
  "shadow-[var(--elev-1)] transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
  "hover:border-[var(--line-strong)]",
  "focus-within:border-[var(--blue-500)] focus-within:ring-2 focus-within:ring-[var(--blue-500)]/25",
  "focus-visible:border-[var(--blue-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)]/30",
  "data-[state=open]:border-[var(--blue-500)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--blue-500)]/25",
].join(" ");

const inputShellDisabledClass =
  "cursor-not-allowed bg-[var(--surface-sunken)] text-[var(--text-faint)] shadow-none hover:border-[var(--line)]";

const inputShellErrorClass =
  "border-red-400 ring-2 ring-red-500/15 hover:border-red-400";

const fieldLabelClass = "type-spec mb-2 block text-[var(--text-muted)]";

const fieldErrorClass = "mt-1.5 text-xs font-medium text-red-600";

const fieldIconClass = "h-4 w-4 shrink-0 text-[var(--orange-500)]";

const changeAffordanceClass =
  "type-spec shrink-0 text-[var(--text-muted)] transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--ink-800)]";

const textareaClass =
  "mt-2 w-full min-h-[5rem] rounded-[var(--r-field)] border border-[var(--line)] bg-[var(--surface-card)] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--ink-900)] shadow-[var(--elev-1)] outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-standard)] placeholder:text-[var(--ink-400)] hover:border-[var(--line-strong)] focus:border-[var(--blue-500)] focus:ring-2 focus:ring-[var(--blue-500)]/25";

/* ── Quick-link chips (50cc / 125cc / services) ─────────────────────────────
   The hero variant sits on dark photography, so it uses a glass treatment;
   the default variant sits on the bone-white canvas. */
const quickFilterGroupClassByTone = {
  hero: "inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-[var(--line-inverse)] bg-white/10 p-1 shadow-[var(--elev-3)] backdrop-blur-md sm:gap-1.5 sm:p-1.5",
  default:
    "inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-card)] p-1 shadow-[var(--elev-2)] sm:gap-1.5 sm:p-1.5",
} as const;

const quickFilterChipClassByTone = {
  hero: "text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/70 focus-visible:ring-offset-[var(--ink-950)]",
  default:
    "text-[var(--ink-800)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-950)] focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-[var(--surface-card)]",
} as const;

const quickFilterCcIconByCc = {
  "50": "/landing page/50cc.png",
  "125": "/landing page/125cc.png",
} as const;

/* Source art is black line work, so it needs inverting to read on the hero video. */
const quickFilterIconClassByTone = {
  hero: "brightness-0 invert",
  default: "",
} as const;

const quickFilterChipClass =
  "group inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-semibold tracking-[-0.01em] transition-[background-color,color] duration-[var(--dur-base)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-12 sm:gap-2.5 sm:px-5 sm:text-sm md:text-base";

/* ── Segmented control (vehicle type) ──────────────────────────────────────── */
const segmentGroupClass =
  "grid grid-cols-2 gap-1.5 rounded-[var(--r-card)] border border-[var(--line)] bg-[var(--surface-sunken)] p-1.5 sm:flex sm:items-stretch";

const segmentClass = [
  "group relative flex min-h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-[calc(var(--r-card)-0.375rem)] px-3 py-2",
  "text-left transition-[background-color,box-shadow,color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
  "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-sunken)]",
].join(" ");

const segmentSelectedClass =
  "bg-[var(--surface-card)] text-[var(--ink-950)] shadow-[var(--elev-1)]";

const segmentIdleClass =
  "text-[var(--text-secondary)] hover:bg-white/60 hover:text-[var(--ink-900)]";

/* ── Panel ─────────────────────────────────────────────────────────────────
   Floats above the hero photograph: panel radius, inset hairline, `--elev-5`. */
const formShellClass =
  "relative z-10 overflow-hidden rounded-[var(--r-panel)] bg-[var(--surface-card)] p-4 shadow-[inset_0_0_0_1px_var(--line-subtle),var(--elev-5)] sm:p-5 lg:p-6";

const summaryBandClass =
  "-mx-4 -mb-4 mt-5 border-t border-[var(--line-subtle)] bg-[var(--surface-band)] px-4 py-4 sm:-mx-5 sm:-mb-5 sm:px-5 lg:-mx-6 lg:-mb-6 lg:px-6";

const submitButtonClass = [
  "inline-flex min-h-12 min-w-[11.5rem] shrink-0 items-center justify-center gap-2 rounded-full",
  "bg-[var(--orange-400)] px-7 text-sm font-semibold tracking-[-0.01em] text-[var(--ink-950)] shadow-[var(--elev-orange)]",
  "transition-[transform,box-shadow,background-color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
  "hover:bg-[var(--orange-500)] hover:shadow-[var(--elev-orange-lift)] motion-safe:hover:-translate-y-0.5",
  "active:translate-y-0 active:bg-[var(--orange-600)] active:shadow-[var(--elev-orange)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-500)] focus-visible:ring-offset-2",
  "disabled:translate-y-0 disabled:cursor-wait disabled:bg-[var(--orange-300)] disabled:shadow-[var(--elev-orange)]",
  "motion-reduce:transition-none sm:min-h-13 sm:min-w-[13rem] sm:text-base",
].join(" ");

const selectionCardClass =
  "flex cursor-pointer items-start gap-3 rounded-[var(--r-card)] border p-4 text-left transition-[border-color,background-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-standard)]";

const selectionCardSelectedClass =
  "border-[var(--orange-300)] bg-[var(--orange-50)] shadow-[var(--elev-1)]";

const selectionCardIdleClass =
  "border-[var(--line)] bg-[var(--surface-card)] hover:border-[var(--line-strong)] hover:bg-[var(--ink-50)]";

const selectionCheckboxClass =
  "mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 rounded-[0.3rem] border-[var(--line-strong)] accent-[var(--orange-500)] text-[var(--orange-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2";

const vehicleTypeIconByType: Record<
  (typeof VEHICLE_TYPES)[number],
  Readonly<{ src: string; className?: string }>
> = {
  Scooter: {
    src: "/vehicle-types/scooter.png",
  },
  Motorcycle: {
    src: "/vehicle-types/motorcycle.png",
  },
  Bicycle: {
    src: "/vehicle-types/bicycle.png",
  },
  ATV: {
    src: "/vehicle-types/atv.png",
  },
};

function defaultDates() {
  const from = startOfDay(new Date());
  return {
    pickupDate: format(from, "yyyy-MM-dd"),
    dropoffDate: format(addDays(from, 1), "yyyy-MM-dd"),
  };
}

function optionByValue(
  options: readonly BookingOption[],
  value: string,
): BookingOption {
  return options.find((option) => option.value === value) ?? options[0]!;
}

function makeBrandDropdownIndicator(changeLabel: string) {
  return function BrandDropdownIndicator(
    props: DropdownIndicatorProps<BookingOption, false>,
  ) {
    return (
      <selectComponents.DropdownIndicator {...props}>
        <span className="type-spec shrink-0 text-[var(--text-muted)]">
          {changeLabel}
        </span>
      </selectComponents.DropdownIndicator>
    );
  };
}

type BookingSearchFormProps = Readonly<{
  initialValues?: Partial<{
    vehicleType: string;
    brand: string;
    pickupDate: string;
    dropoffDate: string;
    pickupTime: string;
    dropoffTime: string;
  }>;
  /** Preloaded active listing brands (skips client fetch when set). */
  brandOptions?: readonly string[];
  quickFilterTone?: "default" | "hero";
}>;

type VehicleTypeCard = Readonly<{
  value: string;
  label: string;
  imageSrc: string;
  imageClassName?: string;
}>;

export function BookingSearchForm({
  initialValues,
  brandOptions,
  quickFilterTone = "default",
}: BookingSearchFormProps = {}) {
  const router = useRouter();
  const tSearch = useTranslations("BookingSearch");
  const tForm = useTranslations("BookingForm");
  const tCommon = useTranslations("Common");
  const tFilters = useTranslations("VehicleFilters");
  const { brands: fetchedBrands, isLoading: isBrandsLoading } = useVehicleBrands({
    initialBrands: brandOptions,
  });
  const brandChoices = brandOptions ?? fetchedBrands;
  const [isMounted, setIsMounted] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(1);
  const minFrom = useMemo(() => startOfDay(new Date()), []);

  const { pickupDate: defPu, dropoffDate: defDo } = defaultDates();
  const defaultPickupTime = BOOKING_PICKUP_TIME_FALLBACK;
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
      vehicleType: initialValues?.vehicleType ?? "all",
      brand:
        initialValues?.brand && initialValues.brand !== "all"
          ? resolveBrandFilterLabel(initialValues.brand, brandChoices)
          : "all",
      alternatePickupRequested: false,
      alternatePickupAddress: "",
      differentDropoff: false,
      dropoffAddress: "",
      pickupDate: initialValues?.pickupDate ?? defPu,
      dropoffDate: initialValues?.dropoffDate ?? defDo,
      pickupTime: initialValues?.pickupTime ?? defaultPickupTime,
      dropoffTime: initialValues?.dropoffTime ?? defaultDropoffTime,
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!initialValues?.pickupTime) {
      setValue("pickupTime", nextBookingSlotWithinHours(90), { shouldValidate: true });
    }
  }, [initialValues?.pickupTime, setValue]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setCalendarMonths(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!initialValues?.brand || initialValues.brand === "all") {
      return;
    }
    setValue("brand", resolveBrandFilterLabel(initialValues.brand, brandChoices));
  }, [brandChoices, initialValues?.brand, setValue]);

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

  const durationDays = calculateCalendarRentalDays(pickupDate, dropoffDate) ?? 0;

  const matchedTier = durationDays > 0 ? getPricingTierForDays(durationDays) : null;

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

  const vehicleTypeCards = useMemo(
    (): VehicleTypeCard[] => [
      ...VEHICLE_TYPES.map((type) => ({
        value: type.toLowerCase(),
        label: type,
        imageSrc: vehicleTypeIconByType[type].src,
        imageClassName: vehicleTypeIconByType[type].className,
      })),
    ],
    [],
  );

  const brandSelectOptions = useMemo((): BookingOption[] => {
    return [
      { value: "all", label: tFilters("allBrands") },
      ...brandChoices.map((brand) => ({ value: brand, label: brand })),
    ];
  }, [brandChoices, tFilters]);

  /* Presentation-only mirrors of the select's own `isDisabled` expression and
     the resolver's date errors, so the shell can show matching states. */
  const isBrandSelectDisabled = isBrandsLoading && brandChoices.length === 0;
  const hasDateError = Boolean(errors.pickupDate || errors.dropoffDate);

  const brandSelectComponents = useMemo(
    () => ({
      DropdownIndicator: makeBrandDropdownIndicator(tCommon("change")),
      IndicatorSeparator: () => null,
    }),
    [tCommon],
  );

  return (
    <form
      id="vehicle-trip-search"
      onSubmit={handleSubmit(onSubmit)}
      className="flex scroll-mt-28 flex-col gap-6"
    >
      <div
        className={`${quickFilterGroupClassByTone[quickFilterTone]} mx-auto`}
      >
        <Link
          href="/vehicles?cc=50&type=scooter"
          className={`${quickFilterChipClass} ${quickFilterChipClassByTone[quickFilterTone]}`}
        >
          <Image
            src={quickFilterCcIconByCc["50"]}
            alt=""
            width={56}
            height={48}
            unoptimized
            className={`h-6 w-7 shrink-0 object-contain sm:h-11 sm:w-13 ${quickFilterIconClassByTone[quickFilterTone]}`}
            aria-hidden
          />
          <span className="tabular-nums">{tSearch("chip50")}</span>
        </Link>
        <Link
          href="/vehicles?cc=125&type=scooter"
          className={`${quickFilterChipClass} ${quickFilterChipClassByTone[quickFilterTone]}`}
        >
          <Image
            src={quickFilterCcIconByCc["125"]}
            alt=""
            width={36}
            height={36}
            unoptimized
            className={`h-6 w-6 shrink-0 object-contain sm:h-8 sm:w-8 ${quickFilterIconClassByTone[quickFilterTone]}`}
            aria-hidden
          />
          <span className="tabular-nums">{tSearch("chip125")}</span>
        </Link>
        <Link
          href="/#services"
          className={`${quickFilterChipClass} ${quickFilterChipClassByTone[quickFilterTone]}`}
        >
          <span>{tSearch("chipServices")}</span>
        </Link>
      </div>

      <div className="relative isolate">
        <div className={formShellClass}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 rounded-[var(--r-card)] border border-[var(--line-subtle)] bg-[var(--surface-sunken)] px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="type-spec text-[var(--text-muted)]">{tSearch("pickupLocationTitle")}</p>
              <p className="mt-1.5 flex items-start gap-2 text-sm font-semibold tracking-[-0.01em] text-[var(--ink-900)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--orange-500)]" aria-hidden />
                {tSearch("shopPickupLine")}
              </p>
              <p className="mt-2 text-xs leading-relaxed tabular-nums text-[var(--text-secondary)]">
                {tSearch("pickupHoursNote", { openTime: "09:30", closeTime: "19:00" })}
              </p>
            </div>
            <a
              href={SITE_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="type-spec shrink-0 text-[var(--blue-600)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-[var(--blue-700)] hover:underline"
              aria-label={tCommon("mapOpenAria")}
            >
              {tCommon("mapViewOnMaps")}
            </a>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label
              className={`${selectionCardClass} ${
                alternatePickupRequested
                  ? selectionCardSelectedClass
                  : selectionCardIdleClass
              }`}
            >
              <input
                type="checkbox"
                className={selectionCheckboxClass}
                {...register("alternatePickupRequested")}
              />
              <span>
                <span className="text-sm font-semibold tracking-[-0.01em] text-[var(--ink-900)]">
                  {tSearch("alternatePickupTitle")}
                </span>
                <span className="mt-1 block text-xs leading-relaxed tabular-nums text-[var(--text-secondary)]">
                  {tSearch("alternatePickupHelp", { fee: singleLegOffSiteQuote.perLegFeeEur })}
                </span>
              </span>
            </label>

            <Controller
              name="differentDropoff"
              control={control}
              render={({ field }) => (
                <label
                  className={`${selectionCardClass} ${
                    field.value ? selectionCardSelectedClass : selectionCardIdleClass
                  }`}
                >
                  <input
                    type="checkbox"
                    className={selectionCheckboxClass}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>
                    <span className="text-sm font-semibold tracking-[-0.01em] text-[var(--ink-900)]">
                      {tSearch("differentDropoffTitle")}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed tabular-nums text-[var(--text-secondary)]">
                      {tSearch("differentDropoffHelp", { fee: singleLegOffSiteQuote.perLegFeeEur })}
                    </span>
                  </span>
                </label>
              )}
            />
          </div>

          {alternatePickupRequested ? (
            <div>
              <label htmlFor="alternate-pickup-address" className={fieldLabelClass}>
                {tSearch("exactPickupLabel")}
              </label>
              <textarea
                id="alternate-pickup-address"
                placeholder={tSearch("addressPlaceholder")}
                className={`${textareaClass} ${
                  errors.alternatePickupAddress ? inputShellErrorClass : ""
                }`}
                {...register("alternatePickupAddress")}
              />
              {errors.alternatePickupAddress ? (
                <p className={fieldErrorClass}>{errors.alternatePickupAddress.message}</p>
              ) : null}
              {alternatePickupAddress?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-[var(--r-card)] border border-[var(--line)] shadow-[var(--elev-1)]">
                  <GoogleMapEmbed query={alternatePickupAddress} className="aspect-[16/9] min-h-[180px] w-full" />
                </div>
              ) : (
                <p className="mt-2 text-xs text-[var(--text-muted)]">{tSearch("mapPreviewHint")}</p>
              )}
            </div>
          ) : null}

          {differentDropoff ? (
            <div>
              <label htmlFor="dropoff-address" className={fieldLabelClass}>
                {tSearch("exactDropoffLabel")}
              </label>
              <textarea
                id="dropoff-address"
                placeholder={tSearch("addressPlaceholder")}
                className={`${textareaClass} ${
                  errors.dropoffAddress ? inputShellErrorClass : ""
                }`}
                {...register("dropoffAddress")}
              />
              {errors.dropoffAddress ? (
                <p className={fieldErrorClass}>{errors.dropoffAddress.message}</p>
              ) : null}
              {dropoffAddress?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-[var(--r-card)] border border-[var(--line)] shadow-[var(--elev-1)]">
                  <GoogleMapEmbed query={dropoffAddress} className="aspect-[16/9] min-h-[180px] w-full" />
                </div>
              ) : (
                <p className="mt-2 text-xs text-[var(--text-muted)]">{tSearch("mapPreviewHint")}</p>
              )}
            </div>
          ) : null}

          {offSiteQuote.selectedLegs > 0 ? (
            <p className="rounded-[var(--r-field)] border border-[var(--orange-200)] bg-[var(--orange-50)] px-3.5 py-2.5 text-xs leading-relaxed tabular-nums text-[var(--orange-950)]">
              {tSearch("offSiteTotalLine", {
                total: offSiteQuote.totalEur,
                legs: offSiteQuote.selectedLegs,
                perLeg: offSiteQuote.perLegFeeEur,
                discount: offSiteDiscountPart,
              })}
            </p>
          ) : null}

          <fieldset className="min-w-0">
            <legend className={fieldLabelClass}>
              {tSearch("vehicleTypeLabel")}
            </legend>
            <Controller
              name="vehicleType"
              control={control}
              render={({ field }) => (
                <div>
                  <input ref={field.ref} type="hidden" name={field.name} value={field.value ?? "all"} readOnly />
                  <div
                    className={segmentGroupClass}
                    role="radiogroup"
                    aria-label={tSearch("vehicleTypeLabel")}
                  >
                    {vehicleTypeCards.map((option) => {
                      const selected = (field.value ?? "all") === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onBlur={field.onBlur}
                          onClick={() => field.onChange(option.value)}
                          className={[
                            segmentClass,
                            selected ? segmentSelectedClass : segmentIdleClass,
                          ].join(" ")}
                        >
                          <span
                            className="relative flex h-9 w-12 shrink-0 items-center justify-center overflow-hidden"
                            aria-hidden
                          >
                            <Image
                              src={option.imageSrc}
                              alt=""
                              width={96}
                              height={64}
                              sizes="96px"
                              className={[
                                "h-8 w-12 object-contain transition-[transform,opacity] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-105",
                                selected ? "opacity-100" : "opacity-80",
                                option.imageClassName ?? "",
                              ].join(" ")}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold tracking-[-0.01em]">
                              {option.label}
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className={[
                              "pointer-events-none absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-[var(--orange-400)]",
                              "transition-opacity duration-[var(--dur-base)] ease-[var(--ease-standard)]",
                              selected ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                          />
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={(field.value ?? "all") === "all"}
                      onBlur={field.onBlur}
                      onClick={() => field.onChange("all")}
                      className={[
                        segmentClass,
                        "max-sm:col-span-2 sm:flex-none sm:px-5",
                        (field.value ?? "all") === "all"
                          ? segmentSelectedClass
                          : segmentIdleClass,
                      ].join(" ")}
                    >
                      <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="text-sm font-semibold capitalize tracking-[-0.01em]">
                        {tSearch("vehicleTypeAll")}
                      </span>
                      <span
                        aria-hidden
                        className={[
                          "pointer-events-none absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-[var(--orange-400)]",
                          "transition-opacity duration-[var(--dur-base)] ease-[var(--ease-standard)]",
                          (field.value ?? "all") === "all" ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </div>
              )}
            />
          </fieldset>

          {brandChoices.length > 0 ? (
            <div className="min-w-0">
              <label htmlFor="booking-search-brand" className={fieldLabelClass}>
                {tSearch("brandLabel")}
              </label>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <div
                    className={`${inputShell} ${
                      isBrandSelectDisabled ? inputShellDisabledClass : ""
                    }`}
                  >
                    <Tag className={fieldIconClass} aria-hidden />
                    {isMounted ? (
                      <Select<BookingOption, false>
                        inputId="booking-search-brand"
                        instanceId="booking-search-brand"
                        aria-label={tSearch("brandAria")}
                        value={optionByValue(brandSelectOptions, field.value ?? "all")}
                        onChange={(option) => field.onChange(option?.value ?? "all")}
                        onBlur={field.onBlur}
                        options={brandSelectOptions}
                        isSearchable={false}
                        isDisabled={isBrandSelectDisabled}
                        styles={vehicleFilterReactSelectStyles}
                        components={brandSelectComponents}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        className="min-w-0 flex-1"
                        classNamePrefix="booking-search-brand"
                      />
                    ) : (
                      <div
                        className="skeleton min-h-[2.5rem] min-w-0 flex-1 rounded-[var(--r-field)]"
                        aria-hidden
                      />
                    )}
                  </div>
                )}
              />
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1.15fr_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0">
              <label className={fieldLabelClass}>{tSearch("tripDatesLabel")}</label>
              <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className={`${inputShell} justify-between ${
                      hasDateError ? inputShellErrorClass : ""
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <CalendarDays className={fieldIconClass} aria-hidden />
                      <span className="truncate text-[0.9375rem] font-semibold tabular-nums">
                        {dateSummary}
                      </span>
                    </span>
                    <span className={changeAffordanceClass}>{tCommon("change")}</span>
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="bottom"
                    sideOffset={8}
                    align="center"
                    collisionPadding={{ top: 72, right: 16, bottom: 16, left: 16 }}
                    className="z-[100] max-h-[var(--radix-popover-content-available-height)] w-max max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-2.5 shadow-[var(--elev-3)] sm:rounded-[var(--r-panel)] sm:p-3 sm:shadow-[var(--elev-4)]"
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
              <p className="mt-1.5 text-xs tabular-nums text-[var(--text-muted)]">
                {tSearch("tripLengthNote", { min: TRIP_MIN_SPAN_DAYS, max: TRIP_MAX_SPAN_DAYS })}
              </p>
              {errors.pickupDate ? (
                <p className={fieldErrorClass}>{errors.pickupDate.message}</p>
              ) : null}
              {errors.dropoffDate ? (
                <p className={fieldErrorClass}>{errors.dropoffDate.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  id="booking-pickup-time-label"
                  className={fieldLabelClass}
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
                  className={fieldLabelClass}
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

        <div className={summaryBandClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[-0.01em] tabular-nums text-[var(--ink-900)]">
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
              <p className="mt-1 text-xs leading-relaxed tabular-nums text-[var(--text-secondary)]">
                {matchedTier
                  ? tSearch("durationDiscountSummary", {
                      days: durationDays,
                      dayLabel: summaryDayLabel,
                      percent: matchedTier.discountPercent,
                    })
                  : tSearch("durationDiscountSummaryMax", { percent: 40 })}
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={submitButtonClass}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  {tSearch("submitSearching")}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 shrink-0" aria-hidden />
                  {tSearch("submitIdle")}
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </form>
  );
}
