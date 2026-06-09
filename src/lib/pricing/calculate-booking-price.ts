import type { VehicleType } from "@/generated/prisma/client";
import { calculateHotelDiscount } from "@/lib/hotel-codes/calculate-hotel-discount";
import {
  calculateVehicleRentalPricing,
  type DurationPricingRuleDto,
} from "@/lib/pricing/duration-pricing";
import { calculateRentalDuration } from "@/lib/pricing/rental-duration";

export { calculateRentalDuration, type RentalDurationBreakdown } from "@/lib/pricing/rental-duration";

export type PricingVehicleCategory = "motorbike" | "bicycle" | "atv";
export type PricingCdwOption =
  | "no_cdw"
  | "cdw_50cc_reduced_350"
  | "cdw_125cc_reduced_500"
  | "cdw_full_50cc_125cc"
  | "cdw_atv_reduced_800";

type LegacyCdwOption = "none" | "scooter_50" | "scooter_125" | "scooter_full" | "atv_full";

export type BookingPricingInput = Readonly<{
  rental: Readonly<{
    vehicle: Readonly<{
      id?: string;
      slug?: string;
      name?: string;
      type: string;
    }>;
    pickupDate: string;
    returnDate: string;
    pickupTime: string;
    returnTime: string;
  }>;
  delivery: Readonly<{
    pickupOption: "office" | "delivery";
    pickupAddress?: string;
    dropoffOption: "office" | "dropoff";
    dropoffAddress?: string;
  }>;
  addons: Readonly<{
    cdwOption?: PricingCdwOption | LegacyCdwOption | "";
    additionalDriver: boolean;
    storageBox: boolean;
    helmetSize1?: string;
    helmetSize2?: string;
  }>;
  additionalDriver: Readonly<{
    enabled: boolean;
  }>;
  deposit: Readonly<{
    method: "online" | "in_person" | "";
  }>;
  vehiclePricing: Readonly<{
    baseDailyRate: number;
    vehicleType: VehicleType;
    durationRules: readonly DurationPricingRuleDto[];
    supportsStorageBox?: boolean;
  }>;
  hotelDiscount?: Readonly<{
    discountPercent: number;
  }>;
}>;

export type PricingLineItem = Readonly<{
  key: string;
  label: string;
  amount: number;
}>;

export type DeliveryFeeBreakdown = Readonly<{
  deliveryFee: number;
  dropoffFee: number;
  discount: number;
  deliveryTotal: number;
}>;

export type CdwBreakdown = Readonly<{
  selectedOption: PricingCdwOption;
  dailyRate: number;
  total: number;
}>;

export type BookingPriceBreakdown = Readonly<{
  rentalDays: number;
  actualDurationMinutes: number;
  actualDurationHours: number;
  rentalCost: number;
  baseDailyRate: number;
  durationDiscountPercent: number;
  appliedDailyRate: number;
  sundayDaysCharged: number;
  deliveryFee: number;
  dropoffFee: number;
  deliveryDiscount: number;
  deliveryTotal: number;
  cdwCost: number;
  cdwOptionApplied: PricingCdwOption;
  additionalDriverCost: number;
  storageBoxCost: number;
  hotelDiscountPercent: number;
  hotelDiscountAmount: number;
  rentalCostAfterHotelDiscount: number;
  subtotal: number;
  depositAmount: number;
  totalDueOnline: number;
  totalDueLater: number;
  lineItems: readonly PricingLineItem[];
}>;

export const pricingConfig = {
  delivery: {
    perLeg: 20,
    bothLegsDiscount: 10,
  },
  addons: {
    additionalDriverPerDay: 5,
    storageBoxOneTime: 10,
  },
  deposit: {
    amount: 250,
  },
  cdwPerDay: {
    no_cdw: 0,
    cdw_50cc_reduced_350: 3,
    cdw_125cc_reduced_500: 3,
    cdw_full_50cc_125cc: 8,
    cdw_atv_reduced_800: 15,
  } as const,
} as const;

export function normalizeVehicleCategory(type: string): PricingVehicleCategory | null {
  const normalized = type.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized.includes("atv")) {
    return "atv";
  }
  if (normalized.includes("bicycle") || normalized === "bike") {
    return "bicycle";
  }
  if (
    normalized.includes("scooter") ||
    normalized.includes("motorbike") ||
    normalized.includes("motorcycle")
  ) {
    return "motorbike";
  }
  if (normalized.includes("bike")) {
    return "bicycle";
  }
  return null;
}

