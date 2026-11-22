import type { Insight, Notice, Settings } from "@/lib/content/types";

/**
 * Initial content, used until an administrator saves a collection for the
 * first time. After that the stored document is the source of truth and this
 * file is only a fallback for a fresh, empty store.
 *
 * NOTHING HERE IS INVENTED AS FACT.
 *
 *   · Company facts that Genesis has not confirmed are empty, or carry
 *     `confirmed: false` when a candidate value exists in client artwork (it
 *     then shows only in review mode). See docs/CONTENT-REVIEW.md.
 *   · Copy marked `approved: false` is neutral draft wording that makes no
 *     factual claim; it is flagged in review mode until Genesis approves or
 *     replaces it in the dashboard.
 *   · Records with `placeholder: true` are development samples. They never
 *     render on a production deployment and never enter the sitemap.
 */

const SEEDED_AT = "2026-10-19T00:00:00.000Z";

const draft = (text: string) => ({ text, approved: false });
const unknown = () => ({ value: "", confirmed: false });
/** Supplied by Genesis Pure Lifesciences on 23 October 2026. */
const supplied = (value: string) => ({ value, confirmed: true });

export const seedSettings: Settings = {
  brand: {
    name: "Genesis Pure Lifesciences",
    legalName: unknown(),
    tagline: supplied("Excellence In Every Molecule"),
  },
  copy: {
    heroEyebrow: draft("Genesis Pure Lifesciences"),
    heroHeadline: draft("Pharmaceutical care for women’s health and general medicine."),
    heroIntro: draft(
      "Genesis Pure Lifesciences is a pharmaceutical company focused on women’s health and general medicine — working with manufacturing partners to make quality products available to healthcare professionals and the people they care for.",
    ),
    footerIntro: draft("A pharmaceutical company focused on women’s health and general medicine."),
    aboutIntro: draft(
      "Genesis Pure Lifesciences brings together pharmaceutical science, dependable partnerships and a commitment to quality across women’s health and general medicine.",
    ),
    whoWeAre: draft(
      "Genesis Pure Lifesciences is a pharmaceutical company built around two areas of focus: women’s health and general medicine. We work with manufacturing partners and healthcare professionals to make dependable products available where they are needed — and we present every product with clear, accurate information.",
    ),
    vision: draft(
      "To be a trusted name in pharmaceutical care — recognised for quality, integrity and products that make a real difference to everyday health.",
    ),
    mission: draft(
      "To make reliable pharmaceutical and surgical products accessible by working with qualified partners, upholding high standards of quality and supporting healthcare professionals with accurate, responsible information.",
    ),
    qualityCommitment: draft(
      "Quality is central to how Genesis works — in the partners we choose, the products we offer and the information we share. Details of the standards and certifications that apply to each product will be published here once they are confirmed.",
    ),
    scienceFocus: draft(
      "Our work sits where pharmaceutical science, healthcare practice and patient wellbeing meet. Two areas of focus — women’s health and general medicine — shape the products we offer and the partners we work with.",
    ),
    womensHealth: draft(
      "Products that support women’s healthcare needs, presented with accurate information for healthcare professionals.",
    ),
    generalMedicine: draft(
      "A general pharmaceutical range for everyday healthcare needs. The range is growing, and new products are added as they are approved.",
    ),
    surgicals: draft(
      "Surgical products for clinical and hospital settings, presented with clear product information.",
    ),
    manufacturingIntro: draft(
      "Genesis Pure Lifesciences works with manufacturing partners to bring its products to market. Each partnership is built on shared expectations of quality, transparency and reliability.",
    ),
    axonIntro: draft(
      "Axon Surgicals is dedicated to surgical products for clinical and hospital settings. Contact our team for information about the surgical range.",
    ),
    contactIntro: draft(
      "Whether you are a healthcare professional, distributor, partner or supplier, our team is here to help. Send us an enquiry and we will respond as soon as we can.",
    ),
  },
  values: {
    approved: false,
    items: [
      { title: "Quality", text: "We treat quality as a responsibility at every step — from the partners we choose to the product in hand." },
      { title: "Integrity", text: "We communicate accurately and responsibly about every product we offer." },
      { title: "Science", text: "We value evidence and expertise, and let them guide our decisions." },
      { title: "Care", text: "Behind every product is a patient, and a healthcare professional who relies on it." },
      { title: "Growth", text: "Like the sprout in our emblem, we are committed to steady, sustainable growth." },
    ],
  },
  axon: {
    relationship: unknown(),
    website: unknown(),
  },
  contact: {
    customerServicePhone: supplied("+91 8148494549"),
    // Supplied as info@gensislifesciences.in. That domain does not exist
    // (DNS checked 23 Oct 2026), so it would bounce; the address on the
    // registered genesislifesciences.in domain is used. Confirm with Genesis.
    email: supplied("info@genesislifesciences.in"),
    // Supplied by Genesis on 25 October 2026 as 8148494549 (India): +91 8148494549.
    whatsapp: supplied("918148494549"),
    whatsappMessage: "Hello Genesis Life Sciences, I would like to enquire about your pharmaceutical products and services. Please share more details.",
    // Exactly as supplied. Verify against the GST registration certificate.
    gstin: supplied("33TPUP56465D1ZV"),
    hours: unknown(),
    offices: [
      {
        id: "corporate",
        label: "Corporate Office",
        // Exactly as printed on the Genesis business-card artwork
        // (Genesis_Card_FRONT_preview_trimmed_600dpi.png). Unconfirmed:
        // review mode only until Genesis confirms it in the dashboard.
        lines: ["Unit No-4, 3rd Floor,", "G' Block, BK Complex,", "Inspire Main Road,", "Mumbai - 400051."],
        mapsUrl: "",
        confirmed: false,
      },
    ],
    departments: [
      {
        id: "general",
        label: "General Enquiries",
        emails: ["info@genesislifesciences.in", "genesispurelifesciences@gmail.com"],
        confirmed: true,
      },
      { id: "sales", label: "Sales & Business Development", emails: ["sales@genesislifesciences.in"], confirmed: true },
      { id: "corporate", label: "Corporate Enquiries", emails: ["arun.s@genesislifesciences.in"], confirmed: true },
    ],
  },
  social: {
    linkedin: unknown(),
    instagram: unknown(),
    facebook: unknown(),
    x: unknown(),
    youtube: unknown(),
  },
  intro: { videoUrl: "", poster: null },
  updatedAt: SEEDED_AT,
};

