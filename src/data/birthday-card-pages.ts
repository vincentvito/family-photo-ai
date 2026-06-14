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
    image: "/samples/theme-minecraft.jpg",
    h1: "Personalized kids birthday cards made from family moments",
    intro:
      "Turn favorite family, party, portrait, or pet photos into a birthday card idea that feels made for the child, not picked from a shelf. Start with playful styles like Minecraft, storybook garden, or a soft birthday portrait with balloons and big age-number energy.",
    ctaLabel: "Create a birthday card",
    sections: [
      {
        title: "For birthdays they will remember",
        body: "A good kids birthday card should feel like it belongs to that child: their smile, their family, their pets, their hobbies, and the little moments everyone already talks about.",
      },
      {
        title: "Card ideas for sons, daughters, nieces, nephews, and classmates",
        body: "Use FamilyShoot for a birthday card from parents, grandparents, aunties, uncles, cousins, classmates, or family friends. Start from the photos you already have and make the card feel personal.",
      },
      {
        title: "Birthday message examples for kids",
        body: "Keep the message short, warm, and age-appropriate. Add a family memory, a nickname, or a small wish for the year ahead.",
      },
      {
        title: "Add family, pets, hobbies, or party memories",
        body: "The card can lean into a party theme, a favorite pet, a sports moment, a sibling photo, or a simple portrait. The point is not to look generic. It should look like their birthday.",
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
        a: "Yes. The page is built for parents, grandparents, relatives, and friends making cards for sons, daughters, nieces, nephews, classmates, and little friends.",
      },
      {
        q: "Where does the Create a birthday card button go?",
        a: "It opens the current FamilyShoot creation flow so you can start with the photos you already have.",
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
    image: "/samples/theme-card-birthday.jpg",
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
        body: "Keep the note specific. Mention what she taught the family, a recent memory, or a small thing everyone loves about her.",
      },
      {
        title: "Built for keepsake cards and birthday posts",
        body: "Use the final idea as a printed birthday card, a digital surprise, or a starting point for a social post from the family after approval.",
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
        a: "No. Families can use the idea for a printed card, a digital birthday surprise, or a social birthday post after they approve the final creative.",
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
      "A simple personalized birthday-card idea for cake decorators, party planners, family photographers, and children’s event businesses to share with clients.",
    image: "/samples/theme-card-birthday.jpg",
    h1: "A simple birthday-card add-on for your clients",
    intro:
      "FamilyShoot gives families a personal birthday-card idea they can pair with a cake order, birthday shoot, party package, or celebration gift.",
    ctaLabel: "Request a sample birthday-card pack",
    sections: [
      {
        title: "For cake decorators",
        body: "After the cake is picked up or photographed, families already have a birthday moment worth turning into a card. FamilyShoot can be a light add-on recommendation, not another heavy service to manage.",
      },
      {
        title: "For kids’ party planners",
        body: "Party planners can give families a simple next step after the event: turn the birthday photos, family portraits, and pet moments into a personal card idea.",
      },
      {
        title: "For family photographers",
        body: "Birthday mini-sessions and cake-smash shoots already create the source material. FamilyShoot can help clients reuse those images as birthday-card concepts.",
      },
      {
        title: "For pet birthday creators",
        body: "Pet birthday accounts and photographers can use the same idea for families who want the dog or cat included in the birthday-card moment.",
      },
      {
        title: "How to share it with clients",
        body: "This is not a replacement for your service. It is a small personal add-on families can use after they already have birthday photos, cake photos, party portraits, or pet celebration pictures.",
      },
    ],
    messageExamples: [
      "FamilyShoot helps families turn birthday photos into a personal card idea.",
      "A small add-on after a cake order, birthday shoot, or party package.",
      "Useful for kids, grandparents, pets, milestone birthdays, and long-distance family.",
    ],
    faqs: [
      {
        q: "Is FamilyShoot replacing photographers, planners, or cake decorators?",
        a: "No. It is positioned as a small personal add-on families can use after they already have birthday photos, cake photos, party portraits, or pet celebration pictures.",
      },
      {
        q: "Who is this partner page for?",
        a: "Cake decorators, kids’ party planners, family photographers, children’s event venues, and pet birthday creators who want a simple birthday-card add-on to share with clients.",
      },
      {
        q: "Can partners request examples before sharing it?",
        a: "Yes. The page CTA asks for a sample birthday-card pack so partners can review the idea before recommending it.",
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
