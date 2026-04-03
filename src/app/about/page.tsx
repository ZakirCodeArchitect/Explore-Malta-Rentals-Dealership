import type { Metadata } from "next";

import { AboutContent } from "@/features/about/components/about-content";
import { getEnvValue } from "@/components/footer/footer-utils";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Learn about Explore Malta Rentals — motorcycle, ATV, and bicycle hire from Pietà, guided tours, fleet and licensing info, and how to get in touch.",
};

export default function AboutPage() {
  const companyName =
    getEnvValue("CompanyName", "NEXT_PUBLIC_SITE_NAME", "businessName") ?? "Explore Malta Rentals";

  const contact = { companyName };

  return (
    <main className="flex flex-1 flex-col">
      <AboutContent contact={contact} />
    </main>
  );
}
