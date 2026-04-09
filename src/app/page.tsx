import { VideoHero } from "@/features/home/components/video-hero";
import { BikeCategoriesSection } from "@/features/home/components/bike-categories-section";
import { HighlightedServicesSection } from "@/features/home/components/highlighted-services-section";
import { QuickBookingCtaSection } from "@/features/home/components/quick-booking-cta-section";
import { ContactSection } from "@/features/home/components/contact-section";
import { FaqSection } from "@/features/home/components/faq-section";
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <VideoHero />
      <BikeCategoriesSection />
      <HighlightedServicesSection />
      <FaqSection />
      <QuickBookingCtaSection />
      <ContactSection />
    </main>
  );
}
