import { format } from "date-fns";

import type { Booking } from "@/generated/prisma/client";

import type { BookingConfirmationEmailContent } from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatOptional(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === "") {
    return "—";
  }
  return value.trim();
}

function formatMoneyEur(value: { toString(): string } | number): string {
  const n = typeof value === "number" ? value : Number(value.toString());
  if (Number.isNaN(n)) {
    return "€0.00";
  }
  return new Intl.NumberFormat("en-MT", { style: "currency", currency: "EUR" }).format(n);
}

function formatDateTime(d: Date): string {
  return format(d, "dd MMM yyyy, HH:mm");
}

function vehicleLabel(vehicleType: Booking["vehicleType"]): string {
  switch (vehicleType) {
    case "MOTORBIKE_50CC":
      return "50cc motorbike";
    case "MOTORBIKE_125CC":
      return "125cc motorbike";
    case "BICYCLE":
      return "Bicycle";
    case "ATV":
      return "ATV";
    default:
      return vehicleType;
  }
}

function pickupOptionLabel(option: Booking["pickupOption"]): string {
  return option === "DELIVERY" ? "Delivery to address" : "Pickup at office";
}

function dropoffOptionLabel(option: Booking["dropoffOption"]): string {
  return option === "DROPOFF" ? "Drop-off at address" : "Return at office";
}

function depositMethodLabel(method: Booking["depositMethod"]): string {
  return method === "ONLINE" ? "Online (with this booking)" : "In person at pickup";
}

function cdwLabel(option: Booking["cdwOption"]): string {
  switch (option) {
    case "NO_CDW":
      return "No CDW / reduction package selected";
    case "REDUCE_350_50CC":
      return "Reduced excess — 50cc (€350 excess)";
    case "REDUCE_500_125CC":
      return "Reduced excess — 125cc (€500 excess)";
    case "FULL_COVERAGE_50CC_125CC":
      return "Full CDW coverage (50cc / 125cc)";
    case "REDUCE_800_ATV":
      return "Reduced excess — ATV (€800 excess)";
    default:
      return option;
  }
}

function helmetLine(booking: Booking): string {
  const parts: string[] = [];
  if (booking.helmetSize1) {
    parts.push(`Rider helmet: size ${booking.helmetSize1}`);
  }
  if (booking.helmetSize2) {
    parts.push(`Second helmet: size ${booking.helmetSize2}`);
  }
  if (parts.length === 0) {
    return "Helmets: as agreed with rental terms / office";
  }
  return parts.join(" · ");
}

/**
 * Builds subject, HTML, and plain-text bodies for the customer booking confirmation email.
 */
