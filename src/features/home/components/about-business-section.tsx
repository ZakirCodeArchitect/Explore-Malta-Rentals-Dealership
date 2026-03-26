import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { aboutBusiness } from "@/features/home/data/home-sections";

function HighlightCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.1)]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold tracking-[0.08em] text-[var(--brand-orange)]">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-soft)]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 text-[var(--brand-blue)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
          </svg>
        </span>
      </div>
      <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-slate-950">
        {value}
      </p>
    </div>
  );
}

export function AboutBusinessSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-business-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] pt-10 pb-14 sm:pt-12 sm:pb-16"
    >
      <Container>
        <SectionHeader
          titleId="about-business-title"
          title={aboutBusiness.title}
          tone="light"
          description={
            <span className="block">
              Explore Malta the easy way: choose the right ride, get clear
              guidance, and start your adventure.
            </span>
          }
          align="center"
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.1)]">
              {aboutBusiness.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "text-base leading-8 text-slate-800"
                      : "mt-4 text-base leading-8 text-slate-700"
                  }
                >
                  {p}
                </p>
              ))}
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[var(--brand-orange)]"
                  />
                  Tourist-friendly
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[var(--brand-blue)]"
                  />
                  Safety-first
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {aboutBusiness.highlights.map((h) => (
                <HighlightCard
                  key={h.label}
                  label={h.label}
                  value={h.value}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

