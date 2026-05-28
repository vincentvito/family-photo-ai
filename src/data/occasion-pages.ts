export type OccasionPage = {
  slug: string;
  name: string;
  keyword: string;
  secondaryKeywords: string[];
  image: string;
  shortDescription: string;
  h1: string;
  intro: string;
  whatIsTitle: string;
  whatIsBody: string;
  ctaLabel: string;
  related: string[];
};

export const OCCASION_PAGES: readonly OccasionPage[] = [
  {
    slug: "fathers-day",
    name: "Father's Day",
    keyword: "father's day family portrait",
    secondaryKeywords: [
      "father's day photo gift",
      "dad family portrait",
      "father's day card from photos",
    ],
    image: "/samples/theme-card-fathers-day.jpg",
    shortDescription:
      "Make Dad the family portrait he never gets to be in, generated from separate phone photos in minutes.",
    h1: "Make Dad the family portrait he never gets to be in",
    intro:
      "Upload separate photos of Dad, the kids, grandparents, or pets. FamilyShoot turns them into a polished Father's Day portrait or card with a free watermarked preview first.",
    whatIsTitle: "Why Father's Day needs its own FamilyShoot page",
    whatIsBody:
      "Dad is often behind the camera, traveling, deployed, or missing from the one photo everyone wants to print. This page is built for that exact gift moment: a warm portrait where he is finally in the frame.\n\nUse it for Father's Day cards, framed gifts, grandparent copies, or a last-minute keepsake when booking a photoshoot is not realistic.",
    ctaLabel: "Create Father's Day Portrait",
    related: ["fathers-day-family-cards", "mothers-day", "grandparents-day", "family-reunion"],
  },
  {
    slug: "mothers-day",
    name: "Mother's Day",
    keyword: "mother's day family portrait",
    secondaryKeywords: [
      "mother's day photo gift",
      "mom family portrait",
      "mother's day card from photos",
    ],
    image: "/samples/theme-card-mothers-day.jpg",
    shortDescription:
      "Create a Mother's Day portrait or card with the whole family included, even when the photos are scattered.",
    h1: "Create the Mother's Day family portrait she actually wants",
    intro:
      "Turn separate phone photos into a warm Mother's Day portrait, card, or print-ready gift. Start with a free watermarked preview, then unlock only if it looks right.",
    whatIsTitle: "Why Mother's Day deserves a dedicated page",
    whatIsBody:
      "Mother's Day is a gift-buying moment with urgency and emotion. Families do not always have one good photo with Mom, children, grandparents, and pets together. FamilyShoot solves that without a studio booking.\n\nThis page should send visitors straight into the creation flow with copy focused on gifts, cards, framed prints, and last-minute keepsakes.",
    ctaLabel: "Create Mother's Day Portrait",
    related: [
      "mothers-day-family-cards",
      "fathers-day",
      "grandparents-day",
      "newborn-family-cards",
    ],
  },
  {
    slug: "womens-day",
    name: "Women's Day",
    keyword: "women's day family portrait",
    secondaryKeywords: [
      "international women's day photo gift",
      "women's day family card",
      "mom grandmother portrait",
    ],
    image: "/samples/theme-card-mothers-day.jpg",
    shortDescription:
      "Celebrate mothers, grandmothers, sisters, daughters, and the women who hold the family together.",
    h1: "Celebrate the women who hold the family together",
    intro:
      "Create a Women's Day portrait or card from the photos you already have. Bring mothers, grandmothers, daughters, sisters, and pets into one polished keepsake, with a free preview first.",
    whatIsTitle: "Why Women's Day is a strong separate page",
    whatIsBody:
      "International Women's Day is not just a greeting-card occasion. It is a natural moment for families to celebrate mothers, grandmothers, daughters, sisters, and chosen family. The page can convert gift buyers looking for something more personal than flowers.\n\nKeep the CTA direct: create a family portrait, preview it for free, and unlock the high-resolution version when it feels right.",
    ctaLabel: "Create Women's Day Portrait",
    related: ["mothers-day", "grandparents-day", "birthday-family-cards", "anniversary-gift"],
  },
  {
    slug: "grandparents-day",
    name: "Grandparents' Day",
    keyword: "grandparents day family portrait",
    secondaryKeywords: [
      "grandparents photo gift",
      "grandma grandpa family portrait",
      "grandparents day card",
    ],
    image: "/samples/theme-card-thanksgiving.jpg",
    shortDescription:
      "Make Grandma and Grandpa a family portrait with everyone included, even relatives who live far away.",
    h1: "Make Grandma and Grandpa the family portrait they keep asking for",
    intro:
      "Upload photos from different phones and create a print-ready portrait or card with kids, grandkids, grandparents, and pets together. Preview it free before unlocking.",
    whatIsTitle: "Why Grandparents' Day should not be buried in generic cards",
    whatIsBody:
      "Grandparents are one of the clearest gift audiences for FamilyShoot. They want the whole family in one frame, but the family is often split across cities and countries.\n\nThis page should work for Grandparents' Day, birthdays, Christmas gifts, and framed keepsakes, with the CTA pointing straight into the portrait creation flow.",
    ctaLabel: "Create Grandparents' Portrait",
    related: ["mothers-day", "fathers-day", "christmas-family-cards", "family-reunion"],
  },
  {
    slug: "family-reunion",
    name: "Family Reunion",
    keyword: "family reunion portrait",
    secondaryKeywords: [
      "family reunion photo",
      "extended family portrait",
      "large family portrait from photos",
    ],
    image: "/samples/after-wes-anderson-family.jpg",
    shortDescription:
      "Create an extended-family portrait when everyone cannot make it into the same room at the same time.",
    h1: "Create the family reunion photo even when everyone is not there",
    intro:
      "Bring relatives from different phones, cities, and years into one polished family portrait. Preview it free before unlocking the print-ready version.",
    whatIsTitle: "Why family reunion needs a landing page",
    whatIsBody:
      "Family reunions create high intent because everyone wants a group photo, but someone is always missing, late, camera-shy, or living far away. FamilyShoot turns scattered source photos into a single keepsake.\n\nThis page can support reunion organizers, grandparents, cousins, and families planning prints or cards after the event.",
    ctaLabel: "Create Family Reunion Portrait",
    related: [
      "grandparents-day",
      "christmas-family-cards",
      "thanksgiving-family-cards",
      "birthday-family-cards",
    ],
  },
  {
    slug: "military-family-portraits",
    name: "Military Family Portraits",
    keyword: "military family portrait",
    secondaryKeywords: [
      "deployed parent family photo",
      "military spouse photo gift",
      "soldier family portrait",
    ],
    image: "/samples/theme-card-fathers-day.jpg",
    shortDescription:
      "Create a family portrait or card when a parent is deployed, traveling, or stationed far away.",
    h1: "Bring a deployed parent into the family portrait",
    intro:
      "Upload separate photos from home and away. FamilyShoot creates a respectful, print-ready family portrait or card with a free preview first.",
    whatIsTitle: "Why deployed-family portraits are a separate use case",
    whatIsBody:
      "This is one of FamilyShoot's strongest emotional reasons to exist: a parent can be serving overseas, traveling for work, or living far away and still be included in the family keepsake.\n\nThe page should avoid overclaiming and keep the tone respectful. The CTA should focus on trying a preview before paying.",
    ctaLabel: "Create Military Family Portrait",
    related: ["fathers-day", "mothers-day", "grandparents-day", "family-reunion"],
  },
  {
    slug: "anniversary-gift",
    name: "Anniversary Gift",
    keyword: "anniversary family portrait gift",
    secondaryKeywords: [
      "anniversary photo gift",
      "couple family portrait",
      "custom anniversary portrait",
    ],
    image: "/samples/theme-card-save-the-date.jpg",
    shortDescription:
      "Create a personal anniversary portrait from favorite family photos, pets, kids, and memories.",
    h1: "Turn scattered family photos into an anniversary gift",
    intro:
      "Create a polished anniversary portrait or card from separate photos of the couple, kids, pets, or family members. Preview first, unlock when it feels gift-ready.",
    whatIsTitle: "Why anniversaries deserve a separate page",
    whatIsBody:
      "Anniversaries are recurring gift moments with a clear buyer: spouses, children, and relatives looking for a personal keepsake. A dedicated page can speak to gift anxiety better than a generic AI portrait page.\n\nUse this page for wedding anniversaries, relationship milestones, and framed family keepsakes.",
    ctaLabel: "Create Anniversary Portrait",
    related: ["save-the-date-family-cards", "mothers-day", "fathers-day", "birthday-family-cards"],
  },
  {
    slug: "valentines-day",
    name: "Valentine's Day",
    keyword: "valentine's day family portrait",
    secondaryKeywords: ["valentine photo card", "couple family portrait", "valentine family card"],
    image: "/samples/theme-card-valentines-day.jpg",
    shortDescription:
      "A family-friendly Valentine's Day portrait or card for couples, parents, kids, and pets.",
    h1: "Make a Valentine's portrait with the people you love most",
    intro:
      "Create a sweet, family-safe Valentine's Day card or portrait from photos you already have. Great for couples, parents, kids, grandparents, and pets, with a free preview first.",
    whatIsTitle: "Why Valentine's Day is worth its own page",
    whatIsBody:
      "Valentine's Day is a gift and card-buying moment, but FamilyShoot should own the family-safe angle rather than competing with generic romance cards. The hook is simple: make something personal with the people you love most.\n\nThe CTA should move users into a free preview quickly and avoid anything too couple-only or cheesy.",
    ctaLabel: "Create Valentine's Portrait",
    related: ["anniversary-gift", "mothers-day", "fathers-day", "birthday-family-cards"],
  },
] as const;

export const occasionPageBySlug = (slug: string) =>
  OCCASION_PAGES.find((page) => page.slug === slug);
