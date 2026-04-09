import type { Metadata } from "next";

import { AboutContent } from "@/features/about/components/about-content";
import { getEnvValue } from "@/components/footer/footer-utils";
import { SITE_META } from "@/lib/site-brand-copy";

export const metadata: Metadata = {
  title: "About us",
  description: SITE_META.description,
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
