export type Vibe = {
  slug: string;
  name: string;
  keyword: string;
  secondaryKeywords: string[];
  image: string;
  extraImages?: readonly string[];
  shortDescription: string;
  related: string[];
};

export const VIBES: readonly Vibe[] = [
  {
    slug: "ghibli-family-photos",
    name: "Studio Ghibli",
    keyword: "ghibli family portrait",
    secondaryKeywords: [
      "ghibli style family photo",
      "studio ghibli ai family portrait",
      "miyazaki family photo",
    ],
    image: "/samples/theme-ghibli-countryside.jpg",
    extraImages: ["/samples/theme-spirited-away.jpg", "/samples/theme-watercolor-storybook.jpg"],
    shortDescription:
      "Hand-painted Ghibli countryside warmth, soft watercolor light, your family at the center.",
    related: [
      "spirited-away-family-photos",
      "watercolor-storybook-family-photos",
      "pixar-family-photos",
      "aardman-family-photos",
    ],
  },
  {
    slug: "spirited-away-family-photos",
    name: "Spirited Away",
    keyword: "spirited away family portrait",
    secondaryKeywords: ["spirited away style family photo", "ghibli spirited away ai portrait"],
    image: "/samples/theme-spirited-away.jpg",
    shortDescription: "Bath-house lanterns, dusk magic, and your family inside a Miyazaki dream.",
    related: [
      "ghibli-family-photos",
      "watercolor-storybook-family-photos",
      "cherry-blossom-family-photos",
    ],
  },
  {
    slug: "pixar-family-photos",
    name: "Pixar",
    keyword: "pixar family portrait",
    secondaryKeywords: [
      "pixar style family photo",
      "pixar ai family portrait",
      "3d animated family photo",
    ],
    image: "/samples/theme-pixar.jpg",
    extraImages: ["/samples/after-pixar-family.jpg", "/samples/theme-aardman.jpg"],
    shortDescription:
      "Big eyes, soft skin, cinematic key light. Your family rendered like a Pixar opening shot.",
    related: [
      "aardman-family-photos",
      "lego-family-photos",
      "sims-family-photos",
      "ghibli-family-photos",
    ],
  },
  {
    slug: "aardman-family-photos",
    name: "Aardman Claymation",
    keyword: "aardman claymation family portrait",
    secondaryKeywords: [
      "wallace and gromit style family photo",
      "claymation family portrait",
      "stop motion family photo",
    ],
    image: "/samples/theme-aardman.jpg",
    shortDescription:
      "Wallace and Gromit grins. Thumbprints in the clay, your family in stop-motion charm.",
    related: ["pixar-family-photos", "lego-family-photos", "cartoon-family-photos"],
  },
  {
    slug: "wes-anderson-family-photos",
    name: "Wes Anderson",
    keyword: "wes anderson family portrait",
    secondaryKeywords: [
      "wes anderson style family photo",
      "symmetrical family portrait",
      "grand budapest family photo",
    ],
    image: "/samples/theme-wes-anderson.jpg",
    extraImages: ["/samples/after-wes-anderson-family.jpg", "/samples/theme-parisian-cafe.jpg"],
    shortDescription:
      "Pastel palette, dead-center framing, deadpan posture. Your family in a Wes Anderson tableau.",
    related: [
      "parisian-cafe-family-photos",
      "vintage-polaroid-family-photos",
      "film-noir-family-photos",
    ],
  },
  {
    slug: "slim-aarons-family-photos",
    name: "Slim Aarons",
    keyword: "slim aarons family portrait",
    secondaryKeywords: [
      "slim aarons style family photo",
      "poolside family photo",
      "jet set family portrait",
    ],
    image: "/samples/theme-slim-aarons.jpg",
    shortDescription:
      "Poolside, golden, effortless. Your family inside a Slim Aarons jet-set frame.",
    related: [
      "amalfi-summer-family-photos",
      "coastal-grandmother-family-photos",
      "tuscan-summer-family-photos",
    ],
  },
  {
    slug: "norman-rockwell-family-photos",
    name: "Norman Rockwell",
    keyword: "norman rockwell family portrait",
    secondaryKeywords: ["norman rockwell style family painting", "americana family portrait"],
    image: "/samples/theme-norman-rockwell.jpg",
    shortDescription: "Warm americana, soft brushwork, an everyday moment painted with reverence.",
    related: [
      "renaissance-oil-family-photos",
      "sunday-sofa-family-photos",
      "watercolor-storybook-family-photos",
    ],
  },
  {
    slug: "annie-leibovitz-family-photos",
    name: "Annie Leibovitz",
    keyword: "annie leibovitz family portrait",
    secondaryKeywords: [
      "leibovitz style family photo",
      "editorial family portrait",
      "vanity fair family photo",
    ],
    image: "/samples/theme-leibovitz.jpg",
    shortDescription:
      "Editorial drama, painterly light, your family staged like a Vanity Fair cover.",
    related: [
      "film-noir-family-photos",
      "renaissance-oil-family-photos",
      "wes-anderson-family-photos",
    ],
  },
  {
    slug: "national-geographic-family-photos",
    name: "National Geographic",
    keyword: "national geographic family portrait",
    secondaryKeywords: [
      "nat geo style family photo",
      "documentary family portrait",
      "natgeo family photo",
    ],
    image: "/samples/theme-natgeo.jpg",
    shortDescription:
      "Documentary-honest, sun-baked, your family framed like a National Geographic feature.",
    related: [
      "annie-leibovitz-family-photos",
      "golden-hour-beach-family-photos",
      "desert-santa-fe-family-photos",
    ],
  },
  {
    slug: "lego-family-photos",
    name: "LEGO",
    keyword: "lego family portrait",
    secondaryKeywords: [
      "lego style family photo",
      "lego mini-figure family portrait",
      "lego family ai",
    ],
    image: "/samples/theme-lego-family.jpg",
    extraImages: ["/samples/theme-minecraft.jpg", "/samples/theme-the-sims.jpg"],
    shortDescription: "Studded plates, brick-built rooms, your family as smiling minifigures.",
    related: [
      "minecraft-family-photos",
      "sims-family-photos",
      "aardman-family-photos",
      "pixar-family-photos",
    ],
  },
  {
    slug: "minecraft-family-photos",
    name: "Minecraft",
    keyword: "minecraft family portrait",
    secondaryKeywords: ["minecraft style family photo", "pixel family portrait"],
    image: "/samples/theme-minecraft.jpg",
    extraImages: ["/samples/theme-lego-family.jpg", "/samples/theme-the-sims.jpg"],
    shortDescription: "Blocky biomes, square sunsets, your family rendered in Minecraft pixels.",
    related: ["lego-family-photos", "sims-family-photos", "south-park-family-photos"],
  },
  {
    slug: "sims-family-photos",
    name: "The Sims",
    keyword: "the sims family portrait",
    secondaryKeywords: [
      "sims style family photo",
      "sims 4 family portrait",
      "plumbob family photo",
    ],
    image: "/samples/theme-the-sims.jpg",
    shortDescription: "Plumbobs and clean shaders. Your family living their best Sims life.",
    related: ["minecraft-family-photos", "lego-family-photos", "pixar-family-photos"],
  },
  {
    slug: "south-park-family-photos",
    name: "South Park",
    keyword: "south park family portrait",
    secondaryKeywords: ["south park style family photo", "south park character family"],
    image: "/samples/theme-south-park.jpg",
    shortDescription:
      "Construction-paper edges, big round heads, your family as South Park cutouts.",
    related: ["cartoon-family-photos", "yellow-cartoon-family-photos", "minecraft-family-photos"],
  },
  {
    slug: "manga-family-photos",
    name: "Manga",
    keyword: "manga family portrait",
    secondaryKeywords: ["manga style family photo", "anime family portrait", "shonen family photo"],
    image: "/samples/theme-manga.jpg",
    extraImages: ["/samples/theme-spirited-away.jpg", "/samples/theme-ghibli-countryside.jpg"],
    shortDescription: "Black ink, screentone, dramatic eyes. Your family on a manga splash page.",
    related: ["spirited-away-family-photos", "ghibli-family-photos", "cartoon-family-photos"],
  },
  {
    slug: "cartoon-family-photos",
    name: "Classic Cartoon",
    keyword: "cartoon family portrait",
    secondaryKeywords: ["cartoon style family photo", "animated family portrait"],
    image: "/samples/theme-cartoon.jpg",
    shortDescription:
      "Bold outlines, flat color, Saturday-morning energy with your family in frame.",
    related: ["yellow-cartoon-family-photos", "south-park-family-photos", "aardman-family-photos"],
  },
  {
    slug: "yellow-cartoon-family-photos",
    name: "Yellow Cartoon",
    keyword: "yellow cartoon family portrait",
    secondaryKeywords: ["simpsons style family photo", "yellow animated family portrait"],
    image: "/samples/theme-yellow-cartoon.jpg",
    extraImages: ["/samples/theme-cartoon.jpg", "/samples/theme-south-park.jpg"],
    shortDescription:
      "Four-fingered hands, overbite grins, your family in the loudest yellow cartoon palette.",
    related: ["cartoon-family-photos", "south-park-family-photos"],
  },
  {
    slug: "superhero-family-photos",
    name: "Superhero",
    keyword: "superhero family portrait",
    secondaryKeywords: [
      "superhero style family photo",
      "comic book family portrait",
      "marvel style family photo",
    ],
    image: "/samples/theme-superhero.jpg",
    shortDescription:
      "Capes catching wind, skyline behind. Your family in their origin-story moment.",
    related: ["film-noir-family-photos", "cartoon-family-photos", "pixar-family-photos"],
  },
  {
    slug: "renaissance-oil-family-photos",
    name: "Renaissance Oil Painting",
    keyword: "renaissance family portrait painting",
    secondaryKeywords: [
      "oil painting family portrait",
      "classical family painting",
      "old master family portrait",
    ],
    image: "/samples/theme-renaissance-oil.jpg",
    extraImages: ["/samples/theme-norman-rockwell.jpg", "/samples/theme-leibovitz.jpg"],
    shortDescription:
      "Velvet, candlelight, brushstrokes you can almost feel. Your family painted like nobility.",
    related: [
      "norman-rockwell-family-photos",
      "annie-leibovitz-family-photos",
      "film-noir-family-photos",
    ],
  },
  {
    slug: "film-noir-family-photos",
    name: "Film Noir",
    keyword: "film noir family portrait",
    secondaryKeywords: [
      "black and white film noir family photo",
      "classic hollywood family portrait",
    ],
    image: "/samples/theme-film-noir.jpg",
    shortDescription:
      "Venetian blinds, deep shadow, cigarette smoke that never was. Your family in monochrome cinema.",
    related: [
      "annie-leibovitz-family-photos",
      "renaissance-oil-family-photos",
      "vintage-polaroid-family-photos",
    ],
  },
  {
    slug: "vintage-polaroid-family-photos",
    name: "Vintage Polaroid",
    keyword: "vintage polaroid family portrait",
    secondaryKeywords: [
      "polaroid style family photo",
      "70s family photo",
      "instant film family portrait",
    ],
    image: "/samples/theme-vintage-polaroid.jpg",
    shortDescription:
      "Soft focus, faded warmth, white border. A Polaroid your family never quite took.",
    related: [
      "y2k-disposable-family-photos",
      "70s-station-wagon-family-photos",
      "film-noir-family-photos",
    ],
  },
  {
    slug: "y2k-disposable-family-photos",
    name: "Y2K Disposable Camera",
    keyword: "y2k disposable camera family photo",
    secondaryKeywords: [
      "2000s family photo style",
      "disposable camera family portrait",
      "flash photo family",
    ],
    image: "/samples/theme-y2k-disposable.jpg",
    shortDescription: "Hard flash, grainy film, that 2003 living-room glow. Your family in Y2K.",
    related: ["vintage-polaroid-family-photos", "70s-station-wagon-family-photos"],
  },
  {
    slug: "70s-station-wagon-family-photos",
    name: "70s Station Wagon",
    keyword: "70s family road trip photo",
    secondaryKeywords: [
      "70s family photo style",
      "retro station wagon family portrait",
      "vintage road trip photo",
    ],
    image: "/samples/theme-70s-station-wagon.jpg",
    shortDescription:
      "Wood-panel doors, denim everywhere, your family loaded up for a 70s road trip.",
    related: [
      "vintage-polaroid-family-photos",
      "y2k-disposable-family-photos",
      "norman-rockwell-family-photos",
    ],
  },
  {
    slug: "watercolor-storybook-family-photos",
    name: "Watercolor Storybook",
    keyword: "watercolor storybook family portrait",
    secondaryKeywords: [
      "storybook family illustration",
      "watercolor family painting",
      "illustrated family portrait",
    ],
    image: "/samples/theme-watercolor-storybook.jpg",
    extraImages: ["/samples/after-watercolor-family.jpg", "/samples/theme-ghibli-countryside.jpg"],
    shortDescription: "Soft washes, hand-lettered warmth, your family inside a picture-book page.",
    related: [
      "ghibli-family-photos",
      "spirited-away-family-photos",
      "norman-rockwell-family-photos",
      "cherry-blossom-family-photos",
    ],
  },
  {
    slug: "amalfi-summer-family-photos",
    name: "Amalfi Summer",
    keyword: "amalfi coast family photo",
    secondaryKeywords: [
      "italian summer family portrait",
      "amalfi family vacation photo",
      "positano family photo",
    ],
    image: "/samples/theme-amalfi-summer.jpg",
    shortDescription: "Lemon trees, white linen, sea sparkle. Your family on the Amalfi coast.",
    related: [
      "tuscan-summer-family-photos",
      "slim-aarons-family-photos",
      "coastal-grandmother-family-photos",
    ],
  },
  {
    slug: "tuscan-summer-family-photos",
    name: "Tuscan Summer",
    keyword: "tuscany family photo",
    secondaryKeywords: ["tuscan villa family portrait", "italy family vacation photo"],
    image: "/samples/theme-tuscan-summer.jpg",
    shortDescription: "Olive groves, terracotta light, long table. Your family in a Tuscan summer.",
    related: [
      "amalfi-summer-family-photos",
      "parisian-cafe-family-photos",
      "slim-aarons-family-photos",
    ],
  },
  {
    slug: "paris-family-stroll-family-photos",
    name: "Paris Stroll",
    keyword: "paris family photo",
    secondaryKeywords: [
      "paris family vacation photo",
      "eiffel tower family portrait",
      "family in paris",
    ],
    image: "/samples/theme-paris-family-stroll.jpg",
    shortDescription:
      "Wrought-iron balconies, cobblestone underfoot, your family wandering Paris together.",
    related: [
      "parisian-cafe-family-photos",
      "amalfi-summer-family-photos",
      "new-york-city-family-photos",
    ],
  },
  {
    slug: "parisian-cafe-family-photos",
    name: "Parisian Cafe",
    keyword: "parisian cafe family photo",
    secondaryKeywords: ["paris cafe family portrait", "french cafe family photo"],
    image: "/samples/theme-parisian-cafe.jpg",
    shortDescription:
      "Cane chairs, espresso cups, soft Paris afternoon. Your family at the corner cafe.",
    related: [
      "paris-family-stroll-family-photos",
      "wes-anderson-family-photos",
      "kinfolk-kitchen-family-photos",
    ],
  },
  {
    slug: "new-york-city-family-photos",
    name: "New York City",
    keyword: "new york city family photo",
    secondaryKeywords: ["nyc family portrait", "manhattan family photo", "brownstone family photo"],
    image: "/samples/theme-new-york-city.jpg",
    shortDescription: "Brownstone stoop, yellow cab, steam off a vent. Your family in the city.",
    related: [
      "paris-family-stroll-family-photos",
      "annie-leibovitz-family-photos",
      "film-noir-family-photos",
    ],
  },
  {
    slug: "desert-santa-fe-family-photos",
    name: "Santa Fe Desert",
    keyword: "santa fe desert family photo",
    secondaryKeywords: [
      "southwest family portrait",
      "new mexico family photo",
      "desert family photo",
    ],
    image: "/samples/theme-desert-santa-fe.jpg",
    shortDescription: "Adobe walls, dusty turquoise sky, your family in the high desert.",
    related: [
      "national-geographic-family-photos",
      "autumn-cabin-family-photos",
      "lake-house-family-photos",
    ],
  },
  {
    slug: "cherry-blossom-family-photos",
    name: "Cherry Blossom",
    keyword: "cherry blossom family photo",
    secondaryKeywords: [
      "sakura family portrait",
      "spring family photo",
      "japan cherry blossom family",
    ],
    image: "/samples/theme-cherry-blossom.jpg",
    shortDescription: "Pink petals drifting, soft pastel light. Your family under blooming sakura.",
    related: [
      "spirited-away-family-photos",
      "ghibli-family-photos",
      "orchard-picking-family-photos",
    ],
  },
  {
    slug: "autumn-cabin-family-photos",
    name: "Autumn Cabin",
    keyword: "autumn cabin family photo",
    secondaryKeywords: ["fall family portrait", "cabin family photo", "autumn family photo"],
    image: "/samples/theme-autumn-cabin.jpg",
    shortDescription: "Orange leaves, wool sweaters, woodsmoke. Your family at the autumn cabin.",
    related: [
      "orchard-picking-family-photos",
      "lake-house-family-photos",
      "snowy-hygge-family-photos",
    ],
  },
  {
    slug: "orchard-picking-family-photos",
    name: "Apple Orchard",
    keyword: "apple orchard family photo",
    secondaryKeywords: [
      "apple picking family portrait",
      "fall orchard family photo",
      "pumpkin patch family photo",
    ],
    image: "/samples/theme-orchard-picking.jpg",
    shortDescription: "Wicker baskets, red apples, low fall sun. Your family in the orchard.",
    related: [
      "autumn-cabin-family-photos",
      "backyard-picnic-family-photos",
      "cherry-blossom-family-photos",
    ],
  },
  {
    slug: "lake-house-family-photos",
    name: "Lake House",
    keyword: "lake house family photo",
    secondaryKeywords: [
      "lakeside family portrait",
      "summer lake family photo",
      "cabin lake family photo",
    ],
    image: "/samples/theme-lake-house.jpg",
    shortDescription: "Wooden dock, still water, soft morning haze. Your family at the lake house.",
    related: [
      "autumn-cabin-family-photos",
      "golden-hour-beach-family-photos",
      "backyard-picnic-family-photos",
    ],
  },
  {
    slug: "golden-hour-beach-family-photos",
    name: "Golden Hour Beach",
    keyword: "golden hour beach family photo",
    secondaryKeywords: [
      "beach family portrait",
      "sunset beach family photo",
      "family beach photoshoot",
    ],
    image: "/samples/theme-golden-hour-beach.jpg",
    shortDescription:
      "Wet sand, low sun, rim light on everyone. Your family at the perfect beach hour.",
    related: [
      "amalfi-summer-family-photos",
      "lake-house-family-photos",
      "coastal-grandmother-family-photos",
    ],
  },
  {
    slug: "coastal-grandmother-family-photos",
    name: "Coastal Grandmother",
    keyword: "coastal grandmother family photo",
    secondaryKeywords: [
      "nantucket family portrait",
      "hamptons family photo",
      "coastal family aesthetic",
    ],
    image: "/samples/theme-coastal-grandmother.jpg",
    shortDescription:
      "Linen, hydrangeas, weathered shingle. Your family in coastal-grandmother quiet.",
    related: [
      "slim-aarons-family-photos",
      "amalfi-summer-family-photos",
      "kinfolk-kitchen-family-photos",
    ],
  },
  {
    slug: "snowy-hygge-family-photos",
    name: "Snowy Hygge",
    keyword: "snowy hygge family photo",
    secondaryKeywords: ["winter family portrait", "hygge family photo", "cozy winter family photo"],
    image: "/samples/theme-snowy-hygge.jpg",
    shortDescription:
      "Wool socks, candlelight, snow drift outside. Your family in deep hygge winter.",
    related: [
      "christmas-morning-family-photos",
      "autumn-cabin-family-photos",
      "sunday-sofa-family-photos",
    ],
  },
  {
    slug: "christmas-morning-family-photos",
    name: "Christmas Morning",
    keyword: "christmas morning family photo",
    secondaryKeywords: [
      "christmas family portrait",
      "holiday morning family photo",
      "tree-side family photo",
    ],
    image: "/samples/theme-christmas-morning.jpg",
    extraImages: ["/samples/theme-snowy-hygge.jpg", "/samples/theme-card-christmas-photo.jpg"],
    shortDescription:
      "Tree lights catching tinsel, pajamas everywhere, your family on Christmas morning.",
    related: [
      "snowy-hygge-family-photos",
      "sunday-sofa-family-photos",
      "norman-rockwell-family-photos",
    ],
  },
  {
    slug: "backyard-picnic-family-photos",
    name: "Backyard Picnic",
    keyword: "backyard picnic family photo",
    secondaryKeywords: [
      "summer picnic family portrait",
      "garden family photo",
      "backyard family photo",
    ],
    image: "/samples/theme-backyard-picnic.jpg",
    shortDescription:
      "Checkered blanket, golden grass, watermelon. Your family in the easy backyard light.",
    related: [
      "orchard-picking-family-photos",
      "lake-house-family-photos",
      "sunday-sofa-family-photos",
    ],
  },
  {
    slug: "kinfolk-kitchen-family-photos",
    name: "Kinfolk Kitchen",
    keyword: "kinfolk style family photo",
    secondaryKeywords: ["minimalist family portrait", "editorial kitchen family photo"],
    image: "/samples/theme-kinfolk-kitchen.jpg",
    shortDescription:
      "Linen apron, marble counter, soft north light. Your family in a Kinfolk kitchen.",
    related: [
      "coastal-grandmother-family-photos",
      "parisian-cafe-family-photos",
      "sunday-sofa-family-photos",
    ],
  },
  {
    slug: "sunday-sofa-family-photos",
    name: "Sunday Sofa",
    keyword: "cozy sunday family photo",
    secondaryKeywords: [
      "couch family portrait",
      "lazy sunday family photo",
      "home family portrait",
    ],
    image: "/samples/theme-sunday-sofa.jpg",
    shortDescription:
      "Soft throw, slow morning light, everyone piled in. Your family on a Sunday sofa.",
    related: [
      "kinfolk-kitchen-family-photos",
      "snowy-hygge-family-photos",
      "christmas-morning-family-photos",
    ],
  },
  {
    slug: "royal-family-portrait",
    name: "Royal Family Portrait",
    keyword: "royal family portrait",
    secondaryKeywords: [
      "royal family photo",
      "family portrait like royalty",
      "regal family portrait",
      "king queen family portrait",
    ],
    image: "/samples/theme-royal-family-portrait.png",
    shortDescription:
      "Velvet, crowns, grand halls, and old-world ceremony. Your family styled like royalty.",
    related: [
      "renaissance-oil-family-photos",
      "annie-leibovitz-family-photos",
      "norman-rockwell-family-photos",
    ],
  },
  {
    slug: "disney-world-family-photos",
    name: "Disney World",
    keyword: "disney world family photo",
    secondaryKeywords: [
      "disney family photo",
      "theme park family portrait",
      "magic kingdom family photo",
    ],
    image: "/samples/theme-disney-world.png",
    shortDescription:
      "Castle plaza, vacation clothes, snack sticks, and the family-trip photo everyone wanted.",
    related: [
      "golden-hour-beach-family-photos",
      "new-york-city-family-photos",
      "superhero-family-photos",
    ],
  },
  {
    slug: "national-park-family-photos",
    name: "National Park",
    keyword: "national park family photo",
    secondaryKeywords: [
      "national park family portrait",
      "yosemite family photo",
      "outdoor family adventure photo",
    ],
    image: "/samples/theme-national-park.png",
    shortDescription: "Granite cliffs, pine air, trail layers, and your family at the viewpoint.",
    related: [
      "lake-house-family-photos",
      "autumn-cabin-family-photos",
      "desert-santa-fe-family-photos",
    ],
  },
  {
    slug: "hawaii-family-photos",
    name: "Hawaii Vacation",
    keyword: "hawaii family photo",
    secondaryKeywords: [
      "hawaii family portrait",
      "hawaiian beach family photo",
      "family vacation photo hawaii",
    ],
    image: "/samples/theme-hawaii-vacation.png",
    shortDescription: "Palms, lava rock, leis, sunset water, and your family in island light.",
    related: [
      "golden-hour-beach-family-photos",
      "amalfi-summer-family-photos",
      "coastal-grandmother-family-photos",
    ],
  },
  {
    slug: "cape-cod-family-photos",
    name: "Cape Cod Summer",
    keyword: "cape cod family photo",
    secondaryKeywords: [
      "cape cod family portrait",
      "new england beach family photo",
      "coastal family portrait",
    ],
    image: "/samples/theme-cape-cod-summer.png",
    shortDescription:
      "Cedar shingles, hydrangeas, dune grass, navy stripes. Your family in Cape Cod summer.",
    related: [
      "coastal-grandmother-family-photos",
      "lake-house-family-photos",
      "golden-hour-beach-family-photos",
    ],
  },
] as const;

export const vibeBySlug = (slug: string) => VIBES.find((v) => v.slug === slug);
