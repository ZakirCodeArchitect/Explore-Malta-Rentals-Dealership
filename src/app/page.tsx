import { VideoHero } from "@/features/home/components/video-hero";
import { BikeCategoriesSection } from "@/features/home/components/bike-categories-section";
import { AboutBusinessSection } from "@/features/home/components/about-business-section";
import { TestimonialsSection } from "@/features/home/components/testimonials-section";
import { HighlightedServicesSection } from "@/features/home/components/highlighted-services-section";
import { QuickBookingCtaSection } from "@/features/home/components/quick-booking-cta-section";
import { FaqSection } from "@/features/home/components/faq-section";
import { ContactSection } from "@/features/home/components/contact-section";
import { WhatsAppFloatingButton } from "@/features/home/components/whatsapp-floating-button";

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <VideoHero />
        <BikeCategoriesSection />
        <AboutBusinessSection />
        <TestimonialsSection />
        <HighlightedServicesSection />
        <QuickBookingCtaSection />
        <FaqSection />
        <ContactSection />
      </main>
      <WhatsAppFloatingButton />
    </>
  );
}
