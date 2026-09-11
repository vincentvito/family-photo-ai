export type BirthdayCardStyleExample = {
  label: string;
  src: string;
  alt: string;
  caption: string;
};

export type BirthdayCardPage = {
  slug: string;
  name: string;
  title: string;
  description: string;
  image: string;
  h1: string;
  intro: string;
  ctaLabel: string;
  sections: { title: string; body: string }[];
  styleExamples?: readonly BirthdayCardStyleExample[];
  styleEyebrow?: string;
  styleHeading?: string;
  messageExamples: string[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
};

export const BIRTHDAY_CARD_PAGES: readonly BirthdayCardPage[] = [
  {
    slug: "kids-birthday-card-maker",
    name: "Kids birthday card maker",
    title: "Kids Birthday Card Maker | Personalized Birthday Cards | FamilyShoot",
    description:
      "Create a personalized kids birthday card using family, party, portrait, or pet photos. Birthday card ideas for sons, daughters, nieces, nephews, and little friends.",
    image: "/seo/birthday-cards/kids-birthday-card-maker.webp",
    h1: "Personalized kids birthday cards made from family moments",
    intro:
      "Turn photos of the birthday child, family, or pets into a personal birthday card. Choose a birthday layout with a natural portrait, soft Watercolor art, or a playful Storybook style, then add the child's name, age, and a short greeting.",
    ctaLabel: "Create a birthday card",
    sections: [
      {
        title: "For birthdays they will remember",
        body: "A good kids birthday card should feel like it belongs to that child: their smile, their family, their pets, their hobbies, and the little moments everyone already talks about.",
      },
      {
        title: "Card ideas for sons, daughters, nieces, nephews, and classmates",
        body: "For a son or daughter, try a birthday-age layout with their portrait. For a niece or nephew, include cousins in an illustrated card. For a classmate, keep it simple with the birthday child's photo and a cheerful wish. Add separate reference photos for each person you want to include.",
      },
      {
        title: "Birthday message examples for kids",
        body: 'Use the Greeting / card text field for the child\'s name, age, and a short wish, such as "Happy 7th Birthday, Ava! Keep being curious, brave, and completely you." The field allows up to 120 characters. Include the age when choosing a carved-number birthday layout.',
      },
      {
        title: "Choose who appears and check the preview",
        body: "Select the child, siblings, relatives, or pets you want on the card. Use clear photos where each face is easy to see. Before unlocking the download, check the child's likeness, the spelling of their name, the age, and the birthday message.",
      },
    ],
    styleEyebrow: "Three kid-ready design styles",
    styleHeading: "Show them a card that feels like their world, not a generic birthday template.",
    styleExamples: [
      {
        label: "Minecraft party quest",
        src: "/samples/theme-minecraft.jpg",
        alt: "Blocky Minecraft-inspired family birthday card style",
        caption:
          "Voxel blocks, bright biomes, pets, siblings, and adventure energy for kids who want the card to feel like a game world.",
      },
      {
        label: "Storybook garden birthday",
        src: "/samples/theme-watercolor-storybook.jpg",
        alt: "Watercolor storybook kids birthday card style",
        caption:
          "Soft illustrated flowers, lanterns, warm family faces, and gentle bedtime-book charm for younger kids.",
      },
      {
        label: "Big-number balloon portrait",
        src: "/samples/card-art-styles/photoshoot.jpg",
        alt: "Soft photo-led kids birthday card portrait style",
        caption:
          "A polished portrait direction inspired by big age-number backdrops, pastel balloons, flowers, and clean editorial typography.",
      },
    ],
    messageExamples: [
      "Happy birthday to our favorite little adventurer. Keep being curious, brave, and completely you.",
      "You make every year brighter. Happy birthday, superstar.",
      "Another year bigger, funnier, and more wonderful. We love watching you grow.",
    ],
    faqs: [
      {
        q: "What is a kids birthday card maker?",
        a: "It is a tool for turning family, party, portrait, or pet photos into a personalized birthday card idea for a child.",
      },
      {
        q: "Can I make a birthday card for my son or daughter?",
        a: "Yes. Start with a clear photo of your child, choose a birthday card layout, and add their name, age, and message. You can also include siblings, relatives, or pets from separate photos.",
      },
      {
        q: "How do I start making a birthday card?",
        a: "Add the people or pets you want to include and upload their reference photos. Then choose card output, select a birthday layout and art styles, and enter your greeting. Review the generated preview before unlocking a high-resolution download.",
      },
    ],
    related: [
      { href: "/birthday-cards/birthday-card-for-grandma", label: "Birthday card for Grandma" },
      { href: "/birthday-family-cards", label: "Birthday family cards" },
      { href: "/cards", label: "All card styles" },
    ],
  },
  {
    slug: "birthday-card-for-grandma",
    name: "Birthday card for Grandma",
    title: "Birthday Card for Grandma | Personalized Family Gift | FamilyShoot",
    description:
      "Make a birthday card for Grandma using family photos, grandkids, pets, and warm message ideas. A personal grandparent birthday gift from the people she loves.",
    image: "/seo/birthday-cards/birthday-card-for-grandma.webp",
    h1: "A birthday card for Grandma that feels like family",
    intro:
      "Create a warm birthday card idea for Grandma with the grandkids, family portraits, pets, and little memories that make the gift feel personal.",
    ctaLabel: "Make Grandma's birthday card",
    sections: [
      {
        title: "A personal birthday gift from the whole family",
        body: "Grandma does not need another generic card. A family photo card lets the birthday greeting carry the faces, pets, nicknames, and memories she already cares about.",
      },
      {
        title: "Use grandkids, grown kids, pets, or long-distance family",
        body: "Start with everyday phone photos. The card can focus on grandchildren, include adult children, add the family dog or cat, or make a long-distance birthday message feel closer.",
      },
      {
        title: "Grandma birthday message examples",
        body: 'Keep the note specific. Mention what she taught the family, a recent memory, or a small thing everyone loves about her. Try "Happy Birthday, Grandma! Your stories and hugs make every visit special. Love from all of us." Add the message in the Greeting / card text field.',
      },
      {
        title: "Built for keepsake cards and birthday posts",
        body: "Preview the card and check each face and the greeting before unlocking the high-resolution download. Send the image as a digital birthday surprise, use it in a family birthday post, or arrange printing with your preferred printer.",
      },
    ],
    messageExamples: [
      "Happy birthday, Grandma. Thank you for making every ordinary day feel like a family memory.",
      "We love you more than one card can fit. Happy birthday from all of us.",
      "Your stories, hugs, recipes, and love are part of who we are. Happy birthday, Grandma.",
    ],
    faqs: [
      {
        q: "What should I put in a birthday card for Grandma?",
        a: "Use a specific family memory, a thank-you, or a simple wish from the grandkids. A personal photo makes the message feel less generic.",
      },
      {
        q: "Can I include grandkids and pets in the card?",
        a: "Yes. FamilyShoot is designed for family portraits, grandkids, pets, and everyday photos that can become a personal birthday-card concept.",
      },
      {
        q: "Is this only for printed cards?",
        a: "No. You can share the downloaded image in a message or birthday post. If you want a physical card, use the high-resolution download and arrange printing yourself.",
      },
    ],
    related: [
      { href: "/birthday-cards/kids-birthday-card-maker", label: "Kids birthday card maker" },
      { href: "/grandparents-day", label: "Grandparents' Day cards" },
      { href: "/birthday-family-cards", label: "Birthday family cards" },
    ],
  },
  {
    slug: "partners",
    name: "Birthday card partners",
    title: "Birthday Card Add-On for Party Planners and Cake Decorators | FamilyShoot",
    description:
      "A simple personalized birthday-card idea for cake decorators, party planners, family photographers, and children's event businesses to share with clients.",
    image: "/seo/birthday-cards/birthday-card-partners.webp",
    h1: "A simple birthday-card add-on for your clients",
    intro:
      "FamilyShoot gives families a personal birthday-card idea they can pair with a cake order, birthday shoot, party package, or celebration gift.",
    ctaLabel: "Create a sample birthday card",
    sections: [
      {
        title: "For cake decorators",
        body: "Give families a personal card idea to go with a cake order. They can use a clear portrait of the birthday person, choose a birthday layout, and add a name, age, and message before previewing the result.",
      },
      {
        title: "For kids' party planners",
        body: "Suggest a birthday photo card as part of the celebration. Families can create an invitation with a short party message or make a keepsake greeting from portraits taken at the event.",
      },
      {
        title: "For family photographers",
        body: "Clients can use clear portraits from birthday mini-sessions and cake-smash shoots as references for a personalized card. A birthday-age layout or Watercolor art style gives them another way to enjoy their photos.",
      },
      {
        title: "For pet birthday creators",
        body: "Families can add a dog or cat from a clear reference photo and select the pet for the card. Try a birthday greeting from the pet, or include them beside the birthday person in a family portrait.",
      },
      {
        title: "How to share it with clients",
        body: "Create a sample using your own reference photos, choose a birthday layout, and check the preview. Share the FamilyShoot link with clients who would enjoy making their own card. They can choose the people, pets, art styles, and greeting for their celebration.",
      },
    ],
    messageExamples: [
      "Want a card to go with the cake? Try a birthday portrait with your child's name and age on FamilyShoot.",
      "Turn a portrait from your birthday shoot into a personalized card. Choose a style and preview it on FamilyShoot.",
      "Include the whole family, even from separate photos, in a birthday card for someone special.",
    ],
    faqs: [
      {
        q: "Is FamilyShoot replacing photographers, planners, or cake decorators?",
        a: "No. Families can use FamilyShoot alongside a cake order, party, or photography session to create a digital birthday card from their reference photos.",
      },
      {
        q: "Who can share FamilyShoot with clients?",
        a: "Cake decorators, kids' party planners, family photographers, children's event venues, and pet birthday creators who want a simple birthday-card add-on to share with clients.",
      },
      {
        q: "Can I try a sample before sharing it with clients?",
        a: "Yes. Start with your own reference photos, choose a birthday card layout, and create a preview to review the result before recommending FamilyShoot. The creation flow lets you choose who appears, select art styles, and add a greeting.",
      },
    ],
    related: [
      { href: "/birthday-cards/kids-birthday-card-maker", label: "Kids birthday card maker" },
      { href: "/birthday-cards/birthday-card-for-grandma", label: "Birthday card for Grandma" },
      { href: "/cards", label: "All card styles" },
    ],
  },
] as const;

export const birthdayCardPageBySlug = (slug: string) =>
  BIRTHDAY_CARD_PAGES.find((page) => page.slug === slug);

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
  image: "/seo/birthday-cards/last-minute-personalized-birthday-card.webp",
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
