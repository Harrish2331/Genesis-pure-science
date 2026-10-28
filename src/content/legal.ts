/**
 * Privacy Policy and Terms and Conditions.
 *
 * DRAFTS FOR LEGAL REVIEW. They describe how this website actually behaves
 * (what the enquiry form collects, where it is stored, which cookie exists)
 * and otherwise stay generic. Genesis Pure Lifesciences must have them
 * reviewed — and add the registered entity name, address and grievance
 * contact — before launch. Review mode marks both pages as drafts.
 */

export type LegalDoc = {
  slug: "privacy-policy" | "terms" | "disclaimer";
  title: string;
  description: string;
  updated: string;
  body: string;
};

export const privacyPolicy: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  description: "How Genesis Pure Lifesciences handles information submitted through this website.",
  updated: "2026-10-19",
  body: `
This policy explains how Genesis Pure Lifesciences ("Genesis", "we") handles personal information collected through this website.

## Information we collect

**Enquiries.** When you submit the enquiry form we collect the details you provide: your name, email address, and optionally your telephone number, organisation, the product you are asking about and your message.

**Technical information.** Like most websites, our hosting provider processes technical data such as IP addresses and browser information to deliver pages securely. We use the connecting IP address briefly to prevent abuse of the enquiry form.

We do not use advertising or analytics cookies. The only cookie this website sets is a security cookie used when an authorised administrator signs in to manage content.

## How we use your information

We use enquiry details only to respond to your enquiry and to keep a record of our correspondence. We do not sell your information or use it for unrelated marketing.

## Storage and security

Enquiries are stored securely by our website hosting and storage providers and are accessible only to authorised Genesis staff. If email notification is enabled, a copy of your enquiry is sent to our team's inbox.

## Medical information

Please do not include patient details or other medical information in the enquiry form. Information on this website is not medical advice.

## Your choices

You may ask us to access, correct or delete the personal information you have submitted by contacting us through the details on our [Contact](/contact) page.

## Changes to this policy

We may update this policy from time to time. The date at the top of the page shows when it was last revised.
`.trim(),
};

export const terms: LegalDoc = {
  slug: "terms",
  title: "Terms and Conditions",
  description: "Terms governing the use of the Genesis Pure Lifesciences website.",
  updated: "2026-10-19",
  body: `
These terms apply to your use of this website. By using the website you agree to them.

## Information only

The content of this website is provided for general information about Genesis Pure Lifesciences and its products. It is not medical advice and must not be used as a substitute for advice from a qualified healthcare professional. Prescription medicines must be used only as prescribed by a registered medical practitioner.

## Product information

We aim to keep product information accurate and current, but product details, availability and packaging may change. Please contact us to confirm current information before making decisions based on it.

## Healthcare professional information

Some pages contain information intended only for registered medical practitioners and healthcare or trade professionals. By choosing to view those pages you confirm that you belong to one of those groups.

## Intellectual property

The Genesis Pure Lifesciences name, logo and the content of this website are the property of Genesis Pure Lifesciences or its licensors. Other names and logos shown belong to their respective owners. You may not reproduce them without permission.

## Links to other websites

Links to third-party websites are provided for convenience. We are not responsible for their content or practices.

## Liability

To the extent permitted by law, Genesis Pure Lifesciences is not liable for any loss arising from the use of this website or reliance on its content.

## Changes

We may revise these terms at any time. Continued use of the website after a change means you accept the revised terms.

## Contact

Questions about these terms can be sent through our [Contact](/contact) page.
`.trim(),
};

export const disclaimer: LegalDoc = {
  slug: "disclaimer",
  title: "Disclaimer",
  description: "How information on the Genesis Pure Lifesciences website should and should not be used.",
  updated: "2026-10-24",
  body: `
## Not medical advice

Information on this website is provided for general information about Genesis Pure Lifesciences and its products. It is not medical advice and is not a substitute for advice, diagnosis or treatment from a qualified healthcare professional.

## Prescription medicines

Information about prescription medicines is intended for registered medical practitioners and healthcare or trade professionals, and is provided for reference only. It is not an advertisement. Prescription medicines must be used only as prescribed by a registered medical practitioner.

## Product information

Product details on this website are taken from the product packs and approved product information. Packaging, artwork and availability may change; pack images are shown for identification. Always refer to the label and leaflet supplied with the product.

## Partner and third-party information

Names and logos of manufacturing partners and other organisations belong to their respective owners and are shown for identification.

## Contact

Questions about this disclaimer can be sent through our [Contact](/contact) page.
`.trim(),
};
