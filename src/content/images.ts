/**
 * Every editorial image on the site, in one place.
 *
 * To replace an image: put the new file in public/placeholder and change its
 * file name in `P("…")` — exactly as it appears in the folder — plus its
 * `width` and `height` (the file's pixel size) here. To add one where a
 * section has none yet: replace that slot's `null` with an entry. Nothing in
 * the page layouts needs to change — each section reserves the image's own
 * aspect ratio (no stretching, no layout shift) and, when a slot is `null`,
 * shows its designed placeholder instead.
 *
 * These are illustrative images, not photographs of a Genesis facility.
 */

export type SiteImage = {
  /** URL path under public/, e.g. P("who we are.png"). */
  src: string;
  /** The file's pixel size (keeps the aspect ratio and prevents layout shift). */
  width: number;
  height: number;
  alt: string;
  /**
   * For an image used as a page's opening background (heroes): where the
   * picture's subject is, as a CSS object-position (e.g. "30% 50%"). The
   * image is cropped to fill the hero; this keeps the subject in view.
   * Defaults to the centre.
   */
  focus?: string;
};

/**
 * A file in public/placeholder, by its name exactly as it appears in the
 * folder. Commas are pre-encoded: the image optimiser re-requests the file by
 * its decoded path, and a bare comma there is not found.
 */
const P = (file: string) => `/placeholder/${file.replace(/,/g, "%2C")}`;

