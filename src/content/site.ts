import type { Availability, NoticeKind, ProductCategory, SubcategoryId } from "@/lib/content/types";

/**
 * Structural site configuration: navigation, category labels and the static
 * pages that search can return. Business facts are NOT kept here — those are
 * settings, edited in the dashboard.
 */

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Focus", href: "/our-focus" },
  { label: "Products", href: "/products" },
  { label: "Manufacturing", href: "/manufacturing" },
  { label: "Axon Surgicals", href: "/axon-surgicals" },
  { label: "Notices", href: "/notices" },
  { label: "Insights", href: "/insights" },
  { label: "Contact Us", href: "/contact" },
] as const;

export type CategoryMeta = {
  id: ProductCategory;
  label: string;
  short: string;
  href: string;
  focusHref: string;
  /** Which brand motif illustrates the category. */
  motif: "leaf" | "capsule" | "cross";
  /** Listed under "Our Focus" (all three since 25 October 2026, when
   *  Genesis added Surgicals to its focus areas). */
  focus: boolean;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "womens-health",
    label: "Women’s Health",
    short: "Women’s healthcare products and areas of focus.",
    href: "/products?category=womens-health",
    focusHref: "/our-focus#womens-health",
    motif: "leaf",
    focus: true,
  },
  {
    id: "general-medicine",
    label: "General Medicine",
    short: "A growing general pharmaceutical range.",
    href: "/products?category=general-medicine",
    focusHref: "/our-focus#general-medicine",
    motif: "capsule",
    focus: true,
  },
  {
    id: "surgicals",
    label: "Surgicals",
    short: "Surgical products for clinical settings.",
    href: "/products?category=surgicals",
    focusHref: "/our-focus#surgicals",
    motif: "cross",
    focus: true,
  },
];

/** The product categories that are Genesis focus areas. */
export const FOCUS_AREAS = CATEGORIES.filter((c) => c.focus);

export type SubcategoryMeta = {
  id: SubcategoryId;
  parent: ProductCategory;
  label: string;
  /** Neutral description of the area — never a claim about a product. */
  short: string;
};

/**
 * Subcategories, in display order. Every one is always listed in the
 * catalogue, with its product count, even when it is currently empty.
 */
export const SUBCATEGORIES: SubcategoryMeta[] = [
  { id: "gynaecology", parent: "womens-health", label: "Gynaecology", short: "Products used in gynaecological care." },
  { id: "reproductive-health", parent: "womens-health", label: "Reproductive Health", short: "Products used in reproductive care, dispensed under medical supervision." },
  { id: "fertility", parent: "womens-health", label: "Fertility", short: "Products used in fertility care." },
  { id: "hormonal-health", parent: "womens-health", label: "Hormonal Health", short: "Products whose active ingredient is a hormone or hormone analogue." },
  { id: "pregnancy-maternal-care", parent: "womens-health", label: "Pregnancy & Maternal Care", short: "Products presented for use during pregnancy and motherhood." },
  { id: "womens-wellness", parent: "womens-health", label: "Women’s Wellness", short: "Nutritional products for women’s everyday health." },
  { id: "vitamins-nutrition", parent: "general-medicine", label: "Vitamins & Nutrition", short: "Vitamin, mineral and nutritional formulations." },
  { id: "gastrointestinal-care", parent: "general-medicine", label: "Gastrointestinal Care", short: "Antacid and gastro-protective formulations." },
  { id: "pain-management", parent: "general-medicine", label: "Pain Management", short: "Topical analgesic formulations." },
];

/**
 * The six focus areas shown on Our Focus and the homepage, in Genesis's order
 * (Gynaecology, Hormonal Health, Fertility, Women's Wellness, General
 * Medicine, Surgicals). Each resolves to a catalogue view, so its product
 * count and link always follow the live catalogue.
 */
