"use client";

import { useId, useState } from "react";
import { Container } from "@/components/ui/container";
import { WhatsAppIcon } from "@/features/home/components/whatsapp-action-link";
import { faqIntro, faqItems } from "@/features/home/data/faq-content";

function FaqIcon() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.45)]"
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
  const baseId = useId();
  const firstId = faqItems[0]?.id ?? "0";
  const [openId, setOpenId] = useState<string | null>(firstId);

  return (
    <section
      id="faq"
      aria-labelledby={`${baseId}-faq-heading`}
      className="scroll-mt-28 border-t border-slate-200/70 bg-white py-16 sm:py-20"
    >
      <div className="relative">
        {/* Dotted grid fades into solid white */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-56 sm:h-64"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgb(226 232 240) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
          }}
        />

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <FaqIcon />
            <h2
              id={`${baseId}-faq-heading`}
              className="mt-6 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl"
            >
              {faqIntro.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
              {faqIntro.subtitleLead}
              <span className="inline-flex items-center gap-1.5 align-middle font-medium text-slate-800">
                <WhatsAppIcon className="h-[1.1em] w-[1.1em] shrink-0 text-[#25D366]" />
                WhatsApp
              </span>
              {faqIntro.subtitleTail}
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <ul className="flex flex-col">
              {faqItems.map((item, index) => {
                const isOpen = openId === item.id;
                const panelId = `${baseId}-panel-${item.id}`;
                const buttonId = `${baseId}-trigger-${item.id}`;
                const isLast = index === faqItems.length - 1;

                return (
                  <li
                    key={item.id}
                    className={
                      isLast
                        ? undefined
                        : "border-b border-slate-200/90 pb-1"
                    }
                  >
                    {isOpen ? (
                      <div className="rounded-xl bg-[#f1f5f9] px-5 py-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-[box-shadow,background-color] duration-200 ease-out hover:bg-slate-100 hover:shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)] sm:px-6 sm:py-6">
                        <button
                          id={buttonId}
                          type="button"
                          aria-expanded
                          aria-controls={panelId}
                          className="group flex w-full items-start justify-between gap-4 rounded-lg text-left transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f5f9]"
                          onClick={() =>
                            setOpenId((prev) =>
                              prev === item.id ? null : item.id,
                            )
                          }
                        >
                          <span className="text-base font-semibold text-slate-950 sm:text-[1.05rem]">
                            {item.question}
                          </span>
                          <span
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-lg font-light leading-none text-slate-500 transition-colors duration-200 group-hover:text-slate-700"
                          >
                            -
                          </span>
                        </button>
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className="mt-4 text-left text-sm leading-7 text-slate-600 sm:text-base"
                        >
                          {item.answer}
                        </div>
                      </div>
                    ) : (
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={false}
                        aria-controls={panelId}
                        className="group flex w-full items-start justify-between gap-4 rounded-xl px-3 py-5 text-left transition-[background-color,box-shadow,color] duration-200 ease-out hover:bg-slate-50 hover:shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-4 sm:py-6"
                        onClick={() => setOpenId(item.id)}
                      >
                        <span className="text-base font-semibold text-slate-950 transition-colors duration-200 group-hover:text-slate-900 sm:text-[1.05rem]">
                          {item.question}
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-lg font-light leading-none text-slate-500 transition-colors duration-200 group-hover:text-slate-700"
                        >
                          +
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </div>
    </section>
  );
}
