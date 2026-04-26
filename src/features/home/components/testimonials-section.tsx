import { Container } from "@/components/ui/container";
import { testimonials } from "@/features/home/data/home-sections";
import { getTranslations } from "next-intl/server";

const TRUSTPILOT_GREEN = "#00b67a";

function RatingStars({ rating, ariaLabel }: { rating: number; ariaLabel: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={ariaLabel}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx < rating;
        return (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
          >
            <path
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill={filled ? TRUSTPILOT_GREEN : "rgb(226 232 240)"}
            />
          </svg>
        );
      })}
    </div>
  );
}

function TrustpilotStarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path
        fill={TRUSTPILOT_GREEN}
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  );
}

export async function TestimonialsSection() {
  const t = await getTranslations("Home");
  const tDynamic = t as unknown as (key: string) => string;
  const loop = [...testimonials, ...testimonials];

  return (
    <section
      aria-labelledby="testimonials-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-[var(--surface-elevated)] py-16"
    >
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-orange)]">
              {t("testimonialsKicker")}
            </p>
            <h2
              id="testimonials-title"
              className="mt-4 text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl"
            >
              {t("testimonialsHeadline1")}
              <br />
              {t("testimonialsHeadline2")}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {t("testimonialsDescription")}
            </p>

            <div className="mt-7 inline-flex items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-[var(--surface-card)] px-4 py-2 shadow-[0_18px_50px_-45px_rgba(2,6,23,0.18)]">
                <TrustpilotStarMark className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold text-slate-900">
                  {t("testimonialsTrustLine")}
                </span>
                <span className="text-sm font-semibold text-[var(--brand-orange)]">
                  {t("testimonialsExcellent")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden pb-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white/95 to-transparent sm:w-28"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white/95 to-transparent sm:w-28"
          />
          <div
            className="testimonial-marquee-track flex w-max gap-6"
            role="list"
            aria-label={t("testimonialsMarqueeAria")}
          >
            {loop.map((item, i) => {
              const base = `testimonials.${item.id}`;
              const name = tDynamic(`${base}.name`);
              const date = tDynamic(`${base}.date`);
              const location = tDynamic(`${base}.location`);
              const quote = tDynamic(`${base}.quote`);
              const ariaLabel = t("ratingStarsAria", { rating: item.rating });

              return (
                <div key={`${item.id}-${i}`} className="shrink-0" role="listitem">
                  <article className="w-[340px] sm:w-[420px] shrink-0 rounded-2xl border border-slate-200/90 bg-[var(--surface-card)] p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.18)]">
                    <div className="flex items-start justify-between gap-4">
                      <RatingStars rating={item.rating} ariaLabel={ariaLabel} />
                      <span
                        aria-hidden="true"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-[var(--surface-elevated)]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6 text-slate-600"
                          fill="currentColor"
                        >
                          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                        </svg>
                      </span>
                    </div>

                    <p className="mt-4 text-[0.98rem] leading-7 text-slate-700">
                      {quote}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold tracking-[-0.01em] text-slate-900">
                          {name}
                        </p>
                        <p className="text-sm text-slate-500">{location}</p>
                      </div>
                      <p className="text-sm text-slate-500">{date}</p>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
