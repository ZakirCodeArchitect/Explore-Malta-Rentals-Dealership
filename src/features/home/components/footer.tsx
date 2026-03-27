import Image from "next/image";
import { Container } from "@/components/ui/container";

function normalizeUrl(value?: string) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function getEnvValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function Footer() {
  const companyName = getEnvValue("CompanyName", "businessName") ?? "Explore Malta Rentals";
  const logoSrc = "/explore%20malta%20rentals%20logo.png";
  const phone = getEnvValue("whatsapp_number", "NEXT_PUBLIC_WHATSAPP_NUMBER");
  const email = getEnvValue("email");
  const address = getEnvValue("address");
  const facebook = normalizeUrl(getEnvValue("facebook"));
  const instagram = normalizeUrl(getEnvValue("Instagram"));
  const tikTok = normalizeUrl(getEnvValue("TikTok"));
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--brand-blue-strong)] bg-[var(--brand-blue)] py-12 text-slate-100">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2">
          <div>
            <Image
              src={logoSrc}
              alt={companyName}
              width={320}
              height={56}
              className="h-[2.8rem] w-auto max-w-full rounded-[6px] object-contain object-left"
            />
            <p className="mt-3 text-sm leading-6 text-slate-100/90">
              Reliable bike and scooter rentals in Malta with quick support and easy booking.
            </p>
            <div className="mt-4 flex items-center gap-4">
              {facebook ? (
                <a
                  className="text-slate-100/85 transition-colors hover:text-white"
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.927V15.56H7.078V12.07h3.047V9.413c0-3.021 1.792-4.69 4.534-4.69 1.313 0 2.686.236 2.686.236v2.967h-1.514c-1.49 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.098 24 12.073Z" />
                  </svg>
                </a>
              ) : null}
              {instagram ? (
                <a
                  className="text-slate-100/85 transition-colors hover:text-white"
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                  </svg>
                </a>
              ) : null}
              {tikTok ? (
                <a
                  className="text-slate-100/85 transition-colors hover:text-white"
                  href={tikTok}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  title="TikTok"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14 3h3.2a4.8 4.8 0 0 0 3.8 3.7V10a8 8 0 0 1-4-1.1v6.5a6.4 6.4 0 1 1-5.4-6.3V12a3.4 3.4 0 1 0 2.4 3.2V3Z" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:justify-self-end">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-100/80">
              Contact and Location
            </p>
            <div className="mt-4 space-y-2 text-sm">
              {phone ? (
                <a className="block hover:text-white" href={`https://wa.me/${phone.replace(/[^\d+]/g, "")}`}>
                  WhatsApp: {phone}
                </a>
              ) : null}
              {email ? (
                <a className="block hover:text-white" href={`mailto:${email}`}>
                  {email}
                </a>
              ) : null}
              {address ? <p className="leading-6 text-slate-100/90">{address}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-xs text-slate-100/75">
          <p>
            © {currentYear} {companyName}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
