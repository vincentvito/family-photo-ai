export type BirthdayCardSeoPage = {
  slug: string;
  path: string;
  name: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  heroCopy: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  related: string[];
};

export const LAST_MINUTE_BIRTHDAY_CARD_PAGE: BirthdayCardSeoPage = {
  slug: "last-minute-personalized-birthday-card",
  path: "/birthday-cards/last-minute-personalized-birthday-card",
  name: "Last-minute personalized birthday cards",
  seoTitle: "Last-Minute Personalized Birthday Cards | FamilyShoot",
  metaDescription:
    "Create a thoughtful personalized birthday card using family, kid, couple, grandparent, or pet photos. A better last-minute birthday gift idea from FamilyShoot.",
  h1: "Last-minute personalized birthday cards that still feel thoughtful",
  heroCopy:
    "Forgot a birthday? Turn family, couple, kid, grandparent, or pet photos into a birthday card idea that feels personal instead of rushed.",
  ctaLabel: "Create a birthday card",
  ctaHref: "/studio/roster",
  image: "/samples/theme-card-birthday.jpg",
  related: [
    "/birthday-family-cards",
    "/anniversary-gift",
    "/grandparents-day",
    "/fathers-day-family-cards",
  ],
} as const;

export const BIRTHDAY_CARD_SEO_PAGES = [LAST_MINUTE_BIRTHDAY_CARD_PAGE] as const;

export const birthdayCardSeoPageByPath = (path: string) =>
  BIRTHDAY_CARD_SEO_PAGES.find((page) => page.path === path);
