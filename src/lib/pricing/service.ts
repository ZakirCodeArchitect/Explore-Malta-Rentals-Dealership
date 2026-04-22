export type OffSiteServiceInput = Readonly<{
  pickupOffSite: boolean;
  dropoffOffSite: boolean;
}>;

export type OffSiteServiceQuote = Readonly<{
  selectedLegs: number;
  perLegFeeEur: number;
  subtotalBeforeDiscountEur: number;
  discountEur: number;
  totalEur: number;
  hasBundleDiscount: boolean;
}>;

type PricingRules = Readonly<{
  offSiteService: Readonly<{
    perLegFeeEur: number;
    bothLegsDiscountEur: number;
  }>;
}>;

const PRICING_RULES: PricingRules = {
  offSiteService: {
    perLegFeeEur: 20,
    bothLegsDiscountEur: 10,
  },
};

function countSelectedLegs(input: OffSiteServiceInput) {
  return (input.pickupOffSite ? 1 : 0) + (input.dropoffOffSite ? 1 : 0);
}

function getOffSiteServiceDiscountEur(selectedLegs: number) {
  if (selectedLegs < 2) {
    return 0;
  }

  return PRICING_RULES.offSiteService.bothLegsDiscountEur;
}

export function quoteOffSiteService(input: OffSiteServiceInput): OffSiteServiceQuote {
  const selectedLegs = countSelectedLegs(input);
  const perLegFeeEur = PRICING_RULES.offSiteService.perLegFeeEur;
  const subtotalBeforeDiscountEur = selectedLegs * perLegFeeEur;
  const discountEur = Math.min(getOffSiteServiceDiscountEur(selectedLegs), subtotalBeforeDiscountEur);
  const totalEur = subtotalBeforeDiscountEur - discountEur;

  return {
    selectedLegs,
    perLegFeeEur,
    subtotalBeforeDiscountEur,
    discountEur,
    totalEur,
    hasBundleDiscount: discountEur > 0,
  };
}

export const pricingService = {
  quoteOffSiteService,
};
