import type { Metadata } from "next";

import { getEnvValue } from "@/components/footer/footer-utils";
import { TourContent } from "@/features/tours/components/tour-content";

export const metadata: Metadata = {
  title: "Tours",
  description:
    "Custom and guided Malta tours — motorbike, quad, and bicycle. Flexible itineraries, local experts, and tour requests via Explore Malta Rentals.",
};

export default function ToursPage() {
  const companyName =
    getEnvValue("CompanyName", "NEXT_PUBLIC_SITE_NAME", "businessName") ?? "Explore Malta Rentals";

  const contact = { companyName };

  return (
    <main className="flex flex-1 flex-col">
      <TourContent contact={contact} />
    </main>
  );
}
