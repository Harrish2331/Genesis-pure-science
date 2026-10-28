/**
 * Labels for enquiry types, used by the dashboard to display enquiries stored
 * before the website's enquiry form was removed (27 October 2026). Pure: no
 * framework imports.
 */

import type { EnquiryType } from "../content/types.ts";

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  general: "General enquiry",
  product: "Product information",
  distribution: "Distribution / trade",
  partnership: "Business partnership",
  careers: "Careers",
  other: "Other",
};