export function calculateVehicleRentalCost(
  baseDailyRate: number,
  vehicleType: VehicleType,
  rentalDays: number,
  durationRules: readonly DurationPricingRuleDto[],
): {
  rentalCost: number;
  baseDailyRate: number;
  durationDiscountPercent: number;
  appliedDailyRate: number;
  sundayDaysCharged: number;
} {
  const pricing = calculateVehicleRentalPricing(baseDailyRate, vehicleType, rentalDays, durationRules);
  if (!pricing) {
    return {
      rentalCost: 0,
      baseDailyRate: 0,
      durationDiscountPercent: 0,
      appliedDailyRate: 0,
      sundayDaysCharged: 0,
    };
  }

  return {
    rentalCost: pricing.rentalSubtotal,
    baseDailyRate: pricing.baseDailyRate,
    durationDiscountPercent: pricing.durationDiscountPercent,
    appliedDailyRate: pricing.appliedDailyRate,
    sundayDaysCharged: 0,
  };
}

export function calculateDeliveryFees(
  pickupOption: "office" | "delivery",
  dropoffOption: "office" | "dropoff",
): DeliveryFeeBreakdown {
  const deliveryFee = pickupOption === "delivery" ? pricingConfig.delivery.perLeg : 0;
  const dropoffFee = dropoffOption === "dropoff" ? pricingConfig.delivery.perLeg : 0;
  const hasBothLegs = deliveryFee > 0 && dropoffFee > 0;
  const discount = hasBothLegs ? pricingConfig.delivery.bothLegsDiscount : 0;

  return {
    deliveryFee,
    dropoffFee,
    discount,
    deliveryTotal: Math.max(0, deliveryFee + dropoffFee - discount),
  };
}

function normalizeCdwOption(option?: PricingCdwOption | LegacyCdwOption | ""): PricingCdwOption {
  switch (option) {
    case "cdw_50cc_reduced_350":
    case "cdw_125cc_reduced_500":
    case "cdw_full_50cc_125cc":
    case "cdw_atv_reduced_800":
    case "no_cdw":
      return option;
    case "scooter_50":
      return "cdw_50cc_reduced_350";
    case "scooter_125":
      return "cdw_125cc_reduced_500";
    case "scooter_full":
      return "cdw_full_50cc_125cc";
    case "atv_full":
      return "cdw_atv_reduced_800";
    default:
      return "no_cdw";
  }
}

function resolveAllowedCdwOptions(
  vehicleCategory: PricingVehicleCategory,
  vehicleHint: string,
): readonly PricingCdwOption[] {
  if (vehicleCategory === "bicycle") {
    return ["no_cdw"];
  }
  if (vehicleCategory === "atv") {
    return ["no_cdw", "cdw_atv_reduced_800"];
  }

  const hint = vehicleHint.toLowerCase();
  if (hint.includes("50cc")) {
    return ["no_cdw", "cdw_50cc_reduced_350", "cdw_full_50cc_125cc"];
  }
  if (hint.includes("125cc")) {
    return ["no_cdw", "cdw_125cc_reduced_500", "cdw_full_50cc_125cc"];
  }

  return [
    "no_cdw",
    "cdw_50cc_reduced_350",
    "cdw_125cc_reduced_500",
    "cdw_full_50cc_125cc",
  ];
}

