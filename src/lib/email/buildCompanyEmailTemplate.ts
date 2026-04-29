import { LOGO_PATH, SITE_CONTACT, SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";

type CompanyEmailTemplateInput = {
  subject: string;
  previewText?: string;
  htmlBody: string;
  textBody: string;
};

const FALLBACK_SITE_URL = "https://exploremaltarentals.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return FALLBACK_SITE_URL;
}

/**
 * Wraps an email body with a shared branded layout and company footer.
 * Use this in all outgoing customer-facing emails for consistency.
 */
export function buildCompanyEmailTemplate({
  subject,
  previewText,
  htmlBody,
  textBody,
}: CompanyEmailTemplateInput): { html: string; text: string } {
  const safePreviewText = escapeHtml(previewText ?? "Explore Malta Rentals booking update");
  const logoUrl = `${resolveSiteUrl()}${LOGO_PATH}`;
  const mapsUrl = SITE_GOOGLE_MAPS_URL;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;color:#1f2937;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fa;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eef2f7;">
              <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${safePreviewText}</span>
              <img src="${escapeHtml(logoUrl)}" alt="Explore Malta Rentals" width="180" style="display:block;max-width:180px;width:100%;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 8px 24px;">
              ${htmlBody}
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px 24px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 18px;" />
              <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#111827;">Explore Malta Rentals</p>
              <p style="margin:0 0 8px 0;font-size:13px;color:#4b5563;">${escapeHtml(SITE_CONTACT.address)}</p>
              <p style="margin:0 0 10px 0;font-size:13px;color:#4b5563;">
                <a href="${escapeHtml(mapsUrl)}" style="color:#0f766e;text-decoration:none;">View location on Google Maps</a>
              </p>
              <p style="margin:0;font-size:13px;color:#4b5563;">
                <a href="mailto:${escapeHtml(SITE_CONTACT.email)}" style="color:#0f766e;text-decoration:none;">${escapeHtml(SITE_CONTACT.email)}</a>
                &nbsp;|&nbsp;
                <a href="tel:${escapeHtml(SITE_CONTACT.phone)}" style="color:#0f766e;text-decoration:none;">${escapeHtml(SITE_CONTACT.phone)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textFooter = [
    "",
    "----------------------------------------",
    "Explore Malta Rentals",
    SITE_CONTACT.address,
    `Google Maps: ${mapsUrl}`,
    `Email: ${SITE_CONTACT.email}`,
    `Phone: ${SITE_CONTACT.phone}`,
  ].join("\n");

  return {
    html,
    text: `${textBody.trimEnd()}${textFooter}\n`,
  };
}