export const IMAGES = {
  /**
   * Homepage → "Who we are": the Genesis office reception (the same photo as
   * About Us → "Who we are"), so shown without the "Illustrative image" label.
   * When an introduction video is set in the dashboard, the video is shown instead.
   */
  homeWhoWeAre: {
    src: P("Genesis About Us Reception Banner.png"),
    width: 1013,
    height: 803,
    alt: "The reception of the Genesis Pure Lifesciences office, with the company logo on the feature wall above the reception desk",
  },

  /** About Us → main hero. */
  aboutHero: {
    src: P("Medical Scientist Examining Capsule with Healthcare Infographic.png"),
    width: 1672,
    height: 941,
    alt: "Scientist in gloves and safety glasses examining a capsule in a laboratory, beside icons for gynaecology, hormonal health, fertility, women’s wellness, general medicine and surgicals",
    focus: "26% 50%",
  },

  /** About Us → "Who we are": the Genesis office reception, so shown without the "Illustrative image" label. */
  aboutWhoWeAre: {
    src: P("Genesis About Us Reception Banner.png"),
    width: 1013,
    height: 803,
    alt: "The reception of the Genesis Pure Lifesciences office, with the company logo on the feature wall above the reception desk",
  },

  /** About Us → "Core values". */
  coreValues: {
    src: P("Pharmaceutical Shield and Wellness Icons.png"),
    width: 1672,
    height: 941,
    alt: "A protective shield with a check mark among healthcare icons, beside laboratory glassware and blister packs of tablets",
  },

  /** About Us → "Our commitment to quality". */
  aboutQuality: {
    src: P("commitment to quality.png"),
    width: 1448,
    height: 1086,
    alt: "Scientist in protective gloves, mask and glasses inspecting a vial and a tray of capsules in a pharmaceutical laboratory",
  },

  /**
   * About Us → one image per core-value card, keyed by the value's title in
   * lower case (the values themselves are edited in the dashboard). A value
   * with no entry here shows its card without an image.
   */
  values: {
    quality: { src: P("quality.png"), width: 1055, height: 702, alt: "A scientist in a mask and safety glasses examining a sample under a microscope" },
    integrity: { src: P("integrity.png"), width: 1297, height: 641, alt: "Two scientists reviewing research data together on a laboratory screen" },
    science: { src: P("science.png"), width: 1133, height: 767, alt: "A scientist looking through a microscope at a laboratory bench" },
    care: { src: P("care.png"), width: 875, height: 566, alt: "A pharmacist explaining a prescription medicine to an older customer" },
    growth: { src: P("growth.png"), width: 822, height: 452, alt: "Medicine bottles, vials and capsules in front of a rising bar chart" },
  } as Record<string, SiteImage | null>,

  /**
   * Our Focus → the laboratory scene behind the page heading. Dark artwork:
   * the heading sits over its darker left side in white; the microscope,
   * pipette and beakers show on the right.
   */
  focusHero: {
    src: P("Blue Laboratory Science Background for area of focus.png"),
    width: 1672,
    height: 941,
    alt: "A laboratory bench with a microscope, a pipette releasing a drop into glass beakers, capsules and a DNA helix, in blue light",
    focus: "62% 55%",
  },

  /** Products → hero. */
  productsHero: {
    src: P("Modern Healthcare Products Display.png"),
    width: 1672,
    height: 941,
    alt: "Medicine bottles, blister packs of capsules and tablets, and laboratory glassware on a bright bench",
    focus: "24% 62%",
  },

  /** Manufacturing → hero. Illustrative: not a photograph of a partner's facility. */
  manufacturingHero: {
    src: P("Sterile Pharmaceutical Production Line (1).png"),
    width: 1672,
    height: 941,
    alt: "Technicians in protective clothing inspecting capsules on a pharmaceutical production line",
    focus: "24% 45%",
  },

  /** Insights → hero. */
  insightsHero: {
    src: P("Data-Driven Healthcare Research.png"),
    width: 1671,
    height: 941,
    alt: "A laboratory desk with research reports, charts, glassware and a microscope, beside healthcare icons and a rising graph",
    focus: "34% 50%",
  },

  /** Contact Us → hero. */
  contactHero: {
    src: P("Modern Blue Contact Center Banner.png"),
    width: 1672,
    height: 941,
    alt: "A support team with headsets behind a desk phone and icons for email, phone and location",
    focus: "32% 58%",
  },

  /**
   * The "Contact Genesis" banner at the foot of every main page — cut from
   * the supplied "Premium Biotech Contact Banner.png" (public/placeholder).
   * That file has its words and buttons painted in, so only its artwork is
   * used and the banner's text and buttons stay live: the hand holding the
   * DNA sphere (contactBanner) and the ribbon wave along its foot
   * (contactBannerWave, decorative).
   */
  contactBanner: {
    src: "/images/contact/contact-banner-art.webp",
    width: 784,
    height: 706,
    alt: "A gloved hand holding a clear sphere with a DNA helix inside, above green leaves in a bright laboratory",
    focus: "42% 45%",
  },
  contactBannerWave: {
    src: "/images/contact/contact-banner-wave.webp",
    width: 1108,
    height: 160,
    alt: "",
  },

  /**
   * Our Focus → one medallion per focus area, keyed by the area's id in
   * FOCUS_TILES (src/content/site.ts). Each supplied artwork already carries
   * the area's "Excellence in …" title and caption, so the page shows it whole
   * and keeps the same words as live (screen-reader and search) text.
   */
  focus: {
    gynaecology: { src: P("Gynaecology.png"), width: 470, height: 440, alt: "A doctor taking notes beside a smiling pregnant woman — Excellence in Gynaecology" },
    "hormonal-health": { src: P("Hormonal_Health.png"), width: 460, height: 440, alt: "A doctor explaining a thyroid model to a patient — Excellence in Hormonal Health" },
    fertility: { src: P("Fertility.png"), width: 460, height: 440, alt: "A doctor reviewing results on a tablet with a smiling couple — Excellence in Fertility" },
    "womens-wellness": { src: P("Womens_Wellness.png"), width: 470, height: 455, alt: "A doctor and a woman looking at a tablet together — Excellence in Women’s Wellness" },
    "general-medicine": { src: P("General_Medicine.png"), width: 460, height: 455, alt: "A doctor listening to an older patient’s chest with a stethoscope — Excellence in General Medicine" },
    surgicals: { src: P("Surgicals.png"), width: 460, height: 455, alt: "A surgeon in scrubs operating under theatre lights — Excellence in Surgicals" },
  } as Record<string, SiteImage | null>,
} satisfies Record<string, SiteImage | null | Record<string, SiteImage | null>>;
