/**
 * WhatsApp click-to-chat links.
 *
 * This is a plain conversation link (https://wa.me/<number>?text=…). It opens
 * a chat with the business number; it does NOT send anything automatically
 * and must never be described as a notification service. Automated outgoing
 * messages need the WhatsApp Business Platform with Genesis's own credentials,
 * which have not been supplied (see docs/DEPLOYMENT.md).
 */

/** Digits only, 8–15 long (E.164 without the "+"). */
export function normaliseWhatsAppNumber(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.startsWith("0")) return null; // must include the country code
  return digits;
}

/** Pre-filled message for an enquiry about one product (wording supplied by Genesis). */
export function productEnquiryMessage(productName: string): string {
  // Names such as "… Pvt. Ltd." already end the sentence.
  const subject = productName.trim().replace(/\.+$/, "");
  return `Hello Genesis Life Sciences, I would like to enquire about ${subject}. Please share more details.`;
}

export function whatsappUrl(number: string, message?: string): string | null {
  const n = normaliseWhatsAppNumber(number);
  if (!n) return null;
  const text = message?.trim();
  return text
    ? `https://wa.me/${n}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${n}`;
}
