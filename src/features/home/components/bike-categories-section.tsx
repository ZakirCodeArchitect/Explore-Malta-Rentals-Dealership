import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { bikeCategories } from "@/features/home/data/home-sections";
import { SectionHeader } from "@/features/home/components/section-header";

const categoryIconStroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 50cc: approachable ride; 125cc: more performance — same badge shell, distinct glyphs */
function CategoryIcon({ variant }: { variant: "50cc" | "125cc" }) {
  const tone =
    variant === "50cc"
      ? "text-[var(--brand-blue)]"
      : "text-[var(--brand-orange)]";

  return (
    <div
      aria-hidden="true"
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] ${tone}`}
    >
      {variant === "50cc" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          {...categoryIconStroke}
        >
          <circle cx="18.5" cy="17.5" r="3.5" />
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="15" cy="5" r="1" />
          <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          {...categoryIconStroke}
        >
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      )}
    </div>
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
                    <CategoryIcon variant={cat.id as "50cc" | "125cc"} />
                  </div>

                  <p className="mt-4 text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>

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