export function buildBookingConfirmationEmail(booking: Booking): BookingConfirmationEmailContent {
  const subject = `Explore Malta Rentals Booking Confirmation – ${booking.bookingReference}`;

  const customerName = escapeHtml(booking.customerFullName);
  const ref = escapeHtml(booking.bookingReference);
  const vehicle = escapeHtml(vehicleLabel(booking.vehicleType));
  const pickupWhen = formatDateTime(booking.pickupDateTime);
  const returnWhen = formatDateTime(booking.returnDateTime);
  const billableDays = booking.billableDays;
  const hours = booking.actualDurationHours.toString();

  const pickupOpt = escapeHtml(pickupOptionLabel(booking.pickupOption));
  const pickupAddr = escapeHtml(formatOptional(booking.pickupAddress));
  const dropOpt = escapeHtml(dropoffOptionLabel(booking.dropoffOption));
  const dropAddr = escapeHtml(formatOptional(booking.dropoffAddress));

  const cdw = escapeHtml(cdwLabel(booking.cdwOption));
  const addDriver = booking.additionalDriverEnabled ? "Yes" : "No";
  const storage = booking.storageBoxSelected ? "Yes" : "No";
  const helmetText = helmetLine(booking);

  const subtotal = formatMoneyEur(booking.subtotal);
  const totalOnline = formatMoneyEur(booking.totalDueOnline);
  const deposit = formatMoneyEur(booking.depositAmount);
  const depositMethod = escapeHtml(depositMethodLabel(booking.depositMethod));
  const dueLater = formatMoneyEur(booking.totalDueLater);

  const termsNote = booking.termsAccepted
    ? "Your booking is subject to the rental terms you accepted when submitting this request."
    : "Your booking is subject to Explore Malta Rentals rental terms.";

  const textSections = [
    `Hello ${booking.customerFullName},`,
    "",
    "Thank you for choosing Explore Malta Rentals. We have received your booking request and are pleased to confirm the details below.",
    "",
    `BOOKING REFERENCE: ${booking.bookingReference}`,
    "",
    "RENTAL DETAILS",
    `Vehicle: ${vehicleLabel(booking.vehicleType)}`,
    `Pickup: ${pickupWhen}`,
    `Return: ${returnWhen}`,
    `Billable days: ${billableDays} (actual rental duration ≈ ${hours} hours)`,
    "",
    "PICKUP / DROP-OFF",
    `Pickup: ${pickupOptionLabel(booking.pickupOption)}`,
    `Pickup address (if delivery): ${formatOptional(booking.pickupAddress)}`,
    `Drop-off: ${dropoffOptionLabel(booking.dropoffOption)}`,
    `Drop-off address (if applicable): ${formatOptional(booking.dropoffAddress)}`,
    "",
    "ADD-ONS & PROTECTION",
    `CDW: ${cdwLabel(booking.cdwOption)}`,
    `Additional driver: ${addDriver}`,
    `Storage box: ${storage}`,
    `Helmets: ${helmetText}`,
    "",
    "PAYMENT SUMMARY",
    `Rental subtotal: ${subtotal}`,
    `Total amount due online (paid with submission): ${totalOnline}`,
    `Deposit amount: ${deposit}`,
    `Deposit payment method: ${depositMethodLabel(booking.depositMethod)}`,
    `Amount due later (if any): ${dueLater}`,
    "",
    "TERMS",
    termsNote,
    "",
    "—",
    "Explore Malta Rentals",
    "If you need help with your booking, reply to this email or contact us using the details on our website.",
  ];

  const text = textSections.join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>${subject}</title></head>
<body style="font-family: system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1a1a1a;">
  <p>Hello ${customerName},</p>
  <p>Thank you for choosing <strong>Explore Malta Rentals</strong>. We have received your booking request and are pleased to confirm the details below.</p>

  <h2 style="margin: 1.5rem 0 0.5rem; font-size: 1.1rem;">Booking reference</h2>
  <p style="font-size: 1.25rem; font-weight: 700; letter-spacing: 0.02em;">${ref}</p>

  <h2 style="margin: 1.5rem 0 0.5rem; font-size: 1.1rem;">Rental details</h2>
  <ul>
    <li><strong>Vehicle:</strong> ${vehicle}</li>
    <li><strong>Pickup:</strong> ${escapeHtml(pickupWhen)}</li>
    <li><strong>Return:</strong> ${escapeHtml(returnWhen)}</li>
    <li><strong>Billable days:</strong> ${billableDays} <span style="color:#444">(actual duration ≈ ${escapeHtml(hours)} hours)</span></li>
  </ul>

  <h2 style="margin: 1.5rem 0 0.5rem; font-size: 1.1rem;">Pickup / drop-off</h2>
  <ul>
    <li><strong>Pickup option:</strong> ${pickupOpt}</li>
    <li><strong>Pickup address (if delivery):</strong> ${pickupAddr}</li>
    <li><strong>Drop-off option:</strong> ${dropOpt}</li>
    <li><strong>Drop-off address (if applicable):</strong> ${dropAddr}</li>
  </ul>

  <h2 style="margin: 1.5rem 0 0.5rem; font-size: 1.1rem;">Add-ons &amp; protection</h2>
  <ul>
    <li><strong>CDW:</strong> ${cdw}</li>
    <li><strong>Additional driver:</strong> ${addDriver}</li>
    <li><strong>Storage box:</strong> ${storage}</li>
    <li><strong>Helmets:</strong> ${escapeHtml(helmetText)}</li>
  </ul>

  <h2 style="margin: 1.5rem 0 0.5rem; font-size: 1.1rem;">Payment summary</h2>
  <ul>
    <li><strong>Rental subtotal:</strong> ${escapeHtml(subtotal)}</li>
    <li><strong>Total amount due online (with this booking):</strong> ${escapeHtml(totalOnline)}</li>
    <li><strong>Deposit amount:</strong> ${escapeHtml(deposit)}</li>
    <li><strong>Deposit payment method:</strong> ${depositMethod}</li>
    <li><strong>Amount due later (if applicable):</strong> ${escapeHtml(dueLater)}</li>
  </ul>

  <h2 style="margin: 1.5rem 0 0.5rem; font-size: 1.1rem;">Terms reminder</h2>
  <p>${escapeHtml(termsNote)}</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 2rem 0;" />
  <p style="font-size: 0.9rem; color: #555;"><strong>Explore Malta Rentals</strong><br />
  If you need help with your booking, reply to this email or contact us using the details on our website.</p>
</body>
</html>`;

  return { subject, html, text };
}
