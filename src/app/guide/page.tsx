import type { Metadata } from "next";

import { getEnvValue } from "@/components/footer/footer-utils";
import { GuideContent } from "@/features/guide/components/guide-content";
import { Footer } from "@/features/home/components/footer";
import { WhatsAppFloatingButton } from "@/features/home/components/whatsapp-floating-button";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "Explore Malta guide with location map, attraction map, and practical scooter parking rules.",
};

export default function GuidePage() {
  const location = getEnvValue("location") ?? "Pieta, Malta";
  const address = getEnvValue("address") ?? "Pieta, Malta";

  return (
    <>
      <main className="flex flex-1 flex-col">
        <GuideContent location={location.replace(/^\"|\"$/g, "")} address={address} />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
}
