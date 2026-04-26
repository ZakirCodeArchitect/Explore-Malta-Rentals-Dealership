import type { Metadata } from "next";
import { ContactSection } from "@/features/home/components/contact-section";
import { SITE_META } from "@/lib/site-brand-copy";

export const metadata: Metadata = {
  title: `Contact | ${SITE_META.title}`,
  description: SITE_META.description,
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col bg-[var(--background)] pb-8 pt-[var(--site-header-offset)]">
      <ContactSection />
    </main>
  );
}
