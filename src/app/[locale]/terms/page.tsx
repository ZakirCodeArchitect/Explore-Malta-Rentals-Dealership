import type { Metadata } from "next";
import { TermsPageContent } from "./terms-page-content";

export const metadata: Metadata = {
  title: "Terms & Conditions | Explore Malta Rentals",
  description:
    "Read the full rental terms and conditions for Explore Malta Rentals, including insurance, deposits, driver requirements, cancellation policy, and liability rules.",
};

export default function TermsPage() {
  return <TermsPageContent />;
}
