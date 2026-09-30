import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { IndicativeDailyRatesCard } from "@/components/pricing/indicative-daily-rates-card";
import { Container } from "@/components/ui/container";
import { BookingFlow } from "@/features/booking-flow/components/booking-flow";
import { Link } from "@/i18n/navigation";

type BookingPageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    vehicle?: string;
    date?: string;
    returnDate?: string;
    pickupDate?: string;
    dropoffDate?: string;
    pickupTime?: string;
    dropoffTime?: string;
    returnTime?: string;
    color?: string;
    ref?: string;
    email?: string;
    submitted?: string;
  }>;
}>;

export async function generateMetadata({ params }: Pick<BookingPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("bookingTitle");
  const description = t("bookingDescription");
  return {
    title,
    description,
    openGraph: { title, description, locale },
  };
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "BookingPage" });
  const {
    vehicle,
    date,
    returnDate,
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    returnTime,
    color,
    ref,
    email,
    submitted,
  } = await searchParams;
  const resolvedPickupDate = date ?? pickupDate;
  const resolvedReturnDate = returnDate ?? dropoffDate;
  const bookingLookupReference = typeof ref === "string" && ref.trim().length > 0 ? ref.trim() : undefined;
  const bookingLookupEmail = typeof email === "string" && email.trim().length > 0 ? email.trim() : undefined;
  const bookedVehicleLabel =
    typeof vehicle === "string" && vehicle.trim().length > 0 ? vehicle.trim() : undefined;
  const bookingSubmittedBanner = submitted === "1" || submitted === "true";

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="booking-heading"
        className="relative isolate scroll-mt-28 overflow-hidden border-b border-[var(--line-subtle)] bg-[var(--surface-band)] pt-[calc(var(--site-header-offset)+3rem)] pb-20 sm:pt-[calc(var(--site-header-offset)+4rem)] sm:pb-24 lg:pb-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-blue-50 via-[var(--surface-band)] to-transparent"
        />

        <Container className="relative z-10">
          <div className="mx-auto w-full max-w-5xl">
            <header className="text-center sm:text-left">
              <h1 id="booking-heading" className="type-h1 text-[var(--text-primary)]">
                {t("heading")}
              </h1>
              <p className="type-lead mx-auto mt-4 max-w-3xl sm:mx-0">{t("intro")}</p>
            </header>

            <div className="mt-10 sm:mt-12">
              <BookingFlow
                initialVehicleSlug={vehicle}
                initialRental={{
                  pickupDate: resolvedPickupDate,
                  returnDate: resolvedReturnDate,
                  pickupTime,
                  returnTime: returnTime ?? dropoffTime,
                  selectedColor: typeof color === "string" ? color : undefined,
                }}
                bookingLookupReference={bookingLookupReference}
                bookingLookupEmail={bookingLookupEmail}
                bookingSubmittedBanner={bookingSubmittedBanner}
                bookedVehicleLabel={bookedVehicleLabel}
              />
            </div>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="booking-indicative-rates-heading"
        className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-card)] py-20 sm:py-24 lg:py-32"
      >
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2
              id="booking-indicative-rates-heading"
              className="type-h2 text-[var(--text-primary)]"
            >
              {t("ratesHeading")}
            </h2>
            <p className="type-lead mt-3 max-w-2xl">{t("ratesDescription")}</p>
            <div className="mt-10 w-full">
              <IndicativeDailyRatesCard />
            </div>
            <p className="mt-10 text-center text-sm text-[var(--text-secondary)] sm:text-left">
              {t("ratesLinkLead")}{" "}
              <Link
                href="/#services"
                className="font-semibold text-[var(--text-primary)] underline decoration-orange-400/45 underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-orange-600 hover:decoration-orange-400"
              >
                {t("ratesLink")}
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
