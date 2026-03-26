import { Container } from "@/components/ui/container";
import { VideoHero } from "@/features/home/components/video-hero";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <VideoHero />
      <div id="booking-preview" className="sr-only" />
      <div id="fleet-preview" className="sr-only" />

      <section
        id="services"
        aria-labelledby="services-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-white py-16"
      >
        <Container>
          <h2
            id="services-title"
            className="text-center text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]"
          >
            Services
          </h2>
        </Container>
      </section>

      <section
        id="about"
        aria-labelledby="about-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[var(--surface-soft)] py-16"
      >
        <Container>
          <h2
            id="about-title"
            className="text-center text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]"
          >
            About us
          </h2>
        </Container>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-white py-16"
      >
        <Container>
          <h2
            id="contact-title"
            className="text-center text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]"
          >
            Contact us
          </h2>
        </Container>
      </section>
    </main>
  );
}
