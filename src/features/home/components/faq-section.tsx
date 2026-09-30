"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { faqItems } from "@/features/home/data/faq-content";

function FaqIcon() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--r-field)] bg-[var(--surface-inverse)] text-white shadow-[var(--elev-3)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    </div>
  );
}

export function FaqSection() {
  const t = useTranslations("Faq");
  const tDynamic = t as unknown as (key: string) => string;
  const tWhatsApp = useTranslations("WhatsApp");
  const baseId = useId();
  const firstId = faqItems[0]?.id ?? "0";
  const [openId, setOpenId] = useState<string | null>(firstId);

  return (
    <section
      id="faq"
      aria-labelledby={`${baseId}-faq-heading`}
      className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-band)] py-20 sm:py-24 lg:py-32"
    >
      <Container className="relative">
        <Reveal as="div" y={22} className="mx-auto max-w-3xl text-center">
          <FaqIcon />
          <h2
            id={`${baseId}-faq-heading`}
            className="type-h2 mt-7 text-ink-900"
          >
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[length:var(--text-lead)] leading-[1.62] text-ink-600">
            {t("subtitleLead")}
            <span className="font-semibold text-ink-800">
              {tWhatsApp("faqLabel")}
            </span>
            {t("subtitleTail")}
          </p>
        </Reveal>

        <Reveal as="div" delay={0.06} y={24} className="mx-auto mt-14 max-w-3xl">
          <ul className="surface-panel list-none overflow-hidden p-0">
            {faqItems.map((item, index) => {
              const isOpen = openId === item.id;
              const panelId = `${baseId}-panel-${item.id}`;
              const buttonId = `${baseId}-trigger-${item.id}`;
              const isLast = index === faqItems.length - 1;
              const question = tDynamic(`items.${item.id}.question`);
              const answer = tDynamic(`items.${item.id}.answer`);

              return (
                <li
                  key={item.id}
                  className={
                    isLast ? undefined : "border-b border-[var(--line-subtle)]"
                  }
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className={`group flex w-full items-start justify-between gap-5 px-5 py-5 text-left transition-colors duration-[var(--dur-base)] ease-[var(--ease-standard)] hover:bg-[color-mix(in_srgb,var(--ink-500)_5%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--blue-500)] sm:px-7 sm:py-6 ${
                      isOpen
                        ? "bg-[color-mix(in_srgb,var(--ink-500)_4%,transparent)]"
                        : ""
                    }`}
                    onClick={() =>
                      setOpenId((prev) => (prev === item.id ? null : item.id))
                    }
                  >
                    <span className="text-[1.0625rem] font-semibold leading-[1.4] tracking-[-0.015em] text-ink-900">
                      {question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-ink-500 shadow-[inset_0_0_0_1px_var(--line)] transition-[transform,color,background-color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:text-ink-800 motion-reduce:transition-none ${
                        isOpen
                          ? "rotate-180 bg-[var(--surface-inverse)] text-white shadow-none group-hover:text-white"
                          : "rotate-0 bg-[var(--surface-card)]"
                      }`}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>

                  {/* `0fr` → `1fr` grid transition: cheaper and smoother than height animation. */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isOpen}
                    className={`grid transition-[grid-template-rows,opacity] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] motion-reduce:transition-none ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6 text-left text-[0.9375rem] leading-[1.7] text-ink-600 sm:px-7 sm:pb-7 sm:text-base">
                        {answer}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
