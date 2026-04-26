import type { Metadata } from "next";

import { getEnvValue } from "@/components/footer/footer-utils";
import { GuideContent } from "@/features/guide/components/guide-content";
import { SITE_CONTACT, SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "Explore Malta guide with location map, attraction map, and practical scooter parking rules.",
};

export default function GuidePage() {
  const location = getEnvValue("location") ?? SITE_GOOGLE_MAPS_URL;
  const address = getEnvValue("address") ?? SITE_CONTACT.address;

  return (
    <main className="flex flex-1 flex-col">
      <GuideContent location={location.replace(/^\"|\"$/g, "")} address={address} />
    </main>
  );
}
