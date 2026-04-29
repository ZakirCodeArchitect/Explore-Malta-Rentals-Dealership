"use client";

import { useState } from "react";

import { WhatsAppActionLink } from "@/features/home/components/whatsapp-action-link";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string }
  | { status: "fallback"; message: string };

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20";

export function TourRequestForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setState({ status: "error", message: "Please fill in your name, email, and message." });
      return;
    }

    setState({ status: "submitting" });

    try {
      const res = await fetch("/api/tour-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, message }),
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string };

      if (res.ok && data.ok) {
        setState({ status: "success" });
        form.reset();
        return;
      }

      if (res.status === 503 && data.code === "EMAIL_NOT_CONFIGURED") {
        setState({
          status: "fallback",
          message:
            "Online tour requests are not enabled on this server yet. Please reach us on WhatsApp or by email and we will get back to you.",
        });
        return;
      }

      setState({
        status: "error",
        message: "Something went wrong sending your message. Please try again or use WhatsApp.",
      });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection or use WhatsApp below.",
      });
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)] sm:p-8">
      <h3 className="text-lg font-bold tracking-tight text-slate-950">Request a tour</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Share your dates, group size, and what you would like to see. We will reply with options and
        pricing.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="tour-name" className="text-sm font-semibold text-slate-800">
            Name <span className="text-[var(--brand-orange)]">*</span>
          </label>
          <input
            id="tour-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="tour-email" className="text-sm font-semibold text-slate-800">
            Email <span className="text-[var(--brand-orange)]">*</span>
          </label>
          <input
            id="tour-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            suppressHydrationWarning
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="tour-phone" className="text-sm font-semibold text-slate-800">
            Phone <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="tour-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="tour-message" className="text-sm font-semibold text-slate-800">
            Your request <span className="text-[var(--brand-orange)]">*</span>
          </label>
          <textarea
            id="tour-message"
            name="message"
            required
            rows={5}
            maxLength={8000}
            placeholder="Dates, preferred tour type, group size, special requests…"
            className={`${inputClass} min-h-[7.5rem] resize-y`}
          />
        </div>

        {state.status === "success" ? (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-sm text-emerald-900"
            role="status"
          >
            Thank you — your message was sent. We will get back to you shortly.
          </p>
        ) : null}

        {state.status === "error" ? (
          <p className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2.5 text-sm text-red-900">
            {state.message}
          </p>
        ) : null}

        {state.status === "fallback" ? (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3 text-sm text-amber-950">
            <p>{state.message}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={state.status === "submitting"}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-orange)] px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-12px_rgba(255,147,15,0.85)] transition-colors hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {state.status === "submitting" ? "Sending…" : "Send request"}
          </button>
          <span className="text-xs text-slate-500">or</span>
          <WhatsAppActionLink
            message="Hi! I'm interested in a custom Malta tour. Can you share options and availability?"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2"
          >
            Message on WhatsApp
          </WhatsAppActionLink>
        </div>
      </form>
    </div>
  );
}
