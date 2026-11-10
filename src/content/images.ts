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
};

/**
 * A file in public/placeholder, by its name exactly as it appears in the
 * folder. Commas are pre-encoded: the image optimiser re-requests the file by
 * its decoded path, and a bare comma there is not found.
 */
const P = (file: string) => `/placeholder/${file.replace(/,/g, "%2C")}`;

export const IMAGES = {
  /** Homepage → "Who we are". When an introduction video is set in the dashboard, the video is shown instead. */
  homeWhoWeAre: {
    src: P("who we are.png"),
    width: 1536,
    height: 1024,
    alt: "Pharmaceutical laboratory bench with capsules, glassware and a microscope, beside a DNA helix and icons for medicine, women’s health and care",
  },

  /** About Us → main hero. */
  aboutHero: {
    src: P("Genesis About Us Reception Banner.png"),
    width: 1013,
    height: 803,
    alt: "Reception area with the Genesis Pure Lifesciences logo on a feature wall above a modern reception desk",
  },

  /** About Us → "Who we are". */
  aboutWhoWeAre: {
    src: P("Medical Scientist Examining Capsule with Healthcare Infographic.png"),
    width: 1672,
    height: 941,
    alt: "Scientist in gloves and safety glasses examining a capsule in a laboratory, beside icons for gynaecology, hormonal health, fertility, women’s wellness, general medicine and surgicals",
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

  /** Contact Us → hero. */
  contactHero: {
    src: P("Trusted Care, Healthier Tomorrow.png"),
    width: 1672,
    height: 941,
    alt: "Trusted care for a healthier tomorrow — a scientist holding a capsule in a laboratory, with icons for high efficacy, better tolerance, proven quality and healthcare partnership",
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