export type FocusTile = {
  id: string;
  label: string;
  short: string;
  href: string;
  icon: "leaf" | "molecule" | "sprout" | "heart" | "capsule" | "cross";
  tint: "lavender" | "sky" | "peach" | "mint" | "blue" | "teal";
  category: ProductCategory;
  sub?: SubcategoryId;
};

export const FOCUS_TILES: FocusTile[] = [
  { id: "gynaecology", label: "Gynaecology", short: "Products used in gynaecological care.", href: "/products?category=womens-health&sub=gynaecology", icon: "leaf", tint: "lavender", category: "womens-health", sub: "gynaecology" },
  { id: "hormonal-health", label: "Hormonal Health", short: "Products whose active ingredient is a hormone or hormone analogue.", href: "/products?category=womens-health&sub=hormonal-health", icon: "molecule", tint: "sky", category: "womens-health", sub: "hormonal-health" },
  { id: "fertility", label: "Fertility", short: "Products used in fertility care.", href: "/products?category=womens-health&sub=fertility", icon: "sprout", tint: "peach", category: "womens-health", sub: "fertility" },
  { id: "womens-wellness", label: "Women’s Wellness", short: "Nutritional products for women’s everyday health.", href: "/products?category=womens-health&sub=womens-wellness", icon: "heart", tint: "mint", category: "womens-health", sub: "womens-wellness" },
  { id: "general-medicine", label: "General Medicine", short: "A growing general pharmaceutical range.", href: "/products?category=general-medicine", icon: "capsule", tint: "blue", category: "general-medicine" },
  { id: "surgicals", label: "Surgicals", short: "Surgical products for clinical and hospital settings.", href: "/our-focus#surgicals", icon: "cross", tint: "teal", category: "surgicals" },
];

export const subcategoryMeta = (id: SubcategoryId) => SUBCATEGORIES.find((s) => s.id === id)!;
export const subcategoriesOf = (category: ProductCategory) => SUBCATEGORIES.filter((s) => s.parent === category);

export const categoryMeta = (id: ProductCategory) => CATEGORIES.find((c) => c.id === id)!;

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  unspecified: "",
  available: "Available",
  "coming-soon": "Coming soon",
  limited: "Limited availability",
  discontinued: "Discontinued",
};

export const NOTICE_KIND_LABELS: Record<NoticeKind, string> = {
  announcement: "Announcement",
  "product-launch": "Product launch",
  "coming-soon": "Coming soon",
  update: "Business update",
};

/** Static pages offered by site search, with the words people might type. */
export const SEARCHABLE_PAGES = [
  { id: "page-home", title: "Home", url: "/", label: "Page", keywords: ["genesis", "pure lifesciences", "pharmaceutical"] },
  { id: "page-about", title: "About Genesis", url: "/about", label: "Page", keywords: ["company", "who we are", "vision", "mission", "values", "quality"] },
  { id: "page-focus", title: "Our Focus", url: "/our-focus", label: "Page", keywords: ["focus", "categories", "therapy areas", "women's health", "general medicine"] },
  { id: "page-products", title: "Products", url: "/products", label: "Page", keywords: ["catalogue", "catalog", "range", "portfolio"] },
  { id: "page-manufacturing", title: "Manufacturing Partners", url: "/manufacturing", label: "Page", keywords: ["manufacturing", "partners", "symbiosis", "bionexy", "sb lifense"] },
  { id: "page-axon", title: "Axon Surgicals", url: "/axon-surgicals", label: "Page", keywords: ["axon", "surgical", "surgicals"] },
  { id: "page-notices", title: "Notices", url: "/notices", label: "Page", keywords: ["notice", "announcements", "launch", "coming soon", "updates"] },
  { id: "page-insights", title: "Insights", url: "/insights", label: "Page", keywords: ["insights", "articles", "news", "blog"] },
  { id: "page-contact", title: "Contact", url: "/contact", label: "Page", keywords: ["contact", "enquiry", "address", "email", "phone", "whatsapp", "gst", "gstin"] },
] as const;
