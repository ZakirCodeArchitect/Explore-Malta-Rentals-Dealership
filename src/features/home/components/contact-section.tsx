import { GoogleMapEmbed } from "@/components/google-map-embed";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { WhatsAppActionLink } from "@/features/home/components/whatsapp-action-link";
import { getEnvValue } from "@/components/footer/footer-utils";
import { SITE_CONTACT, SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";
import { getTranslations } from "next-intl/server";

export async function ContactSection() {
  const t = await getTranslations("Contact");
  const tCommon = await getTranslations("Common");
  const tWhatsApp = await getTranslations("WhatsApp");

  const phoneRaw =
    getEnvValue("phone", "NEXT_PUBLIC_PHONE", "telephone") ?? SITE_CONTACT.phone;
  const address = getEnvValue("address") ?? SITE_CONTACT.address;
  const email = getEnvValue("email") ?? SITE_CONTACT.email;
  const telHref = `tel:${phoneRaw.replace(/[^\d+]/g, "")}`;
  const mailHref = `mailto:${email}`;

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-[var(--surface-soft)] py-16"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionHeader
              title={t("title")}
              titleId="contact-title"
              description={t("description")}
              tone="light"
              align="left"
            />
            <div className="mt-8 rounded-2xl border border-slate-200/90 bg-[var(--surface-card)] p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.08)]">
              <p className="text-sm font-semibold text-slate-950">{tCommon("responseTimeTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tCommon("responseTimeBody")}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-[var(--surface-card)] p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {tCommon("mobile")}
              </p>
              <a
                href={telHref}
                className="mt-2 block text-2xl font-bold tracking-tight text-slate-950 transition-colors hover:text-[var(--brand-orange-strong)] sm:text-3xl"
              >
                {phoneRaw}
              </a>
              <p className="mt-2 text-sm text-slate-600">{tCommon("tapToCall")}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-[var(--surface-card)] px-6 py-4 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {tCommon("email")}
              </p>
              <a
                href={mailHref}
                className="mt-2 block text-base font-semibold text-slate-900 underline decoration-[var(--brand-orange)]/45 underline-offset-4 transition-colors hover:text-[var(--brand-orange-strong)] hover:decoration-[var(--brand-orange)]"
              >
                {email}
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-[var(--surface-card)] px-6 py-4 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {tCommon("address")}
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">{address}</p>
              <a
                href={SITE_GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-slate-900 underline decoration-[var(--brand-orange)]/45 underline-offset-4 transition-colors hover:text-[var(--brand-orange-strong)] hover:decoration-[var(--brand-orange)]"
              >
                {tCommon("openInMaps")}
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-[var(--surface-card)] shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)]">
              <p className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {tCommon("location")}
              </p>
              <GoogleMapEmbed
                className="aspect-[16/10] min-h-[240px] w-full sm:aspect-[21/9] sm:min-h-[280px]"
                query={address}
              />
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-[var(--surface-card)] p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)]">
              <p className="text-sm font-semibold text-slate-950">{t("whatsappTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("whatsappBody")}</p>
              <div className="mt-6">
                <WhatsAppActionLink
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(37,211,102,0.55)] transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {tWhatsApp("floatingLabel")}
                </WhatsAppActionLink>
                <p className="mt-3 text-xs text-slate-500">
                  {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? null : t("envWhatsappHint")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