/* ── Manufacturing partners — names and order as supplied by Genesis ──── */

export { seedPartners } from "./partners";

/* ── Products ─────────────────────────────────────────────────────────── */

// The product catalogue is its own structured dataset: src/content/products.ts.
export { seedProducts } from "./products";

/* ── Insights ─────────────────────────────────────────────────────────── */

/** A cover image supplied in public/insights. */
const insightCover = (file: string, width: number, height: number) => ({
  url: `/insights/${file}`,
  key: `insights/${file}`,
  width,
  height,
  contentType: "image/png",
});

export const seedInsights: Insight[] = [
  /* ── Published articles ─────────────────────────────────────────────── */
  {
    id: "insight-biocon-pertuzumab-ec-approval",
    slug: "biocon-pertuzumab-biosimilar-european-commission-approval",
    title: "Biocon Secures European Commission Approval for Pertuzumab Biosimilar, Strengthening Its Global Oncology Portfolio",
    excerpt:
      "Biocon receives European Commission marketing authorisation for Pebrilzo®, its pertuzumab biosimilar, expanding treatment options for patients with HER2-positive breast cancer. The approval marks an important milestone under the European Medicines Agency's new tailored clinical approach to biosimilar development.",
    body: [
      "Biocon Limited has announced that the European Commission (EC) has granted marketing authorisation for Pebrilzo®, its pertuzumab biosimilar, for the treatment of HER2-positive breast cancer across multiple disease stages in the European Union.",
      "Announced on November 18, 2026, the approval makes Biocon's pertuzumab the first biosimilar to receive European Commission authorisation under the European Medicines Agency's new tailored clinical approach.",
      "Pertuzumab is a monoclonal antibody that targets the human epidermal growth factor receptor 2 (HER2), which is associated with the growth of certain breast cancer cells. The biosimilar is approved for use in combination with other cancer treatments, including trastuzumab and chemotherapy, for eligible patients with HER2-positive breast cancer.",
      "The approval follows the product's recent US FDA approval and further strengthens Biocon's oncology portfolio. According to the company, pertuzumab becomes its fifth oncology biosimilar approved in both Europe and the United States.",
      "This development highlights the growing role of biosimilars in improving access to advanced cancer treatments. It also demonstrates the importance of evolving regulatory pathways in supporting biosimilar development and expanding treatment availability across global healthcare markets.",
      "**Source:** Biocon Limited – Official Press Release (18 November 2026)",
    ].join("\n\n"),
    coverImage: insightCover("Screenshot 2026-11-19 082918.png", 952, 747),
    coverAlt: "The Biocon Biopharmaceuticals building, with landscaped lawns and young trees in front",
    category: "Industry news",
    author: "Genesis Pure Lifesciences",
    featured: true,
    status: "published",
    publishedAt: "2026-11-20T06:02:00.000Z",
    seoTitle: "",
    metaDescription: "",
    placeholder: false,
    reviewNote: "",
    createdAt: "2026-11-20T06:02:00.000Z",
    updatedAt: "2026-11-20T06:02:00.000Z",
  },
  {
    id: "insight-oppi-faster-approvals-data-exclusivity",
    slug: "pharma-multinationals-seek-faster-approvals-data-exclusivity-india",
    title: "Pharma Multinationals Seek Faster Drug Approval Processes and Six-Year Data Exclusivity in India",
    excerpt:
      "The Organisation of Pharmaceutical Producers of India (OPPI) has approached CDSCO seeking time-bound regulatory reviews for new drug applications and clinical trials. The proposal also includes a possible six-year regulatory data exclusivity period, sparking discussion about innovation, generic competition and medicine affordability in India.",
    body: [
      "Pharmaceutical multinational companies are pushing for faster and more predictable drug approval processes in India. The Organisation of Pharmaceutical Producers of India (OPPI) has submitted formal representations to the Central Drugs Standard Control Organisation (CDSCO), proposing changes to the country's regulatory approval framework.",
      "One of the major recommendations is to reduce the review period for Phase I clinical trial applications involving globally developed drugs from the existing 90 days to 30 days, bringing the process closer to the US FDA's review timeline.",
      "OPPI has also proposed introducing regulatory data exclusivity to protect clinical and regulatory data submitted by innovative pharmaceutical companies. Although the initial proposal reportedly considered a ten-year period, the organisation may revise its demand to six years, similar to the protection period recently introduced in China.",
      "The proposal has generated debate within the Indian pharmaceutical industry. Supporters argue that stronger data protection and faster regulatory reviews could encourage research investments, clinical trials and the development of innovative medicines.",
      "However, domestic pharmaceutical companies and patient groups have raised concerns that data exclusivity could delay generic competition and potentially affect the affordability of medicines.",
      "The discussion represents an important policy issue for India's pharmaceutical sector, which has a strong generic medicine manufacturing base while also seeking to expand its research and innovation capabilities.",
      "Any regulatory changes will require further consultation and consideration by the relevant authorities.",
      "**Source:** ETPharma – Economic Times (19 November 2026)",
    ].join("\n\n"),
    coverImage: insightCover("Screenshot 2026-11-19 082934.png", 1332, 747),
    coverAlt: "The Central Drugs Standard Control Organization (CDSCO) building, with its name in English and Hindi above the entrance",
    category: "Industry news",
    author: "Genesis Pure Lifesciences",
    featured: false,
    status: "published",
    publishedAt: "2026-11-20T06:01:00.000Z",
    seoTitle: "",
    metaDescription: "",
    placeholder: false,
    reviewNote: "",
    createdAt: "2026-11-20T06:01:00.000Z",
    updatedAt: "2026-11-20T06:01:00.000Z",
  },
  {
    id: "insight-fda-neladalkib-accelerated-approval",
    slug: "us-fda-accelerated-approval-neladalkib-alk-positive-lung-cancer",
    title: "US FDA Grants Accelerated Approval to Neladalkib for Previously Treated ALK-Positive Lung Cancer",
    excerpt:
      "The US Food and Drug Administration has granted accelerated approval to neladalkib, marketed as Nelkarmi, for certain adults with previously treated advanced ALK-positive non-small cell lung cancer. The approval introduces another targeted treatment option for patients whose disease has progressed following earlier therapies.",
    body: [
      "The United States Food and Drug Administration (US FDA) has granted accelerated approval to neladalkib, marketed under the brand name Nelkarmi, for adults with locally advanced or metastatic anaplastic lymphoma kinase (ALK)-positive non-small cell lung cancer (NSCLC).",
      "The approval was announced on November 17, 2026. The medicine is intended for eligible patients whose cancer has progressed after treatment with specific ALK tyrosine kinase inhibitors (TKIs), with the precise eligibility depending on their previous treatment history.",
      "Neladalkib is an oral kinase inhibitor designed to target ALK-driven cancer activity. Its approval was supported by results from the ALKOVE-1 clinical trial, which evaluated the drug in previously treated patients.",
      "In the trial, the confirmed overall response rate was 49% among patients who had received one prior ALK inhibitor, alectinib, and 32% among patients who had received two or more prior ALK inhibitors and platinum-based chemotherapy.",
      "The FDA's accelerated approval provides an additional treatment option for patients with advanced ALK-positive lung cancer, particularly those whose disease has progressed following earlier targeted therapies.",
      "The development also reflects continued progress in precision oncology, where targeted medicines are designed to address specific molecular changes associated with cancer.",
      "Nelkarmi is part of GSK's oncology portfolio following its acquisition of Nuvalent, completed in July 2026.",
      "**Source:** US FDA – Cancer Drug Approvals (17 November 2026)",
    ].join("\n\n"),
    coverImage: insightCover("Screenshot 2026-11-19 082948.png", 1302, 748),
    coverAlt: "Scientists in lab coats, masks and safety glasses working with samples at a laboratory bench",
    category: "Industry news",
    author: "Genesis Pure Lifesciences",
    featured: false,
    status: "published",
    publishedAt: "2026-11-20T06:00:00.000Z",
    seoTitle: "",
    metaDescription: "",
    placeholder: false,
    reviewNote: "",
    createdAt: "2026-11-20T06:00:00.000Z",
    updatedAt: "2026-11-20T06:00:00.000Z",
  },

  /* ── Development placeholders (hidden on the site) ───────────────────── */
  {
    id: "sample-insight-1",
    slug: "sample-article-layout",
    title: "Sample article: how Insights articles will look",
    excerpt:
      "Development placeholder. This article demonstrates the Insights layout and is hidden on production deployments.",
    body: [
      "This is a **development placeholder**. It shows how an Insights article is laid out — headings, paragraphs, lists and quotations — so the design can be reviewed before Genesis supplies approved articles.",
      "## Writing an article",
      "Articles are written in the dashboard under **Admin → Insights**. The editor accepts a simple formatting syntax:",
      "- `## Heading` and `### Sub-heading`",
      "- `**bold**` and `*italic*`",
      "- `[link text](https://example.com)`",
      "- lists that start with `-` or `1.`",
      "## Publishing",
      "An article can be saved as a draft, previewed, scheduled with a future publication date, published and unpublished at any time.",
      "> Replace or delete this sample before launch.",
    ].join("\n\n"),
    coverImage: null,
    coverAlt: "",
    category: "Company updates",
    author: "Genesis Pure Lifesciences",
    featured: true,
    status: "published",
    publishedAt: SEEDED_AT,
    seoTitle: "",
    metaDescription: "",
    placeholder: true,
    reviewNote: "Development placeholder.",
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "sample-insight-2",
    slug: "sample-article-second",
    title: "Sample article: a second layout example",
    excerpt: "Development placeholder used to preview the article grid and related-article navigation.",
    body: "This is a **development placeholder** used to preview the Insights grid and related-article navigation. It is hidden on production deployments.",
    coverImage: null,
    coverAlt: "",
    category: "Health awareness",
    author: "Genesis Pure Lifesciences",
    featured: false,
    status: "published",
    publishedAt: "2026-10-12T00:00:00.000Z",
    seoTitle: "",
    metaDescription: "",
    placeholder: true,
    reviewNote: "Development placeholder.",
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
];

/* ── Notices ──────────────────────────────────────────────────────────── */

export const seedNotices: Notice[] = [
  {
    id: "sample-notice-1",
    slug: "sample-notice-layout",
    title: "Sample notice: product announcement layout",
    kind: "product-launch",
    summary:
      "Development placeholder. Notices announce new products, coming-soon items and company updates. This sample is hidden on production deployments.",
    image: null,
    imageAlt: "",
    productSlug: "d-vits-60k",
    insightSlug: "",
    linkUrl: "",
    linkLabel: "",
    pinned: true,
    status: "published",
    publishedAt: SEEDED_AT,
    placeholder: true,
    reviewNote: "Development placeholder.",
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "sample-notice-2",
    slug: "sample-notice-coming-soon",
    title: "Sample notice: coming soon",
    kind: "coming-soon",
    summary: "Development placeholder showing a coming-soon notice. Hidden on production deployments.",
    image: null,
    imageAlt: "",
    productSlug: "",
    insightSlug: "sample-article-layout",
    linkUrl: "",
    linkLabel: "",
    pinned: false,
    status: "published",
    publishedAt: "2026-10-10T00:00:00.000Z",
    placeholder: true,
    reviewNote: "Development placeholder.",
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
];
