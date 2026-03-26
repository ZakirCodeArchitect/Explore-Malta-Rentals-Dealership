import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { quickBookingCta } from "@/features/home/data/home-sections";
import { SectionHeader } from "@/features/home/components/section-header";

export function QuickBookingCtaSection() {
  return (
    <section
      aria-labelledby="quick-booking-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] py-16"
    >
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)] sm:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,169,57,0.1),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(58,124,165,0.1),transparent_50%)]"
          />
          <div className="relative">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6">
                <SectionHeader
                  kicker="Quick call-to-action"
                  title={quickBookingCta.title}
                  description={quickBookingCta.description}
                  tone="light"
                  align="left"
                />
              </div>

              <div className="lg:col-span-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <ButtonLink
                    href={quickBookingCta.primaryCta.href}
                    className="w-full focus-visible:ring-offset-white sm:w-auto"
                  >
                    {quickBookingCta.primaryCta.label}
                  </ButtonLink>
                  <ButtonLink
                    href={quickBookingCta.secondaryCta.href}
                    variant="secondary"
                    className="w-full border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-offset-white sm:w-auto"
                  >
                    {quickBookingCta.secondaryCta.label}
                  </ButtonLink>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Prefer WhatsApp? Use the chat button anytime while you scroll.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

