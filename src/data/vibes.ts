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
    slug: "stacked-love-family-photos",
    name: "Stacked Love",
    keyword: "stacked family portrait",
    secondaryKeywords: [
      "black and white family portrait",
      "stacked love family photo",
      "viral family portrait trend",
      "studio family portrait white background",
    ],
    image: "/samples/theme-stacked-love.jpg",
    shortDescription:
      "A viral black-and-white studio portrait with everyone gently stacked together on a clean white backdrop.",
    related: [
      "annie-leibovitz-family-photos",
      "film-noir-family-photos",
      "vintage-polaroid-family-photos",
      "wes-anderson-family-photos",
    ],
  },
  {
    slug: "pop-icon-stage-family-photos",
    name: "Pop Icon Stage Portrait",
    keyword: "concert stage family portrait",
    secondaryKeywords: [
      "pop star stage family photo",
      "dramatic stage family photoshoot",
      "1980s concert portrait family photo",
    ],
    image: "/samples/theme-pop-icon-stage-portrait.png",
    shortDescription:
      "Spotlights, smoke, sharp tailoring, and high-contrast stage energy for a family portrait with pop-performance drama.",
    related: [
      "annie-leibovitz-family-photos",
      "film-noir-family-photos",
      "runway-editorial-family-photos",
    ],
  },
  {
    slug: "galactic-family-adventure-photos",
    name: "Galactic Family Adventure",
    keyword: "space adventure family portrait",
    secondaryKeywords: [
      "galactic family photoshoot",
      "space opera family portrait",
      "desert planet family photo",
    ],
    image: "/samples/theme-galactic-family-adventure.png",
    shortDescription:
      "Twin-sun horizons, hangar light, desert-world atmosphere, and heroic adventure without franchise cosplay.",
    related: ["superhero-family-photos", "national-park-family-photos", "royal-family-portrait"],
  },
  {
    slug: "iconic-crosswalk-album-cover-family-photos",
    name: "Iconic Crosswalk Album Cover",
    keyword: "crosswalk album cover family portrait",
    secondaryKeywords: [
      "music magazine family photo",
      "1960s editorial family portrait",
      "street crossing family photoshoot",
    ],
    image: "/samples/theme-iconic-crosswalk-album-cover.png",
    shortDescription:
      "A vertical editorial street-crossing portrait with classic music-magazine energy and original album-cover framing.",
    related: [
      "new-york-city-family-photos",
      "vintage-polaroid-family-photos",
      "wes-anderson-family-photos",
    ],
  },
  {
    slug: "runway-editorial-family-photos",
    name: "Runway Editor-in-Chief Family Editorial",
    keyword: "fashion editorial family portrait",
    secondaryKeywords: [
      "runway family photoshoot",
      "high fashion family portrait",
      "magazine editor family photo",
    ],
    image: "/samples/theme-runway-editorial.png",
    shortDescription:
      "Sharp tailoring, glossy magazine lighting, city-office polish, and confident runway-family energy.",
    related: [
      "annie-leibovitz-family-photos",
      "slim-aarons-family-photos",
      "pop-icon-stage-family-photos",
    ],
  },
  {
    slug: "noughties-family-throwback-photos",
    name: "Noughties Family Throwback",
    keyword: "noughties family portrait",
    secondaryKeywords: [
      "early 2000s family photo",
      "y2k family photoshoot",
      "mall photo family portrait",
    ],
    image: "/samples/theme-noughties-family-throwback.png",
    shortDescription:
      "Warm compact-camera flash, denim layers, sticker-album nostalgia, and a polished print-ready finish.",
    related: [
      "vintage-polaroid-family-photos",
      "70s-station-wagon-family-photos",
      "sunday-sofa-family-photos",
    ],
  },
  {
    slug: "dockside-family-weekend-photos",
    name: "Dockside Family Weekend",
    keyword: "dockside family photoshoot",
    secondaryKeywords: [
      "lake dock family portrait",
      "summer weekend family photo",
      "lake house family photoshoot",
    ],
    image: "/samples/theme-lake-house.jpg",
    shortDescription:
      "Weathered dock planks, lake sparkle, towels, totes, and long-weekend summer ease.",
    related: [
      "lake-house-family-photos",
      "cape-cod-family-photos",
      "golden-hour-beach-family-photos",
    ],
  },
  {
    slug: "backyard-sports-day-family-photos",
    name: "Backyard Sports Day Portrait",
    keyword: "backyard sports day family portrait",
    secondaryKeywords: [
      "family field day photo",
      "sports day family photoshoot",
      "backyard games family photo",
    ],
    image: "/samples/best-family-photo-prompts/soccer-team-family.webp",
    shortDescription:
      "Blank jerseys, lawn-game props, chalk lines, ribbons, sneakers, and bright field-day joy.",
    related: [
      "soccer-team-family-photos",
      "backyard-picnic-family-photos",
      "summer-color-pop-studio-family-photos",
    ],
  },
  {
    slug: "slow-travel-summer-picnic-family-photos",
    name: "Slow Travel Summer Picnic",
    keyword: "slow travel summer picnic family photo",
    secondaryKeywords: [
      "summer picnic family portrait",
      "travel picnic family photoshoot",
      "meadow picnic family photo",
    ],
    image: "/samples/theme-backyard-picnic.jpg",
    shortDescription:
      "Checked blanket, market fruit, paper maps, wildflowers, and unhurried travel light.",
    related: [
      "backyard-picnic-family-photos",
      "tuscan-summer-family-photos",
      "paris-family-stroll-family-photos",
    ],
  },
  {
    slug: "sunset-festival-family-glow-photos",
    name: "Sunset Festival Family Glow",
    keyword: "sunset festival family photo",
    secondaryKeywords: [
      "festival family portrait",
      "string lights family photoshoot",
      "summer festival family photo",
    ],
    image: "/samples/theme-card-new-years.jpg",
    shortDescription:
      "String lights, paper lanterns, fabric flags, and golden-hour festival warmth.",
    related: [
      "golden-hour-beach-family-photos",
      "noughties-family-throwback-photos",
      "pop-icon-stage-family-photos",
    ],
  },
  {
    slug: "summer-color-pop-studio-family-photos",
    name: "Summer Color Pop Studio",
    keyword: "summer color pop family studio portrait",
    secondaryKeywords: [
      "colorful studio family photo",
      "summer studio family photoshoot",
      "bright color block family portrait",
    ],
    image: "/samples/best-family-photo-prompts/white-cyclorama-exaggerated-faces.webp",
    shortDescription:
      "High-key studio light, bold color blocks, glossy summer props, and commercial polish.",
    related: [
      "white-cyclorama-family-photos",
      "backyard-sports-day-family-photos",
      "stacked-love-family-photos",
    ],
  },
  {
    slug: "whimsical-adventure-postcard-family-photos",
    name: "Whimsical Adventure Postcard",
    keyword: "whimsical adventure postcard family portrait",
    secondaryKeywords: [
      "storybook travel family photo",
      "illustrated postcard family portrait",
      "adventure postcard family photoshoot",
    ],
    image: "/samples/theme-watercolor-storybook.jpg",
    shortDescription:
      "Painted skies, oversized luggage, map edges, and original storybook travel charm.",
    related: [
      "watercolor-storybook-family-photos",
      "slow-travel-summer-picnic-family-photos",
      "fluffy-cloud-family-photos",
    ],
  },
  {
    slug: "retro-summer-postcard-family-photos",
    name: "Retro Summer Postcard",
    keyword: "retro summer postcard family photo",
    secondaryKeywords: [
      "nostalgic summer family portrait",
      "postcard family photoshoot",
      "summer vacation family photo",
    ],
    image: "/samples/theme-retro-summer-postcard.webp",
    shortDescription:
      "Sun-washed postcard color, retro stripes, linen layers, and soft film-camera vacation nostalgia.",
    related: [
      "cape-cod-family-photos",
      "golden-hour-beach-family-photos",
      "slow-travel-summer-picnic-family-photos",
    ],
  },
  {
    slug: "toy-box-keepsake-family-photos",
    name: "Toy-Box Keepsake Portrait",
    keyword: "toy box family portrait",
    secondaryKeywords: [
      "playroom family portrait",
      "nursery family photoshoot",
      "childhood keepsake family photo",
    ],
    image: "/samples/theme-toy-box-keepsake-portrait.webp",
    shortDescription:
      "Wooden blocks, storybooks, handmade toys, soft primary color, and bright playroom wonder.",
    related: [
      "noughties-family-throwback-photos",
      "sunday-sofa-family-photos",
      "watercolor-storybook-family-photos",
    ],
  },
  {
    slug: "cool-blue-lake-day-family-photos",
    name: "Cool Blue Lake Day",
    keyword: "cool blue lake family photo",
    secondaryKeywords: [
      "lake dock family portrait",
      "blue summer family photoshoot",
      "coastal lake family photo",
    ],
    image: "/samples/theme-cool-blue-lake-day.webp",
    shortDescription:
      "Crisp lake light, glacier-blue accents, linen and denim styling, and calm editorial freshness.",
    related: [
      "lake-house-family-photos",
      "dockside-family-weekend-photos",
      "coastal-grandmother-family-photos",
    ],
  },
  {
    slug: "poetcore-family-library-photos",
    name: "Poetcore Family Library Portrait",
    keyword: "poetcore family library portrait",
    secondaryKeywords: [
      "library family portrait",
      "literary family photoshoot",
      "cozy study family photo",
    ],
    image: "/samples/theme-poetcore-family-library-portrait.webp",
    shortDescription:
      "Warm shelves, oversized knits, vintage blazers, handwritten card details, and literary intimacy.",
    related: [
      "sunday-sofa-family-photos",
      "graduation-card-family-photos",
      "annie-leibovitz-family-photos",
    ],
  },
  {
    slug: "butter-yellow-summer-family-photos",
    name: "Butter Yellow Summer Portrait",
    keyword: "butter yellow summer family photo",
    secondaryKeywords: [
      "yellow summer family portrait",
      "butter yellow family photoshoot",
      "summer linen family photo",
    ],
    image: "/samples/theme-cape-cod-summer.png",
    shortDescription:
      "Butter-yellow wardrobe notes, pale florals, linen, and soft summer light in a polished family portrait.",
    related: [
      "cape-cod-family-photos",
      "scarf-garden-story-family-photos",
      "retro-summer-postcard-family-photos",
    ],
  },
  {
    slug: "scarf-garden-story-family-photos",
    name: "Scarf Garden Story",
    keyword: "scarf garden family portrait",
    secondaryKeywords: [
      "garden family photoshoot",
      "summer scarf family photo",
      "romantic garden family portrait",
    ],
    image: "/samples/theme-orchard-picking.jpg",
    shortDescription:
      "Silk-scarf color, leafy garden paths, soft flowers, and dappled light for an airy summer keepsake.",
    related: [
      "butter-yellow-summer-family-photos",
      "backyard-picnic-family-photos",
      "watercolor-storybook-family-photos",
    ],
  },
  {
    slug: "summer-color-hunt-family-photos",
    name: "Summer Color Hunt",
    keyword: "summer color hunt family photo",
    secondaryKeywords: [
      "colorful family photoshoot",
      "family color scavenger hunt portrait",
      "bright summer family photo",
    ],
    image: "/samples/theme-card-easter.jpg",
    shortDescription:
      "Flowers, fruit, color swatches, and bright discovery energy without brands, apps, or readable labels.",
    related: [
      "summer-color-pop-studio-family-photos",
      "backyard-picnic-family-photos",
      "retro-summer-postcard-family-photos",
    ],
  },
  {
    slug: "family-watch-party-photos",
    name: "Family Watch Party",
    keyword: "family watch party photo",
    secondaryKeywords: [
      "game day family portrait",
      "living room watch party family photo",
      "sports watch party family photoshoot",
    ],
    image: "/samples/theme-sunday-sofa.jpg",
    shortDescription:
      "A cozy living-room watch party with blank banners, snack bowls, pillows, and no real team marks.",
    related: [
      "backyard-sports-day-family-photos",
      "sunday-sofa-family-photos",
      "soccer-team-family-photos",
    ],
  },
  {
    slug: "ocean-explorer-card-family-photos",
    name: "Ocean Explorer Card",
    keyword: "ocean explorer family card",
    secondaryKeywords: [
      "ocean adventure family card",
      "shoreline family greeting card",
      "coastal explorer family photo",
    ],
    image: "/samples/theme-galactic-family-adventure.webp",
    shortDescription:
      "Tide-pool blues, shells, paper-map shapes, and clean greeting space for a family-safe adventure card.",
    related: [
      "cool-blue-lake-day-family-photos",
      "hawaii-vacation-family-photos",
      "cape-cod-family-photos",
    ],
  },
  {
    slug: "time-travel-toy-shelf-family-photos",
    name: "Time-Travel Toy Shelf",
    keyword: "time travel toy shelf family portrait",
    secondaryKeywords: [
      "toy shelf family portrait",
      "nostalgic toy family photoshoot",
      "miniature toy world family photo",
    ],
    image: "/samples/theme-time-travel-toy-shelf.webp",
    shortDescription:
      "A miniature shelf-world portrait with handmade toys, tiny time-capsule details, and warm nostalgia.",
    related: [
      "toy-box-keepsake-family-photos",
      "noughties-family-throwback-photos",
      "watercolor-storybook-family-photos",
    ],
  },
  {
    slug: "retro-jazz-porch-family-photos",
    name: "Retro Jazz Porch",
    keyword: "retro jazz porch family photo",
    secondaryKeywords: [
      "porch family portrait",
      "retro music family photoshoot",
      "vintage porch family photo",
    ],
    image: "/samples/theme-70s-station-wagon.jpg",
    shortDescription:
      "Vintage radio warmth, porch shade, brass accents, striped details, and a relaxed backyard rhythm.",
    related: [
      "70s-station-wagon-family-photos",
      "sunday-sofa-family-photos",
      "vintage-polaroid-family-photos",
    ],
  },
  {
    slug: "neo-deco-celebration-card-family-photos",
    name: "Neo Deco Celebration Card",
    keyword: "neo deco celebration family card",
    secondaryKeywords: [
      "art deco family card",
      "elegant celebration family portrait",
      "geometric family greeting card",
    ],
    image: "/samples/theme-neo-deco-celebration-card.webp",
    shortDescription:
      "Geometric arches, brass and chrome accents, cream-black-gold polish, and tasteful festive glamour.",
    related: [
      "new-years-card-family-photos",
      "birthday-card-family-photos",
      "runway-editorial-family-photos",
    ],
  },
  {
    slug: "crochet-raffia-picnic-card-family-photos",
    name: "Crochet & Raffia Picnic Card",
    keyword: "crochet raffia picnic family card",
    secondaryKeywords: [
      "summer picnic family card",
      "raffia picnic family portrait",
      "gingham picnic family photoshoot",
    ],
    image: "/samples/theme-crochet-raffia-picnic-card.webp",
    shortDescription:
      "Crochet texture, raffia basket details, gingham, citrus color, and natural dewy picnic light.",
    related: [
      "backyard-picnic-family-photos",
      "slow-travel-summer-picnic-family-photos",
      "retro-summer-postcard-family-photos",
    ],
  },
  {
    slug: "butter-yellow-picnic-family-photos",
    name: "Butter Yellow Picnic",
    keyword: "butter yellow picnic family photo",
    secondaryKeywords: [
      "butter yellow family picnic portrait",
      "summer picnic family photoshoot",
      "yellow picnic family portrait",
    ],
    image: "/samples/theme-butter-yellow-picnic.webp",
    shortDescription:
      "Cream blankets, fresh fruit, soft flowers, and butter-yellow accents in warm late-summer light.",
    related: [
      "backyard-picnic-family-photos",
      "slow-travel-summer-picnic-family-photos",
      "retro-summer-postcard-family-photos",
    ],
  },
  {
    slug: "paprika-plaid-autumn-family-photos",
    name: "Paprika Plaid Autumn",
    keyword: "paprika plaid autumn family photo",
    secondaryKeywords: [
      "plaid autumn family portrait",
      "paprika fall family photoshoot",
      "pre fall family portrait",
    ],
    image: "/samples/theme-paprika-plaid-autumn.webp",
    shortDescription:
      "Paprika, brick red, camel, denim, and subtle plaid layers with cozy pre-fall warmth.",
    related: [
      "autumn-cabin-family-photos",
      "orchard-picking-family-photos",
      "poetcore-family-library-photos",
    ],
  },
  {
    slug: "summerween-pumpkin-glow-family-photos",
    name: "Summerween Pumpkin Glow",
    keyword: "summerween pumpkin family card",
    secondaryKeywords: [
      "cute pumpkin family card",
      "summerween family portrait",
      "early Halloween family card",
    ],
    image: "/samples/theme-summerween-pumpkin-glow.webp",
    shortDescription:
      "Pastel pumpkins, friendly porch decorations, soft twilight, and warm lantern glow for a cute seasonal card.",
    related: [
      "halloween-card-family-photos",
      "polka-dot-porch-party-family-photos",
      "crochet-raffia-picnic-card-family-photos",
    ],
  },
  {
    slug: "storybook-forest-family-adventure-photos",
    name: "Storybook Forest Family Adventure",
    keyword: "storybook forest family portrait",
    secondaryKeywords: [
      "forest adventure family photo",
      "storybook family photoshoot",
      "enchanted forest family portrait",
    ],
    image: "/samples/theme-storybook-forest-family-adventure.webp",
    shortDescription:
      "Friendly oversized trees, mossy paths, wildflowers, and warm original storybook adventure polish.",
    related: [
      "watercolor-storybook-family-photos",
      "whimsical-adventure-postcard-family-photos",
      "toy-box-keepsake-family-photos",
    ],
  },
  {
    slug: "y3k-chrome-family-future-photos",
    name: "Y3K Chrome Family Future",
    keyword: "y3k chrome family portrait",
    secondaryKeywords: [
      "chrome family photoshoot",
      "futuristic family portrait",
      "silver future family photo",
    ],
    image: "/samples/theme-y3k-chrome-family-future.webp",
    shortDescription:
      "Chrome accessories, pearly white studio shapes, and gentle holographic highlights in an optimistic future portrait.",
    related: [
      "zero-gravity-family-photos",
      "summer-color-pop-studio-family-photos",
      "neo-deco-celebration-card-family-photos",
    ],
  },
  {
    slug: "polka-dot-porch-party-family-photos",
    name: "Polka Dot Porch Party",
    keyword: "polka dot porch party family card",
    secondaryKeywords: [
      "polka dot family card",
      "porch party family portrait",
      "pastel party family card",
    ],
    image: "/samples/theme-polka-dot-porch-party.webp",
    shortDescription:
      "Polka-dot details, bows, ribbons, flowers, and pastel porch-party charm with clean greeting space.",
    related: [
      "birthday-card-family-photos",
      "summerween-pumpkin-glow-family-photos",
      "crochet-raffia-picnic-card-family-photos",
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
    slug: "private-jet-family-photos",
    name: "Private Jet Family",
    keyword: "private jet family photo",
    secondaryKeywords: [
      "luxury family portrait",
      "private jet family photoshoot",
      "editorial family travel photo",
    ],
    image: "/samples/best-family-photo-prompts/private-jet-family.webp",
    shortDescription:
      "Cream leather seats, cabin window glow, polished travel details, and your family in a luxury editorial.",
    related: [
      "slim-aarons-family-photos",
      "runway-editorial-family-photos",
      "amalfi-summer-family-photos",
    ],
  },
  {
    slug: "soccer-team-family-photos",
    name: "Soccer Team Family",
    keyword: "soccer team family photo",
    secondaryKeywords: [
      "football squad family photo",
      "sports team family portrait",
      "stadium family photoshoot",
    ],
    image: "/samples/best-family-photo-prompts/soccer-team-family.webp",
    shortDescription:
      "Stadium lights, blank jerseys, muddy boots, and your family posed like a pre-game squad photo.",
    related: [
      "national-park-family-photos",
      "noughties-family-throwback-photos",
      "golden-hour-beach-family-photos",
    ],
  },
  {
    slug: "white-cyclorama-family-photos",
    name: "White Cyclorama Faces",
    keyword: "white cyclorama family photo",
    secondaryKeywords: [
      "studio family portrait white background",
      "exaggerated face family portrait",
      "high key family studio photo",
    ],
    image: "/samples/best-family-photo-prompts/white-cyclorama-exaggerated-faces.webp",
    shortDescription:
      "A clean white studio portrait with fashion-campaign light and a different exaggerated expression on every face.",
    related: [
      "stacked-love-family-photos",
      "annie-leibovitz-family-photos",
      "wes-anderson-family-photos",
    ],
  },
  {
    slug: "zero-gravity-family-photos",
    name: "Zero Gravity Family",
    keyword: "zero gravity family photo",
    secondaryKeywords: [
      "space station family portrait",
      "floating family photo",
      "sci fi family photoshoot",
    ],
    image: "/samples/best-family-photo-prompts/zero-gravity-family.webp",
    shortDescription:
      "Hair, toys, socks, and snacks floating in a bright space-station portrait with Earth outside the window.",
    related: [
      "galactic-family-adventure-photos",
      "superhero-family-photos",
      "cereal-box-family-photos",
    ],
  },
  {
    slug: "western-wanted-family-photos",
    name: "Western Wanted Family",
    keyword: "western wanted family photo",
    secondaryKeywords: [
      "wanted poster family portrait",
      "cowboy family photo",
      "old west family portrait",
    ],
    image: "/samples/best-family-photo-prompts/western-wanted-family.webp",
    shortDescription:
      "Sepia parchment, dusty outlaw poses, cowboy hats, saloon drama, and funny-serious wanted-poster faces.",
    related: [
      "royal-family-portrait",
      "norman-rockwell-family-photos",
      "vintage-polaroid-family-photos",
    ],
  },
  {
    slug: "fluffy-cloud-family-photos",
    name: "Fluffy Cloud Family",
    keyword: "cloud family photo",
    secondaryKeywords: [
      "family portrait on a cloud",
      "dreamy family photo",
      "pastel sky family portrait",
    ],
    image: "/samples/best-family-photo-prompts/fluffy-cloud-family.webp",
    shortDescription:
      "A dreamy portrait on a soft cloud at blue-pink sunrise, with pastel glow, cozy robes, and sky magic.",
    related: [
      "watercolor-storybook-family-photos",
      "cherry-blossom-family-photos",
      "zero-gravity-family-photos",
    ],
  },
  {
    slug: "cereal-box-family-photos",
    name: "Cereal Box Family",
    keyword: "cereal box family photo",
    secondaryKeywords: [
      "breakfast cereal family portrait",
      "cartoon packaging family photo",
      "family mascot illustration",
    ],
    image: "/samples/best-family-photo-prompts/cereal-box-family.webp",
    shortDescription:
      "Your family as cheerful mascots on a glossy breakfast cereal box, bright, playful, and supermarket-ready.",
    related: ["pixar-family-photos", "cartoon-family-photos", "noughties-family-throwback-photos"],
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
