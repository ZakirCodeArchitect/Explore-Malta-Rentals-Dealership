"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function FooterNewsletterForm() {
  const t = useTranslations("Footer");
  const id = useId();
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      noValidate
    >
      <label htmlFor={id} className="sr-only">
        {t("newsletterSrOnly")}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t("newsletterPlaceholder")}
          required
          suppressHydrationWarning
          className={joinClasses(
            "min-h-11 w-full flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2 text-sm text-white placeholder:text-white/35",
            "transition-[border-color,background-color,box-shadow] duration-200",
            "focus-visible:border-[var(--brand-orange)]/60 focus-visible:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]/40",
          )}
        />
        <button
          type="submit"
          className={joinClasses(
            "inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-semibold tracking-[-0.02em] text-slate-950 transition-all duration-200",
            "bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-strong)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]",
          )}
        >
          {t("newsletterSubmit")}
        </button>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {submitted ? t("newsletterSuccess") : ""}
      </p>
      {submitted ? (
        <p className="mt-2 text-xs text-[var(--brand-orange)]" role="status">
          {t("newsletterSuccessLong")}
        </p>
      ) : (
        <p className="mt-2 text-xs text-white/45">{t("newsletterFinePrint")}</p>
      )}
    </form>
  );
}
