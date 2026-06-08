import { roundPricingAmount } from "@/lib/pricing/duration-pricing";

export type HotelDiscountBreakdown = Readonly<{
  discountPercent: number;
  discountAmount: number;
  rentalCostAfterDiscount: number;
}>;

export function calculateHotelDiscount(
  rentalSubtotal: number,
  discountPercent: number,
): HotelDiscountBreakdown {
  const safePercent = Math.max(0, Math.min(100, discountPercent));
  const discountAmount = roundPricingAmount(rentalSubtotal * (safePercent / 100));
  const rentalCostAfterDiscount = roundPricingAmount(rentalSubtotal - discountAmount);

  return {
    discountPercent: safePercent,
    discountAmount,
    rentalCostAfterDiscount,
  };
}
