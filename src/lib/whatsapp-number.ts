/** Digits only, suitable for https://wa.me/{digits} */
export function toWhatsAppDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function getWhatsAppChatUrl(
  digits: string,
  message: string,
): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
