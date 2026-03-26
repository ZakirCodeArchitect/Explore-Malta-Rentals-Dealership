import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { bikeCategories } from "@/features/home/data/home-sections";
import { SectionHeader } from "@/features/home/components/section-header";

function BikeIcon({ variant }: { variant: "50cc" | "125cc" }) {
  const accent =
    variant === "50cc" ? "rgba(58,124,165,0.9)" : "rgba(255,169,57,0.95)";

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="h-10 w-10"
    >
      <defs>
        <linearGradient id={`g-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="1" />
          <stop offset="1" stopColor="rgba(255,169,57,0.25)" />
        </linearGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="26"
        fill={`url(#g-${variant})`}
        opacity="0.22"
      />
      <path
        d="M22 42c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm20 0c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M31 20h10l-4 10h-8l2-10Zm-9 12 7-12m4 12-8 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 32l8 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BikeCategoriesSection() {
  return (
    <section
      id="fleet-preview"
      aria-labelledby="bike-categories-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-white py-0"
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,124,165,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,169,57,0.08),transparent_45%)]"
        />

        <Container className="relative z-10 py-6 sm:py-8">
          <SectionHeader
            titleId="bike-categories-title"
            title="Choose your ride"
            description={
              <>
                Pick the right engine size for your Malta plan - then we'll help you
                book confidently.
              </>
            }
            tone="light"
          />

          <div className="mt-6 grid gap-5 sm:mt-8 md:grid-cols-2">
            {bikeCategories.map((cat) => (
              <div
                key={cat.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)] transition-shadow hover:shadow-[0_22px_55px_-30px_rgba(2,6,23,0.16)]"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div
                    aria-hidden="true"
                    className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(58,124,165,0.12),transparent_60%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,169,57,0.12),transparent_60%)]"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.12em] text-[var(--brand-blue)]">
                        {cat.id.toUpperCase()}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                        {cat.title}
                      </h3>
                    </div>
                    <div className="text-slate-900">
                      <BikeIcon variant={cat.id as "50cc" | "125cc"} />
                    </div>
                  </div>

                  <p className="mt-3 text-slate-600">{cat.description}</p>

                  <ul className="mt-4 space-y-2">
                    {cat.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                          <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-[var(--brand-orange)]"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 0 1 .006 1.415l-8.2 8.4a1 1 0 0 1-1.42-.006l-3.4-3.5a1 1 0 1 1 1.426-1.4l2.69 2.76 7.49-7.67a1 1 0 0 1 1.412-.002Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <ButtonLink
                      href="#booking-preview"
                      className="min-w-[10.5rem] focus-visible:ring-offset-white"
                    >
                      Book {cat.id}
                    </ButtonLink>
                    <ButtonLink
                      href="#services"
                      variant="secondary"
                      className="min-w-[10.5rem] border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-offset-white"
                    >
                      See benefits
                    </ButtonLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}

