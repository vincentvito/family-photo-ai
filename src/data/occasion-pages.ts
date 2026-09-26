import { BIRTHDAY_CARD_SEO_PAGES } from "./birthday-card-seo-pages";

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
  metaTitle?: string;
  metaDescription?: string;
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
    image: "/landing/fathers-day/fathers-day-sample-backyard-v2.webp",
    shortDescription:
      "Make Dad the family portrait he never gets to be in, generated from separate phone photos in minutes.",
    h1: "Make Dad the family portrait he never gets to be in",
    intro:
      "Upload separate photos of Dad, the kids, grandparents, or pets. FamilyShoot turns them into a polished Father's Day portrait or card with a free watermarked preview first.",
    whatIsTitle: "A Father's Day photo gift from the pictures you already have",
    whatIsBody:
      "Dad is usually the one taking the photos, which means the best family moments often do not include him. Upload separate pictures of Dad, the kids, grandparents, and pets, and turn them into one custom Father's Day family portrait he can actually keep.\n\nMake a printable Father's Day card, a framed portrait, or a last-minute photo gift without booking a studio session. Start with a free watermarked preview, then unlock the high-resolution version only when it feels ready to give.",
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
    whatIsTitle: "A Mother's Day keepsake from everyday family photos",
    whatIsBody:
      "Make a portrait of Mom with the children, a three-generation picture with Grandma, or a Mother's Day card featuring the family pet. Add each person or pet to My Family with a clear reference photo, then choose who to include and a portrait or card style. Separate photos work even when you do not have a recent picture together.\n\nStart with a free watermarked preview and check each face before paying to unlock the high-resolution files. Download your favorite for a card or print. For a physical gift from the shop, save the image first, then upload it and complete a separate checkout in the Printify-powered shop.",
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
    whatIsTitle: "Celebrate generations of women in one portrait",
    whatIsBody:
      "Bring a grandmother, mother, and daughter into one portrait, create a picture of sisters who live apart, or celebrate the women in your chosen family. Start with a clear, well-lit reference photo of each person, with their face and shoulders visible. Choose a portrait style that suits them, from a warm family scene to a colorful illustration.\n\nYour first photoshoot can be a free watermarked preview. Look closely at everyone's likeness before unlocking the high-resolution files. Download a portrait to share with a personal Women's Day message or print it as a keepsake.",
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
    whatIsTitle: "A portrait of grandparents and grandchildren, wherever they live",
    whatIsBody:
      "Create a portrait of Grandma and Grandpa with the grandchildren, or a picture of a grandparent with a new baby they have not met yet. Upload separate reference photos so relatives can be included without being in the same room. You can select up to eight people or pets for one shoot; groups of five or fewer usually produce more consistent likenesses.\n\nChoose a portrait or card style and review the free watermarked preview before unlocking your first shoot. Save the high-resolution image for a printed keepsake. If you use the Printify-powered shop for a physical gift, upload the downloaded file and check delivery options during its separate checkout.",
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
    whatIsTitle: "Make a reunion keepsake from separate family photos",
    whatIsBody:
      "Include a relative who missed the reunion or create a portrait of cousins who live in different cities. Add each person's clear reference photo to My Family, then select up to eight people or pets for one shoot. For a larger extended family, create several portraits of smaller groups; five or fewer subjects usually gives more consistent results.\n\nChoose a shared style for your reunion keepsakes and inspect every face in the preview. AI creates a new scene from your references, so the result is a personalized portrait rather than a record of the event. Your first shoot can be a free watermarked preview, with high-resolution downloads available after a paid unlock.",
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
    whatIsTitle: "A family keepsake while you are apart",
    whatIsBody:
      "Create a portrait of a deployed parent with their partner and children, or a family card to share while you are living apart. Use a clear reference photo of each person with their face and shoulders visible. Pick a portrait or card style that feels right for your family, and select the people or pets to include.\n\nFamilyShoot uses those photos as references to create a new image. Review the free watermarked preview carefully for likeness and clothing details, including any uniform details. Pay to unlock the high-resolution files only if you want to keep the result, then download the image to share or print.",
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
    whatIsTitle: "Anniversary portrait ideas for couples and families",
    whatIsBody:
      "Make a portrait of the couple, include the children and a pet, or choose an illustrated style for a playful anniversary keepsake. Use clear reference photos that show each person as you want them represented, then add them to My Family and select who will appear in the shoot.\n\nPreview your first shoot free with a watermark and check the faces before paying to unlock the high-resolution files. Download the portrait for a card or print. To order a physical gift through the Printify-powered shop, save the image, upload it in the shop, and complete its separate checkout; allow time for printing and delivery.",
    ctaLabel: "Create Anniversary Portrait",
    related: [
      "birthday-cards/last-minute-personalized-birthday-card",
      "save-the-date-family-cards",
      "mothers-day",
      "fathers-day",
      "birthday-family-cards",
    ],
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
    whatIsTitle: "Personal Valentine's portraits for the people you love",
    whatIsBody:
      "Create a Valentine's portrait of you and your partner, a card with the children for their grandparents, or a playful picture featuring your pet. Add a clear reference photo for each person or pet in My Family, then choose who to include and select a portrait or Valentine's card style.\n\nStart with a free watermarked preview and check that the faces and card details look right. Unlock the high-resolution files when you are happy with the result, then download your favorite to share with a personal message or print as a keepsake.",
    ctaLabel: "Create Valentine's Portrait",
    related: [
      "birthday-cards/last-minute-personalized-birthday-card",
      "anniversary-gift",
      "mothers-day",
      "fathers-day",
      "birthday-family-cards",
    ],
  },
  ...BIRTHDAY_CARD_SEO_PAGES,
] as const;

export const occasionPageBySlug = (slug: string) =>
  OCCASION_PAGES.find((page) => page.slug === slug);
