import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { contactSection } from "@/features/home/data/home-sections";
import { WhatsAppActionLink } from "@/features/home/components/whatsapp-action-link";

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] py-16"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <SectionHeader
              title={contactSection.title}
              titleId="contact-title"
              description={contactSection.description}
              tone="light"
              align="left"
            />
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.08)]">
              <p className="text-sm font-semibold text-slate-950">
                Typical response time
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Within a short time (usually the same day). If you're unsure
                which vehicle fits your plans, just send your dates and
                preferred pickup time.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)]">
              <p className="text-sm font-semibold text-slate-950">
                Send a WhatsApp message
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We'll help you pick the right ride and answer availability
                questions.
              </p>
              <div className="mt-6">
                <WhatsAppActionLink
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(37,211,102,0.55)] transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Chat on WhatsApp
                </WhatsAppActionLink>
                <p className="mt-3 text-xs text-slate-500">
                  {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
                    ? null
                    : "Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable the WhatsApp button."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

