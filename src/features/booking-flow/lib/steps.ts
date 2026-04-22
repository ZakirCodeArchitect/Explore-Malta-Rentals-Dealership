export const BOOKING_FLOW_SECTIONS = [
  "select_vehicle",
  "rental_dates",
  "pricing",
  "pickup_dropoff",
  "addons",
  "security_deposit",
  "customer_details",
  "booking_summary",
  "terms_conditions",
] as const;

export type BookingFlowSectionId = (typeof BOOKING_FLOW_SECTIONS)[number];

export const BOOKING_FLOW_STEPS = [
  {
    id: "rental_details",
    title: "Rental Details",
    sections: ["select_vehicle", "rental_dates", "pricing"],
  },
  {
    id: "options_delivery",
    title: "Options & Delivery",
    sections: ["pickup_dropoff", "addons"],
  },
  {
    id: "your_information",
    title: "Your Information",
    sections: ["customer_details"],
  },
  {
    id: "review_confirm",
    title: "Review & Confirm",
    sections: ["booking_summary", "terms_conditions"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  sections: readonly BookingFlowSectionId[];
}>;

export type BookingFlowStepId = (typeof BOOKING_FLOW_STEPS)[number]["id"];