export function calculateCdwCost(
  rentalDays: number,
  vehicleCategory: PricingVehicleCategory,
  vehicleHint: string,
  selectedOption?: PricingCdwOption | LegacyCdwOption | "",
): CdwBreakdown {
  const normalizedOption = normalizeCdwOption(selectedOption);
  const allowedOptions = resolveAllowedCdwOptions(vehicleCategory, vehicleHint);
  const safeOption = allowedOptions.includes(normalizedOption) ? normalizedOption : "no_cdw";
  const dailyRate = pricingConfig.cdwPerDay[safeOption];
  return {
    selectedOption: safeOption,
    dailyRate,
    total: dailyRate * rentalDays,
  };
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCdwLabel(option: PricingCdwOption): string {
  switch (option) {
    case "cdw_50cc_reduced_350":
      return "50cc reduced liability (EUR 350)";
    case "cdw_125cc_reduced_500":
      return "125cc reduced liability (EUR 500)";
    case "cdw_full_50cc_125cc":
      return "Full coverage (50cc/125cc)";
    case "cdw_atv_reduced_800":
      return "ATV reduced liability (EUR 800)";
    default:
      return "No CDW";
  }
}

export function calculateBookingPrice(input: BookingPricingInput): BookingPriceBreakdown | null {
  const vehicleCategory = normalizeVehicleCategory(input.rental.vehicle.type);
  if (!vehicleCategory || !input.vehiclePricing) {
    return null;
  }

  const duration = calculateRentalDuration(
    input.rental.pickupDate,
    input.rental.pickupTime,
    input.rental.returnDate,
    input.rental.returnTime,
  );
  if (!duration) {
    return null;
  }

  const rentalPricing = calculateVehicleRentalCost(
    input.vehiclePricing.baseDailyRate,
    input.vehiclePricing.vehicleType,
    duration.billableDays,
    input.vehiclePricing.durationRules,
  );
  if (rentalPricing.rentalCost <= 0) {
    return null;
  }

  const {
    rentalCost,
    baseDailyRate,
    durationDiscountPercent,
    appliedDailyRate,
    sundayDaysCharged,
  } = rentalPricing;
  const deliveryBreakdown = calculateDeliveryFees(
    input.delivery.pickupOption,
    input.delivery.dropoffOption,
  );
  const vehicleHint = [
    input.rental.vehicle.id ?? "",
    input.rental.vehicle.slug ?? "",
    input.rental.vehicle.name ?? "",
  ].join(" ");
  const cdw = calculateCdwCost(
    duration.billableDays,
    vehicleCategory,
    vehicleHint,
    input.addons.cdwOption,
  );

  const additionalDriverEnabled = input.additionalDriver.enabled || input.addons.additionalDriver;
  const additionalDriverCost = additionalDriverEnabled
    ? pricingConfig.addons.additionalDriverPerDay * duration.billableDays
    : 0;
  const storageBoxAvailable = input.vehiclePricing.supportsStorageBox === true;
  const storageBoxCost =
    storageBoxAvailable && input.addons.storageBox ? pricingConfig.addons.storageBoxOneTime : 0;
  const hotelDiscount = input.hotelDiscount
    ? calculateHotelDiscount(rentalCost, input.hotelDiscount.discountPercent)
    : {
        discountPercent: 0,
        discountAmount: 0,
        rentalCostAfterDiscount: rentalCost,
      };
  const subtotal =
    hotelDiscount.rentalCostAfterDiscount +
    deliveryBreakdown.deliveryTotal +
    cdw.total +
    additionalDriverCost +
    storageBoxCost;
  const depositAmount = pricingConfig.deposit.amount;
  const totalDueOnline = subtotal + (input.deposit.method === "online" ? depositAmount : 0);
  const totalDueLater = input.deposit.method === "in_person" ? depositAmount : 0;

  const lineItems: PricingLineItem[] = [
    { key: "rental_cost", label: "Rental Cost", amount: rentalCost },
    ...(hotelDiscount.discountAmount > 0
      ? [
          {
            key: "hotel_discount",
            label: "Hotel Discount",
            amount: -hotelDiscount.discountAmount,
          },
        ]
      : []),
    { key: "delivery_dropoff", label: "Delivery / Drop-off", amount: deliveryBreakdown.deliveryTotal },
    { key: "cdw", label: "CDW", amount: cdw.total },
    { key: "additional_driver", label: "Additional Driver", amount: additionalDriverCost },
    { key: "storage_box", label: "Storage Box", amount: storageBoxCost },
  ];

  return {
    rentalDays: duration.billableDays,
    actualDurationMinutes: duration.actualDurationMinutes,
    actualDurationHours: duration.actualDurationHours,
    rentalCost,
    baseDailyRate,
    durationDiscountPercent,
    appliedDailyRate,
    sundayDaysCharged,
    deliveryFee: deliveryBreakdown.deliveryFee,
    dropoffFee: deliveryBreakdown.dropoffFee,
    deliveryDiscount: deliveryBreakdown.discount,
    deliveryTotal: deliveryBreakdown.deliveryTotal,
    cdwCost: cdw.total,
    cdwOptionApplied: cdw.selectedOption,
    additionalDriverCost,
    storageBoxCost,
    hotelDiscountPercent: hotelDiscount.discountPercent,
    hotelDiscountAmount: hotelDiscount.discountAmount,
    rentalCostAfterHotelDiscount: hotelDiscount.rentalCostAfterDiscount,
    subtotal,
    depositAmount,
    totalDueOnline,
    totalDueLater,
    lineItems,
  };
}
