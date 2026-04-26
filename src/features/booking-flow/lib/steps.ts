export const BOOKING_FLOW_SECTIONS = [
  "rental",
  "delivery",
  "addons",
  "customer",
  "deposit",
  "consent",
] as const;

export type BookingFlowSectionId = (typeof BOOKING_FLOW_SECTIONS)[number];

export const BOOKING_FLOW_STEPS = [
  {
    id: "rental_details",
    sections: ["rental"],
  },
  {
    id: "options_delivery",
    sections: ["delivery", "addons"],
  },
  {
    id: "your_information",
    sections: ["customer"],
  },
  {
    id: "review_confirm",
    sections: ["deposit", "consent"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  sections: readonly BookingFlowSectionId[];
}>;

export type BookingFlowStepId = (typeof BOOKING_FLOW_STEPS)[number]["id"];
