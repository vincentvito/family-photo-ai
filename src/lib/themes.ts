import type { AspectRatio } from "./providers/types";

export type ThemeCategory = "photoreal" | "stylized" | "card";

/**
 * Structured prompt spec mapped 1:1 to the Nano Banana art-director framework:
 *   [Asset Type & Aspect Ratio] + [Subject & Action] + [Location/Setting]
 *   + [Camera/Composition] + [Lighting/Mood] + [Style/Aesthetic]
 * Explicit text (part 7) is only used for cards and is composed separately.
 */
export type PromptSpec = {
  /** Part 1. Medium + aspect ratio as a single crisp handle. */
  assetType: string;
  /** Part 2. What the family is DOING (identity comes from references). */
  subjectAction: string;
  /** Part 3. Physical environment + environmental detail. */
  location: string;
  /** Part 4. Camera, lens, angle, framing. For non-photo themes: viewpoint / engine. */
  camera: string;
  /** Part 5. Direction + quality of light + mood. */
  lighting: string;
  /** Part 6. Film stock / rendering engine / texture / palette. */
  style: string;
};

export type Theme = {
  id: string;
  name: string;
  blurb: string;
  category: ThemeCategory;
  /**
   * Which provider should handle this theme. Every current theme uses
   * `"nanobanana"` (Nano Banana Pro on Replicate). The `"replicate"` variant
   * is retained in the union for future routing hooks but no built-in theme
   * currently targets it.
   */
  provider: "nanobanana" | "replicate";
  coverImage: string;
  aspectRatio: AspectRatio;
  supportsPets: boolean;
  /** Structured, framework-ordered prompt spec. The composer weaves these into prose. */
  spec: PromptSpec;
  /** For cards: whether to surface the "card text" input. */
  acceptsCardText?: boolean;
};

export const THEMES: Theme[] = [
  // ─── Photoreal ───────────────────────────────────────────────────────
  {
    id: "golden-hour-beach",
    name: "Golden Hour Beach",
    blurb:
      "Warm, late-afternoon light on the sand. Linen and barefoot. Soft ocean in the background, long shadows, a little grain.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-golden-hour-beach.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 cinematic color photograph",
      subjectAction:
        "gathered close, mid-laugh or walking barefoot toward the tide, in warm linen and neutral tones, at ease with each other",
      location:
        "an open Atlantic-style coastal beach at summer's end, tide retreating over wet sand, low dunes and sea oats behind, horizon on the lower third",
      camera:
        "Hasselblad medium format with an 80mm f/2.8 lens, medium-wide eye-level framing, subjects slightly off-center left",
      lighting:
        "late golden-hour sunlight backlighting the family with a bright rim on hair and shoulders, sand-bounced warm fill, long soft cast shadows across the beach",
      style:
        "Kodak Portra 400, subtle natural film grain, warm muted palette, gentle image-wide bloom, no oversaturation",
    },
  },
  {
    id: "autumn-cabin",
    name: "Autumn Cabin",
    blurb:
      "A wood-sided cabin on a crisp October morning. Knits, boots, coffee mugs. Breath visible in the cold air.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-autumn-cabin.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 warm documentary color photograph",
      subjectAction:
        "gathered on and around the porch steps with steaming mugs, sharing a quiet laugh, breath faintly visible in the cool air, in chunky cable knits, wool coats and leather boots",
      location:
        "the weathered-cedar porch of a small cabin on a crisp October morning, amber and rust foliage filling the background, a stone step dusted with fallen leaves",
      camera:
        "Leica M6 on 35mm, 35mm Summilux f/2.0, natural medium framing just above eye-level, mild rule-of-thirds composition",
      lighting:
        "soft overcast north-facing daylight, gentle unidirectional fill from the sky, hint of amber bounce off the foliage, no direct sun",
      style:
        "Kodak Portra 400, characteristic warm-yellow midtones with soft teal shadows, organic film grain, honest un-retouched skin",
    },
  },
  {
    id: "kinfolk-kitchen",
    name: "Kinfolk Kitchen",
    blurb:
      "A quiet Sunday-morning kitchen. Flour dust in the light. Everyone doing something, no one posing.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-kinfolk-kitchen.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 candid documentary color photograph",
      subjectAction:
        "scattered through the kitchen, each doing something small — kneading dough, pouring coffee, passing fruit, a child peeking up from the counter — no posing, no eye contact with the camera",
      location:
        "a bright, plant-filled kitchen on a Sunday morning, pale-wood island, stoneware bowls, a linen runner, flour dust hanging in a sunbeam",
      camera:
        "Fuji GFX medium format, 63mm f/2.8, waist-level documentary framing, loose rule-of-thirds with negative space toward a window",
      lighting:
        "soft directional window light raking across the island, airy highlight roll-off, gentle wall bounce, no artificial fill",
      style:
        "Fuji Pro 400H muted highlights, soft magenta-to-green color palette, barely-there grain, airy Kinfolk-magazine sensibility",
    },
  },
  {
    id: "vintage-polaroid",
    name: "Vintage Polaroid",
    blurb:
      "Instant film, slightly faded. The kind of picture you'd find in a shoebox in your grandmother's attic.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-vintage-polaroid.jpg",
    aspectRatio: "1:1",
    supportsPets: true,
    spec: {
      assetType:
        "A 1:1 square vintage instant-film snapshot with a distinctive thick white paper border on the bottom",
      subjectAction:
        "squeezed close on a living-room couch for a snapshot, imperfect expressions, one person blinking, the family dog squirming — captured in a single Polaroid frame",
      location:
        "a late-1970s home interior with period-correct wood paneling, earthtone carpet, a macramé wall hanging and a pendant lamp",
      camera:
        "SX-70 Polaroid camera, fixed normal lens at arm's length, straight-on composition, gentle lens imperfections and corner falloff",
      lighting:
        "on-camera bulb flash, hotspot on faces, rolled-off shadows behind, slight motion blur on one subject",
      style:
        "SX-70 integral instant film, soft focus, milky contrast, warm yellow-green cast from aged chemistry, visible white-on-bottom paper border, minor handling scuffs",
    },
  },
  {
    id: "leibovitz-studio",
    name: "Leibovitz Studio",
    blurb:
      "Editorial, cinematic. A painted backdrop, theatrical side-light, everyone styled with intent.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-leibovitz.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 editorial magazine studio portrait",
      subjectAction:
        "arranged in a deliberate painterly grouping, tailored and unified, one subject caught in a quieter unscripted glance that anchors the frame",
      location:
        "a high-ceiling studio set with a hand-painted canvas Old-Master backdrop in deep umber and muted teal, polished stone floor",
      camera:
        "Hasselblad H6D-100c, 100mm f/2.8 lens, waist-up framing, classical triangular composition, shallow depth of field",
      lighting:
        "single large diffused key from camera-right at 45° Rembrandt angle, deep controlled falloff, subtle silver bounce fill, a hair light grazing shoulders",
      style:
        "digital medium format with a painterly chiaroscuro color grade, Kodak Portra 160 film emulation, rich creamy skin tones, gallery-print finish",
    },
  },
  {
    id: "wes-anderson",
    name: "Wes Anderson Symmetry",
    blurb:
      "Dead-center framing, pastel wardrobe. A dollhouse interior where everyone is oddly serious.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-wes-anderson.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 cinematic film still at a 1.85:1 aspect",
      subjectAction:
        "lined up dead-center, facing camera with flat deadpan expressions, each holding a small coordinated prop, frozen mid-moment",
      location:
        "a storybook dollhouse-styled interior with ornate pastel wallpaper, wainscoting, a patterned rug centered to the frame, symmetric decor on both walls",
      camera:
        "Arri Alexa 35 with vintage Cooke S4 50mm prime, perfectly centered head-on composition, 1.85:1 flat crop",
      lighting:
        "even flat frontal soft key, zero dramatic shadow, gentle practical warm light sources visible in frame",
      style:
        "Kodak Vision3 250D color-negative LUT, pastel palette (butter yellow, salmon, mint, dusty pink), matte finish, storybook color grade reminiscent of Wes Anderson cinematography",
    },
  },
  {
    id: "national-geographic",
    name: "National Geographic Expedition",
    blurb:
      "On a windswept ridge at dawn. Technical outerwear, real weather, real awe.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-natgeo.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 documentary expedition photograph",
      subjectAction:
        "paused together on the ridge, looking out toward the valley, one subject adjusting a pack strap, in earth-tone technical outerwear, weathered and genuinely present",
      location:
        "a windswept alpine ridge at dawn, layered mountain silhouettes receding into distance, patches of low mist, scree and tundra underfoot",
      camera:
        "Nikon Z9 with 24-70mm f/2.8, 35mm field of view, low three-quarter angle, subjects placed on the right third with the valley opening to the left",
      lighting:
        "low cold dawn sun breaking through cloud layers, long cool-blue shadows, warm sun kiss on the ridgeline, high shadow detail",
      style:
        "Kodak Ektachrome E100 emulation, rich saturated earth palette, subtle grain, high micro-contrast, National-Geographic-magazine color character",
    },
  },
  {
    id: "film-noir",
    name: "Film Noir",
    blurb:
      "Black-and-white, venetian-blind shadows. The family as a moody detective vignette.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-film-noir.jpg",
    aspectRatio: "4:5",
    supportsPets: false,
    spec: {
      assetType: "A 4:5 high-contrast black-and-white film photograph",
      subjectAction:
        "arranged in a tight noir vignette, one subject lighting a cigarette (unlit — just the gesture), another glancing over a shoulder, 1940s tailoring and silk, held in quiet suspense",
      location:
        "a dim 1940s office interior with a wooden venetian blind casting hard stripes across the scene, heavy wood desk, brass lamp, smoke in the air",
      camera:
        "Leica Monochrom with a 35mm Summilux f/1.4, three-quarter composition, low-key shadows dominating two thirds of the frame",
      lighting:
        "single hard-cut key from a window behind the venetian blind, sharp slatted shadow pattern across faces and wall, no fill, deep silver blacks",
      style:
        "Ilford HP5 Plus 400 pushed to 800, heavy silver-gelatin grain, crushed blacks, specular highlights on silk, classic noir tonal range",
    },
  },
  {
    id: "christmas-morning",
    name: "Christmas Morning",
    blurb:
      "The tree in the background, pajamas, warm lamplight. Somewhere between chaos and calm.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-christmas-morning.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 candid tender color photograph",
      subjectAction:
        "clustered on the floor and couch in mismatched flannel pajamas, holding mugs of cocoa, mid-laugh over a just-opened present, a dog worming into the frame",
      location:
        "a lived-in living room on Christmas morning, a decorated tree glowing with warm string lights behind, scattered ribbon and paper on the rug, a stocking on the mantel",
      camera:
        "Leica Q2 with its built-in 28mm Summilux f/1.7, low seated-level framing, loose composition with the tree and lights on the right third",
      lighting:
        "warm interior lamplight + string-light bokeh behind, gentle window fill from camera-left, overall low-key and cozy",
      style:
        "Cinestill 800T emulation, warm tungsten shadow roll, luminous highlight halation on the tree lights, soft organic grain",
    },
  },
  {
    id: "tuscan-summer",
    name: "Tuscan Summer",
    blurb:
      "Late afternoon on a stone villa terrace. Cypress trees, olive groves, warm limestone, linen and leather.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-tuscan-summer.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 editorial documentary photograph",
      subjectAction:
        "gathered around a stone table with a glass carafe of water and a handful of sliced peaches, one subject pouring, another leaning on the terrace wall, in linen and neutral tones",
      location:
        "a Tuscan villa terrace overlooking cypress-dotted hills and olive groves at late afternoon, aged limestone walls, terracotta tiles underfoot, a fig tree in a clay pot",
      camera:
        "Contax 645 medium format with an 80mm f/2 Zeiss Planar, chest-level framing, subjects placed left-of-center with the valley opening to the right",
      lighting:
        "warm Mediterranean low-angle sun from camera-right, soft limestone-bounced fill, long amber shadows across the terrace, pale blue sky",
      style:
        "Kodak Portra 400 medium format, creamy highlight roll-off, warm sun-washed palette, subtle grain, languid editorial mood",
    },
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    blurb:
      "Pink petals drifting in a Kyoto garden at spring's first warmth. Cotton, film, quiet.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-cherry-blossom.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 tender documentary color photograph",
      subjectAction:
        "walking slowly along a petal-strewn path, one subject looking up at the branches, another reaching out as a petal lands, in cotton layers and muted neutrals",
      location:
        "a traditional Japanese garden in early spring, sakura trees in full bloom arching overhead, stone lanterns and a mossy path, a glimpse of a wooden bridge behind",
      camera:
        "Pentax 67II medium format with a 105mm f/2.4 lens, three-quarter portrait framing, shallow depth compressing the blossom bokeh",
      lighting:
        "tranquil diffused morning light filtered through the canopy, soft dappled highlights on faces and petals drifting in the air",
      style:
        "Kodak Portra 160 medium format, softly desaturated Japanese spring palette — cream, blush, pale green — fine organic grain, poetic quiet",
    },
  },
  {
    id: "snowy-hygge",
    name: "Snowy Hygge",
    blurb:
      "A timber cabin doorway during a Scandinavian snowfall. Wool, lanternlight, breath in the cold.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-snowy-hygge.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 warm Nordic documentary photograph",
      subjectAction:
        "gathered in the lit doorway of the cabin, brushing snow off a shoulder, one subject holding a lantern, breath softly visible in the cold air, in chunky wool cable knits and felt boots",
      location:
        "the timber-plank doorway of a small Nordic cabin during an evening snowfall, snow settled on the eaves and ground, glowing windows beside, pines dusted with snow",
      camera:
        "Leica M10 with a 50mm Summilux f/1.4, natural chest-level composition, doorway acting as an internal frame around the family",
      lighting:
        "warm amber light spilling from the cabin interior and the lantern onto faces, cool-blue dusk snow light filling the exterior, highlights on falling snow",
      style:
        "Kodak Portra 400, characteristic warm-interior-against-cool-exterior tonal split, soft halation on the lantern, subtle grain, hygge palette",
    },
  },
  {
    id: "desert-santa-fe",
    name: "Desert · Santa Fe",
    blurb:
      "Adobe walls and open sky, the red earth of the American Southwest at dusk.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-desert-santa-fe.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 warm Southwest documentary photograph",
      subjectAction:
        "standing against a sunlit adobe wall, relaxed and slightly apart, in linen and chambray with one turquoise accent, wind softly lifting a sleeve",
      location:
        "a Santa Fe adobe compound at golden hour, earthen walls glowing, cottonwoods silhouetted, red desert dust drifting low, wide Southwest sky above",
      camera:
        "Mamiya 7 medium format with an 80mm f/4, shoulder-level straight-on composition, generous sky in the upper third",
      lighting:
        "low-angle warm sun from camera-left, long dramatic shadows along the adobe, subtle warm bounce filling faces, cool dusk blue just starting in the sky",
      style:
        "Kodak Ektachrome E100 emulation, terracotta-forward palette with cobalt sky, rich micro-contrast, fine grain, Southwest editorial warmth",
    },
  },
  {
    id: "parisian-cafe",
    name: "Parisian Café",
    blurb:
      "A sidewalk table on a narrow cobblestone street. Croissants, espresso, old-world softness.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-parisian-cafe.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 editorial documentary photograph",
      subjectAction:
        "seated around a small round marble café table, one lifting an espresso, another tearing a croissant, unhurried and at ease, in linen and wool in muted neutrals",
      location:
        "a narrow cobblestone Paris street in early morning, rattan café chairs on the sidewalk, a painted café awning just out of frame, a bicycle leaned against a stone wall",
      camera:
        "Leica Q2 with its 28mm Summilux f/1.7, slight low angle from across the table, loose composition with the street opening behind",
      lighting:
        "soft overcast Paris morning light, cool white sky as the main source, gentle warm bounce from the limestone buildings, no direct sun",
      style:
        "Kodak Portra 400 with a cool-Paris grade, muted café-neutral palette, fine grain, documentary-elegant finish",
    },
  },
  {
    id: "lake-house",
    name: "Lake House",
    blurb:
      "The long wooden dock, warm water behind, a retriever at the edge. Summer ease.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-lake-house.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 warm summer-evening documentary photograph",
      subjectAction:
        "gathered barefoot at the end of a long dock, one subject sitting with feet dangling toward the water, another standing, a golden retriever near the edge, in linen and cotton",
      location:
        "a weathered wooden dock stretching out over a still freshwater lake at late evening, reflected pine silhouettes, a rowboat tied at the post, warm horizon glow",
      camera:
        "Contax 645 medium format with 80mm f/2, low eye-level framing along the length of the dock, horizon on the lower third",
      lighting:
        "low-angle golden sunset light from camera-right, warm sun skimming faces, pink-orange reflection on the water, long soft shadows down the dock",
      style:
        "Kodak Portra 400 medium format, languid summer-dusk palette, soft halation on the horizon, fine grain, nostalgic editorial finish",
    },
  },

  {
    id: "slim-aarons",
    name: "Slim Aarons Poolside",
    blurb:
      "Palm Springs at high noon. Mid-century luxury, a turquoise pool, palm shadows long across the deck.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-slim-aarons.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 high-society color photograph in the Slim Aarons tradition",
      subjectAction:
        "lounging unhurried on white sun loungers around a turquoise pool, one subject mid-stretch reaching for a glass tumbler, another floating on a raft, polished-casual resort wardrobe in cream, white and pop-coral",
      location:
        "the deck of a mid-century modern Palm Springs villa, butterfly chairs, a row of date-palms, the San Jacinto mountains hazy in the distance, cobalt sky, an aqua-tiled pool dominating the foreground",
      camera:
        "Pentax 67 medium format with a 105mm f/2.4, slightly elevated three-quarter angle from the deck rail, generous breathing room around subjects",
      lighting:
        "high-noon Californian sun, hard architectural shadows raked across the deck, water-bounce highlights on faces, polarized cobalt sky",
      style:
        "Kodak Ektachrome E100 emulation, saturated mid-century palette of aqua, cream, terracotta and palm green, micro-contrast, Slim-Aarons high-society polish",
    },
  },
  {
    id: "y2k-disposable",
    name: "Y2K Disposable Flash",
    blurb:
      "On-camera flash, hot faces, slightly off-center. The kind of family pic stuck under a fridge magnet circa 2003.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-y2k-disposable.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 amateur snapshot from a single-use disposable camera",
      subjectAction:
        "squeezed close in a candid huddle, mid-laugh with imperfect expressions, one subject blinking, another looking off-frame, in early-2000s wardrobe — bootcut jeans, layered tees, juicy-tracksuit casual",
      location:
        "a lived-in early-2000s home interior — beige carpet, a CRT television in the background, a refrigerator covered in magnets, framed family photos on the wall",
      camera:
        "Kodak Funsaver disposable camera, fixed 32mm plastic lens at f/9, on-camera bulb flash, arm's-length framing",
      lighting:
        "harsh on-camera flash, hot center hotspot on the nearest faces, rapid falloff into the background, slight red-eye on subjects looking at lens",
      style:
        "low-ISO drugstore-developed 35mm color print, soft focus, slight motion blur, Y2K-era warm-magenta cast, visible date stamp in the lower-right corner reading a 2003 timestamp",
    },
  },
  {
    id: "coastal-grandmother",
    name: "Coastal Grandmother",
    blurb:
      "A linen-and-marble Hamptons kitchen, fresh hydrangeas, iced tea. The Nancy-Meyers movie still you wish you lived in.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-coastal-grandmother.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 lifestyle editorial photograph",
      subjectAction:
        "gathered around a sun-bleached marble island, one pouring iced tea from a glass pitcher, another arranging a hydrangea bouquet, a child perched on a stool with a pastry, all in unhurried casual elegance, in linen and chambray with a cream apron",
      location:
        "a Hamptons-style coastal kitchen with white shaker cabinetry, an aged-brass faucet, an open dutch door framing a glimpse of dune grass, a vase of fresh hydrangeas, basket of lemons",
      camera:
        "Leica Q2 with its 28mm Summilux f/1.7, waist-level documentary framing, slight rule-of-thirds bias toward the dutch door",
      lighting:
        "soft directional white light from the dutch door, airy highlight roll on the marble, gentle sea-breeze diffused fill, no direct sun",
      style:
        "Kodak Portra 160, characteristic creamy-neutral palette of beige, ivory, oat and seafoam, fine grain, Nancy-Meyers magazine-editorial polish",
    },
  },
  {
    id: "amalfi-summer",
    name: "Amalfi Summer",
    blurb:
      "A Positano terrace at lunch — lemon prints, blue-and-white tile, the Tyrrhenian sea wide open behind.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-amalfi-summer.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 sun-drenched editorial photograph",
      subjectAction:
        "gathered around a long lunch table on a cliffside terrace, one subject pouring chilled limoncello, another reaching for fresh focaccia, a child on a wrought-iron chair holding a lemon, in white linen with a single lemon-print accent",
      location:
        "a Positano-style terrace cut into the cliffside, blue-and-white majolica tile underfoot, terracotta lemon trees along the railing, vibrant cascading bougainvillea, the cobalt Tyrrhenian sea stretching to the horizon",
      camera:
        "Leica M10 with a 50mm Summilux f/1.4, eye-level slightly low angle from the table edge, generous sea opening on the right third",
      lighting:
        "high-key midday Italian sun, white limewash walls bouncing fill into faces, glittering specular highlights on glass and the sea",
      style:
        "Kodak Portra 400, sun-bleached Mediterranean palette of cobalt, white, lemon-yellow and bougainvillea-pink, fine grain, White-Lotus editorial polish",
    },
  },
  {
    id: "70s-station-wagon",
    name: "70s Station Wagon",
    blurb:
      "A wood-paneled wagon at a desert pull-off. Period-perfect wardrobe, a thermos, the open road behind.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-70s-station-wagon.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 vintage Americana road-trip photograph from circa 1976",
      subjectAction:
        "piled around a wood-paneled station wagon at a roadside pull-off, one subject leaning against the hood, another on the open tailgate with a thermos, a child with a sticker-covered suitcase, in flared corduroy, gingham, and earth-tone knits",
      location:
        "a Route-66-style high-desert pull-off at late afternoon, mesa silhouettes in the distance, a faded gas-station sign, the asphalt shoulder still warm",
      camera:
        "Nikon F2 SLR with a 50mm f/1.4 Nikkor, eye-level three-quarter framing, the wagon angled to lead the eye toward the road",
      lighting:
        "low-angle golden afternoon sun from camera-right, warm dust haze in the air, long shadows trailing across the asphalt",
      style:
        "Kodachrome 64 emulation, characteristic deep reds, mustard yellows and forest greens, organic film grain, period-correct slightly-faded color cast",
    },
  },

  // ─── Stylized ───────────────────────────────────────────────────────
  {
    id: "pixar-family",
    name: "Pixar Family",
    blurb: "Rendered like a Pixar short. Soft stylized features, but still you.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-pixar.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 Pixar-quality 3D animated hero frame",
      subjectAction:
        "stylized as Pixar characters — softened features that still read as the real family, expressive eyes, a shared moment of warmth or laughter",
      location:
        "a sunlit Pixar-lit interior-exterior balance, warm practicals in the background, environmental props evoking a family den or garden",
      camera:
        "cinematic wide-screen hero composition, virtual 35mm-equivalent lens at f/2.0 with shallow depth of field, rule-of-thirds with the family slightly left-of-center",
      lighting:
        "volumetric warm key with soft bounce, rim light separating subjects from background, subsurface scattering on skin, gentle dust motes in light beams",
      style:
        "Pixar RenderMan physically-based render, subsurface-scattered stylized skin, warm cinematic color grade, Pixar-short polish, no CG plastic-look",
    },
  },
  {
    id: "manga-family",
    name: "Manga / Anime",
    blurb:
      "Hand-drawn lines, cel-shaded color. A quiet Studio Ghibli family moment.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-manga.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 hand-drawn anime illustration",
      subjectAction:
        "the family standing together on a breezy hillside, hair and clothing softly animated by wind, a simple quiet gesture between them",
      location:
        "a pastoral Ghibli-style summer landscape with tall grass, distant cumulus clouds, a winding dirt path and one large solitary tree",
      camera:
        "wide painterly framing with the family on the right third and the landscape opening to the left, slightly low horizon",
      lighting:
        "warm afternoon sun from camera-right, painted sky highlights, soft cel-shaded shadows on faces and clothing",
      style:
        "Studio Ghibli traditional cel-animation look, hand-painted watercolor backgrounds, clean ink linework, gentle pastel-warm palette, Miyazaki atmosphere",
    },
  },
  {
    id: "superhero-family",
    name: "Superhero Family",
    blurb:
      "Costumes, capes, the whole family on a rooftop at golden hour. The dog has a cape too.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-superhero.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 blockbuster superhero movie promotional still",
      subjectAction:
        "arranged in a confident hero group pose, capes billowing in wind, each subject with a distinct coordinated costume, a pet in a matching tiny cape at the front",
      location:
        "a city rooftop at golden hour, sweeping skyline behind with distant skyscrapers catching the sun, antennas and water tanks, low wind kicking up dust",
      camera:
        "Arri Alexa LF with a 35mm anamorphic lens, slightly low heroic angle, wide composition with the family centered against the skyline",
      lighting:
        "strong warm golden-hour rim from behind camera-right, cinematic practical haze, dramatic lens flare, cool bounce fill from the urban shade",
      style:
        "photoreal Marvel-Studios cinematography aesthetic, anamorphic lens character (oval bokeh, horizontal flares), high-contrast cinematic color grade, costumes in rich saturated color",
    },
  },
  {
    id: "saturday-morning",
    name: "Saturday Morning Cartoon",
    blurb:
      "A hand-drawn 90s cartoon frame. Bright primary colors, cheerful chaos.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-cartoon.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 1990s Saturday-morning hand-drawn cartoon cel",
      subjectAction:
        "the family sitting around a kitchen table mid-breakfast, cereal flying, wide open-mouth laughter, exaggerated gestures",
      location:
        "a sunny 1990s cartoon kitchen with a yellow fridge, gingham curtains, a cereal box on the table, a dog under the chair",
      camera:
        "flat head-on cartoon framing with a slight tilt-down, characters occupying the full width, broad cartoon proportions",
      lighting:
        "even flat cel-animation lighting with simple cast shadows, no rendered gradients, clear daylight from a window",
      style:
        "1990s hand-drawn cel animation on paint-textured backgrounds, bold black ink outlines, flat bright primary palette (red, yellow, blue), cheerful broadcast-TV color character",
    },
  },
  {
    id: "ghibli-countryside",
    name: "Ghibli Countryside",
    blurb:
      "Studio-Ghibli warmth. Rolling meadows, watercolor skies, a quiet afternoon in the wind.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-ghibli-countryside.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 Studio-Ghibli-style hand-painted illustration",
      subjectAction:
        "the family standing on a rise in a meadow, hair and summer clothing catching the wind, one small gesture of pointing toward the horizon",
      location:
        "rolling green countryside meadows under a vast watercolor sky, tall grass rippling in wind, softly-painted cumulus clouds, a distant winding road",
      camera:
        "wide painterly composition with a low horizon placing the sky on the upper two thirds, family centered on a rise",
      lighting:
        "warm nostalgic afternoon sun, soft painted highlights in the grass, gentle cel-shaded shadows",
      style:
        "Studio Ghibli traditional animation aesthetic, hand-drawn ink linework, painterly watercolor washes, Miyazaki color harmony of warm greens, cream and sky-blue",
    },
  },
  {
    id: "renaissance-oil",
    name: "Renaissance Oil",
    blurb:
      "The family as a Dutch-master painting. Deep umbers, candlelight, stillness.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-renaissance-oil.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 Dutch-Golden-Age style oil painting on canvas",
      subjectAction:
        "arranged as a 17th-century Dutch family portrait — tailored velvet and wool, one hand resting on another's shoulder, a book held open, all in quiet ceremonial stillness",
      location:
        "a dim wood-paneled 17th-century interior with a heavy curtain pulled aside, a pewter pitcher and a pomegranate on a small table, shadow pooling behind",
      camera:
        "classical triangular composition, slightly low eye-level, three-quarter portrait framing with a tabletop still-life in the lower third",
      lighting:
        "single warm candlelight from camera-left in Rembrandt angle, deep controlled falloff, chiaroscuro on faces, specular highlight on fabric and skin",
      style:
        "visible oil-on-canvas brushwork with subtle impasto on highlights, Vermeer-and-Rembrandt palette of deep umber, ochre and muted teal, canvas grain texture, museum-print finish",
    },
  },
  {
    id: "yellow-cartoon",
    name: "Simpson",
    blurb:
      "Springfield-style cartoon. Bright primary colors, four-finger hands, affectionate chaos.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-yellow-cartoon.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 1990s Springfield-style prime-time animated cel",
      subjectAction:
        "the family seated on a living-room couch in a broadcast couch-gag pose, exaggerated simplified features, open-mouthed grins, a dog tumbling in from one side",
      location:
        "a Springfield-ish living room with a floor lamp, a cheap framed painting on the wall, a patterned rug and a television out of frame",
      camera:
        "flat head-on broadcast composition, family filling the frame horizontally, slight downward tilt",
      lighting:
        "flat even cel-animation lighting with single drop-shadow per character, no gradients",
      style:
        "late-90s prime-time TV cel animation, bold black ink outlines, flat bright primary colors (yellow skin, red/blue/green wardrobe), four-finger hands, broadcast-NTSC color character",
    },
  },
  {
    id: "lego-family",
    name: "Lego",
    blurb:
      "The family rebuilt in plastic bricks. Glossy cylinder hair, C-shaped hands, tiny smiles.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-lego-family.jpg",
    aspectRatio: "1:1",
    supportsPets: true,
    spec: {
      assetType:
        "A 1:1 photoreal CGI render of plastic toy-brick minifigures",
      subjectAction:
        "a family group of minifigures standing together on a brick base, cylindrical hair pieces, C-shaped hands, tiny printed smiles, a tiny minifigure-scale dog beside them",
      location:
        "a brick-built domestic set — a miniature porch, a little tree, a picket fence — assembled from visible studded toy bricks, a smooth brick floor",
      camera:
        "macro product photography framing, 100mm macro lens at f/4, low eye-level matching the minifigure scale, square composition centered on the family",
      lighting:
        "warm cinematic studio key from camera-right, soft silver bounce fill, gentle rim light catching the plastic gloss, soft ground shadow",
      style:
        "physically-based CGI render with accurate glossy ABS plastic material, micro-scratches and fingerprint hints on the bricks, shallow depth of field, photoreal product-photography polish",
    },
  },
  {
    id: "watercolor-storybook",
    name: "Watercolor Storybook",
    blurb:
      "A children's-book illustration of the family. Soft washes, hand-lettered warmth.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-watercolor-storybook.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType:
        "A 4:5 hand-painted watercolor children's storybook illustration",
      subjectAction:
        "the family walking hand-in-hand through a whimsical garden, one pointing at a lantern tree, a small dog trotting alongside, softened painterly proportions",
      location:
        "a magical garden at dusk with paper-lantern-like flowers, tall wildflowers, a curving cobbled path and a distant cottage with warm lit windows",
      camera:
        "gentle low-angle storybook framing, family left-of-center, path and cottage drawing the eye to the background",
      lighting:
        "soft warm dusk glow from the lanterns, cool-violet sky washes, delicate highlights on petals and faces",
      style:
        "traditional watercolor on cold-press paper, delicate ink linework, visible paper grain, Beatrix-Potter-meets-Oliver-Jeffers sensibility, warm nostalgic palette",
    },
  },

  {
    id: "spirited-away",
    name: "Spirited Away",
    blurb:
      "A bridge in a lantern-lit bath-house town. Steam rising, paper lanterns warm, a small spirit beside the family.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-spirited-away.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 hand-painted Studio-Ghibli illustration in the Spirited-Away tradition",
      subjectAction:
        "the family standing together on an ornate wooden bridge, gentle awe on each face, one reaching out toward a paper lantern drifting upward, a small soft spirit-creature trotting alongside",
      location:
        "a mystical bath-house town at twilight, glowing red paper lanterns lining the eaves, soft steam rising from a bath-house entrance, distant train tracks running across still water, indigo dusk above",
      camera:
        "wide painterly composition with the family centered on the bridge, low horizon placing the bath-house buildings in the upper third",
      lighting:
        "warm crimson lantern glow keying faces from the side, cool indigo dusk fill from the sky, magical-hour ambient softness",
      style:
        "Hayao Miyazaki / Studio Ghibli hand-painted backgrounds, watercolor washes, ink linework, Spirited-Away signature palette of crimson, indigo, warm cream and gold lantern light",
    },
  },
  {
    id: "south-park",
    name: "South Park",
    blurb:
      "Construction-paper cutouts on a snowy mountain street. Tiny ovoid bodies, big circle eyes, deadpan smiles.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-south-park.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 South-Park-style construction-paper cutout animation cel",
      subjectAction:
        "the family lined up along a snowy sidewalk in basic chunky winter coats and beanies, ovoid bodies, perfectly round white eyes with tiny black pupils, mouths slightly open mid-sentence, a small cutout family pet beside them",
      location:
        "a small Colorado mountain-town main street under flat snowfall, simple flat A-frame houses with smoke chimneys, a yellow school bus parked in the background, a wooden 'Welcome' sign",
      camera:
        "flat dead-on cartoon framing, characters lined up like a TV episode title card, broad horizontal composition",
      lighting:
        "flat even cartoon lighting, no rendered shadows, bright clear daylight against the snow",
      style:
        "Matt-Stone-and-Trey-Parker construction-paper cutout aesthetic, visible paper textures and rough scissor edges, basic black ink outlines, bright primary palette against pale snow, classic South-Park finish",
    },
  },
  {
    id: "the-sims",
    name: "The Sims",
    blurb:
      "Plumbobs floating overhead, Sim faces mid-animation, a perfectly built living room. The whole family — but in The Sims 4.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-the-sims.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 in-game render in the style of The Sims 4",
      subjectAction:
        "the family in a Sims living room, each with a glowing green plumbob floating just above their head, faces in mid-Sim animation — slightly smiling, gesturing with stiff Sim hands, a Sim pet animated beside them",
      location:
        "a customized Sims build interior — modern furniture, a fireplace with a framed family painting above it, a window looking out onto a Sims neighborhood, a fully-furnished kitchen visible through an arch",
      camera:
        "three-quarter overhead Sims gameplay camera angle, slight isometric perspective, wide framing covering the living-room set",
      lighting:
        "even cinematic Sims rendering, soft directional fill, gentle ambient occlusion, no harsh shadows",
      style:
        "EA Maxis The Sims 4 renderer aesthetic, slightly stylized PBR materials, signature green diamond plumbob, characteristic Sim face proportions and skin shaders, glossy Maxis-stamped finish",
    },
  },
  {
    id: "norman-rockwell",
    name: "Norman Rockwell",
    blurb:
      "A Saturday Evening Post cover. Wholesome, warm, a little idealized — the family as a painted Americana scene.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-norman-rockwell.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    spec: {
      assetType: "A 4:5 Saturday-Evening-Post cover illustration in oil",
      subjectAction:
        "the family caught in a tender narrative moment — gathered around a kitchen table mid-grace, or all crowded onto a porch swing, warm earnestness on each face, one slightly idealized but believable gesture anchoring the scene",
      location:
        "a wholesome American mid-century interior with wooden furniture, a knitted throw, a quilt across a chair, framed family photographs on the wall, a window opening to a small-town view",
      camera:
        "classical painterly composition, slight low eye-level, three-quarter narrative framing with a foreground prop tying the eye to the family",
      lighting:
        "warm tungsten interior key with Rembrandt soft falloff, signature Rockwell golden glow on faces, gentle controlled chiaroscuro",
      style:
        "Norman-Rockwell oil-on-canvas illustration, visible loose brushwork, warm cream-russet-and-Prussian-blue palette, Saturday-Evening-Post cover finish, slight canvas grain texture",
    },
  },
  {
    id: "minecraft",
    name: "Minecraft",
    blurb:
      "The whole family in voxel form. Blocky arms, pixel-grid faces, a creeper peeking from behind a tree.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-minecraft.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 in-game render in the style of Minecraft",
      subjectAction:
        "the family rendered as voxel Minecraft characters with blocky cubic arms and legs, square pixel-grid faces, simple recognizable hair colors, each holding a different signature Minecraft item — a torch, a pickaxe, a flower, a bucket — a small voxel pet ocelot or wolf at their feet",
      location:
        "a sunlit Minecraft overworld biome — a grassy plains hill with cubic oak trees, a small player-built cobblestone-and-oak house in the background, a creeper peeking from behind a tree, a few floating voxel clouds in a light-blue sky",
      camera:
        "wide third-person Minecraft gameplay camera, slight low angle from the grass, subjects centered with the village stretching behind",
      lighting:
        "even Minecraft daylight with the signature soft directional sun-shading on each block face, warm grass-bounce fill, no smooth gradients",
      style:
        "official Minecraft voxel aesthetic, every surface built from 16×16-pixel block textures, pixel-perfect edges, no anti-aliasing on textures, bright saturated overworld palette of grass-green, oak-brown, sky-blue and sandstone-tan",
    },
  },
  {
    id: "aardman-claymation",
    name: "Aardman Claymation",
    blurb:
      "Wallace-and-Gromit warmth. Plasticine families with thumbprint texture, oversized grins, a kettle on the stove.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-aardman.jpg",
    aspectRatio: "16:9",
    supportsPets: true,
    spec: {
      assetType: "A 16:9 stop-motion claymation frame in the Aardman tradition",
      subjectAction:
        "the family rendered as plasticine claymation characters with visible thumbprint texture across faces and clothing, oversized teeth and warm grins, expressive over-arched eyebrows, mid-gesture holding fresh teacups, a small clay pet at their feet",
      location:
        "a cozy English cottage interior with sloped wooden ceilings, a copper kettle steaming on a vintage stove, a tiny model train running along a shelf, comically detailed clutter on every surface",
      camera:
        "slight hand-held wobble characteristic of stop-motion, cinematic 35mm-equivalent lens, eye-level chest-up framing",
      lighting:
        "warm tungsten interior key from a hanging pendant lamp, gentle north-facing window fill, soft sculpted clay shadows",
      style:
        "Aardman-Animations (Wallace-&-Gromit, Chicken-Run) plasticine claymation, visible fingerprints in clay, hand-built miniature aesthetic, English-cozy palette of brick red, mustard, sage and warm cream",
    },
  },

  // ─── Cards / Occasions ──────────────────────────────────────────────
  {
    id: "card-christmas",
    name: "Holiday Card — Christmas",
    blurb:
      "A card-ready portrait with a thoughtful serif greeting laid into the image.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-christmas.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 holiday-card family portrait",
      subjectAction:
        "gathered in the doorway and on the front step, smiling warmly toward the camera, in coordinated-not-matching wool and flannel, a dog at their feet",
      location:
        "a snow-dusted front porch of a traditional home, a lit wreath on the door behind the family, warm interior glow through the glass, pines dusted with snow",
      camera:
        "Leica M10 with 50mm Summilux f/1.4, eye-level framing, subjects on the right two-thirds with deliberate negative space on the left for a greeting",
      lighting:
        "cool blue-hour exterior snow light + warm interior spill through the open doorway and wreath lights, subtle amber rim on hair",
      style:
        "Kodak Portra 400, classic holiday palette (forest green, cranberry, cream), gentle film grain, elegant editorial-card finish",
    },
  },
  {
    id: "card-easter",
    name: "Holiday Card — Easter",
    blurb: "Springtime card portrait — pastels, tulips, morning light.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-easter.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 spring holiday-card family portrait",
      subjectAction:
        "the family walking through a tulip garden, one child holding a small woven basket, in linen and cotton pastels, gentle smiles",
      location:
        "a dogwood-blossom and tulip garden at early morning, white picket fence behind, a wooden bench just visible, bright pastel ground carpet",
      camera:
        "Contax 645 medium format with 80mm f/2, waist-up composition with deliberate negative space low-right for a greeting",
      lighting:
        "soft low morning sun from camera-left, gentle pastel-warm fill from blossoms, dewy highlights",
      style:
        "Kodak Portra 160, pastel spring palette (blush, pale yellow, mint, cream), fine grain, bright airy editorial finish",
    },
  },
  {
    id: "card-birthday",
    name: "Birthday Invitation",
    blurb:
      "A playful card portrait for a kid's birthday — streamers, cake, candlelight.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-birthday.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 warm birthday-invitation family portrait",
      subjectAction:
        "gathered around a lit birthday cake on a wooden table, the child closest leaning in to blow out the candles, everyone mid-laugh with warm anticipation",
      location:
        "a cozy dining room with paper streamers and tissue pompoms in pastel colors, wooden table, a dog sitting up at the table's edge",
      camera:
        "Fuji GFX medium format with a 63mm f/2.8, slightly low eye-level from across the table, composition with deliberate negative space upper-left for invitation text",
      lighting:
        "warm candlelight as the dominant source on faces, soft warm practical lamp fill from above, gentle highlight roll on the cake icing",
      style:
        "Fuji Pro 400H, warm joyful palette, soft halation on candle flames, fine grain, editorial-card finish",
    },
  },
  {
    id: "card-halloween",
    name: "Halloween Card",
    blurb:
      "Pumpkin-light on a porch, a whisper of fog, coordinated costumes. Spooky with soft edges.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-halloween.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 warm Halloween-card family portrait",
      subjectAction:
        "lined up on the porch steps in coordinated not-scary costumes — a little witch, a small vampire, a gentle ghost, the dog as a pumpkin — playful smiles",
      location:
        "a wooden porch at dusk with carved jack-o'-lanterns lining the steps, wisps of low ground fog, a wreath of dry wheat on the door",
      camera:
        "Leica Q2 with 28mm Summilux f/1.7, slightly low eye-level framing, composition with negative space on the right for a serif greeting",
      lighting:
        "warm flickering candlelight from the jack-o'-lanterns below subjects, cool dusk sky as backlight, soft fog catching the light",
      style:
        "Cinestill 800T, rich orange-and-deep-purple palette, warm halation on pumpkin flames, fine grain, playful-cinematic finish — zero gore",
    },
  },
  {
    id: "card-thanksgiving",
    name: "Thanksgiving Card",
    blurb:
      "A harvest table in amber light. Gratitude, a full spread, hands clasped.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-thanksgiving.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 Thanksgiving-card family portrait",
      subjectAction:
        "gathered around a harvest table mid-gesture of passing a dish, hands lightly holding, warm honest expressions, in plaid and linen",
      location:
        "a dining room with a long table set with a roast turkey, small pumpkins and autumn florals as centerpiece, a window letting in overcast daylight behind",
      camera:
        "Fuji GFX medium format with 63mm f/2.8, chest-level three-quarter composition, negative space upper-right for a greeting",
      lighting:
        "warm amber candlelight from the table as dominant source, soft overcast backlight from the window, gentle bounce on faces",
      style:
        "Fuji Pro 400H, cozy autumn palette (rust, amber, cream), fine grain, editorial warmth",
    },
  },
  {
    id: "card-new-years",
    name: "New Year's Card",
    blurb:
      "Confetti, black-tie, a midnight toast. The year ahead looks cinematic.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-new-years.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 glamorous New-Year's-card family portrait",
      subjectAction:
        "raising champagne coupes in a mid-toast, gold confetti caught mid-air around them, in black-tie and cocktail-dress wardrobe, warm joy",
      location:
        "an elegant interior at midnight with a softly-lit chandelier behind, dark-wood panelling, warm cinematic bokeh",
      camera:
        "Arri Alexa 35 with Cooke 50mm S4, chest-up cinematic framing, negative space above for a serif year and greeting",
      lighting:
        "warm tungsten key with cinematic falloff, soft golden rim from the chandelier, specular highlights on glass and gold",
      style:
        "Kodak Vision3 500T emulation, warm cinematic glamour grade, soft halation on the gold confetti, fine grain, editorial polish",
    },
  },
  {
    id: "card-graduation",
    name: "Graduation Card",
    blurb:
      "Caps, gowns, golden afternoon light. A quiet moment before the next chapter.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-graduation.jpg",
    aspectRatio: "4:5",
    supportsPets: false,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 warm graduation-card family portrait",
      subjectAction:
        "the family around the graduate in cap and gown, a parent adjusting the tassel or resting a hand on a shoulder, shared quiet pride",
      location:
        "an ivy-covered brick university wall in golden-hour afternoon light, a glimpse of a wooden bench and stone path to the side",
      camera:
        "Leica Q2 with 28mm Summilux f/1.7, chest-up three-quarter composition, negative space upper-right for a serif name and date",
      lighting:
        "warm low sun from camera-left, gentle ivy-bounce fill, soft long shadows, rim highlight on the graduation gown",
      style:
        "Kodak Portra 400, classic academic palette (deep navy gown, cream, brick red, ivy green), fine grain, dignified editorial finish",
    },
  },
  {
    id: "card-newborn",
    name: "Newborn Announcement",
    blurb:
      "Soft window light, a sleeping newborn, the family gathered. Tender space for a name.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-newborn.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 tender newborn-announcement family portrait",
      subjectAction:
        "gathered in soft white bedding, parents holding a swaddled sleeping newborn at center, siblings leaning in, quiet gentleness",
      location:
        "a sunlit bedroom with white linen bedding, a muslin swaddle, a small woven basket of folded blankets nearby, pastel-muted walls",
      camera:
        "Fuji GFX medium format with 63mm f/2.8, slightly high angle looking down on the newborn, waist-up composition, ample negative space above for a name, date, weight",
      lighting:
        "soft directional window light from camera-left, airy highlight roll-off across white bedding, no harsh shadow",
      style:
        "Fuji Pro 400H, delicate muted-pastel palette (cream, blush, sage, soft linen white), fine grain, airy editorial tenderness",
    },
  },
  {
    id: "card-save-the-date",
    name: "Save the Date",
    blurb:
      "A golden-hour engagement portrait with thoughtful negative space for names, date, and city.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-save-the-date.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 romantic save-the-date engagement portrait",
      subjectAction:
        "the couple — and immediate family if extended — caught in an intimate unrehearsed moment, a quiet laugh, hand-in-hand or temple-to-temple, in coordinated soft tones with one accent piece",
      location:
        "a wide open meadow at golden hour, wildflowers in the foreground, distant tree line, a wooden split-rail fence to one side",
      camera:
        "Contax 645 medium format with 80mm f/2 Zeiss Planar, chest-up composition, deliberate negative space lower-right for a serif greeting and date",
      lighting:
        "warm low golden-hour sun backlighting the couple, gentle field-bounced fill, soft hair rim, dreamy haze",
      style:
        "Kodak Portra 400 medium format, romantic cream-and-blush editorial palette, fine grain, magazine wedding-editorial polish",
    },
  },
  {
    id: "card-mothers-day",
    name: "Mother's Day Card",
    blurb:
      "A garden in full bloom, mother and children in soft pastels. Tender, airy, room for a sweet note.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-mothers-day.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 tender Mother's-Day-card family portrait",
      subjectAction:
        "mother seated on a garden bench with the children leaning in, one small hand passing a hand-tied bouquet of peonies, gentle laughter, in linen and cotton pastels",
      location:
        "a sunlit spring garden in full bloom — peonies, ranunculus and roses in pinks and creams — a wisteria-draped trellis behind, dewy grass underfoot",
      camera:
        "Leica Q2 with 28mm Summilux f/1.7, chest-up composition, ample negative space upper-right for a serif greeting",
      lighting:
        "soft morning sun from camera-left, gentle pastel-petal bounce fill, dewy specular highlights",
      style:
        "Kodak Portra 160, blush-cream-and-fresh-green palette, fine grain, airy editorial tenderness",
    },
  },
  {
    id: "card-fathers-day",
    name: "Father's Day Card",
    blurb:
      "A backyard catch with the kids, golden-afternoon light, room for a warm short note.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-fathers-day.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 warm Father's-Day-card family portrait",
      subjectAction:
        "father in mid-action with the children — tossing a baseball, lifting a small one onto his shoulders, mid-laugh together, in chambray, denim and earth tones, the family pet trotting alongside",
      location:
        "a sunlit suburban backyard at late afternoon, a wooden fence and a leaning bicycle in the background, oak tree casting dappled light",
      camera:
        "Leica M10 with 35mm Summilux f/1.4, eye-level three-quarter composition, ample negative space upper-left for a serif greeting",
      lighting:
        "warm low afternoon side-light, dappled tree shadow patterns, gentle grass-bounce fill",
      style:
        "Kodak Portra 400, warm earth-tone palette (denim, oak, butter-yellow), fine grain, dignified editorial finish",
    },
  },
  {
    id: "card-lunar-new-year",
    name: "Lunar New Year Card",
    blurb:
      "Red-and-gold lanterns, dumplings on the table, the family in a moment of warmth. Space for a New Year greeting.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-lunar-new-year.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 festive Lunar-New-Year family portrait",
      subjectAction:
        "the family gathered around a round dining table mid-meal, one passing a plate of dumplings, another raising a small tea cup in toast, a child holding a red envelope, all in coordinated red-and-gold wardrobe with one cheongsam-inspired accent",
      location:
        "an ornately decorated home interior with hung red paper lanterns, golden 福 calligraphy banners on the wall, a small altar of auspicious oranges and tangerines, a brass tea-set on the table",
      camera:
        "Fuji GFX medium format with 63mm f/2.8, slightly elevated three-quarter angle from the table, ample negative space upper-left for a serif greeting in both Chinese characters and Latin script",
      lighting:
        "warm interior tungsten and red-paper-lantern glow as primary key, gentle window blue-hour fill, halation on lantern flames",
      style:
        "Fuji Pro 400H, rich red-gold-and-deep-mahogany palette, fine grain, festive editorial warmth",
    },
  },
  {
    id: "card-hanukkah",
    name: "Hanukkah Card",
    blurb:
      "A glowing menorah on a snow-dusted windowsill, the family lighting candles together. Cool blue dusk and warm flame.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-hanukkah.jpg",
    aspectRatio: "4:5",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 4:5 warm Hanukkah-card family portrait",
      subjectAction:
        "the family gathered around a glowing nine-branch menorah on a wooden table, one subject lifting the shamash to light a candle, the others leaning in with gentle smiles, a child clutching a wooden dreidel, in coordinated wool sweaters in blue, silver and cream",
      location:
        "a warm dining room at blue hour, a window dusted with snow behind the menorah, a plate of latkes with applesauce and sour cream nearby, a stack of gold-foil-wrapped gelt on the table",
      camera:
        "Leica Q2 with 28mm Summilux f/1.7, chest-up composition just above the menorah, ample negative space upper-right for a serif greeting",
      lighting:
        "candlelight from the menorah as primary warm key on faces, soft cool blue-hour window fill behind, golden halation on each flame",
      style:
        "Cinestill 800T emulation, characteristic warm-flame-against-cool-window palette, soft halation on candle flames, fine grain, editorial tenderness",
    },
  },
];

export function getTheme(id: string): Theme {
  const t = THEMES.find((t) => t.id === id);
  if (!t) throw new Error(`Unknown theme: ${id}`);
  return t;
}

export function themesByCategory() {
  return {
    photoreal: THEMES.filter((t) => t.category === "photoreal"),
    stylized: THEMES.filter((t) => t.category === "stylized"),
    card: THEMES.filter((t) => t.category === "card"),
  };
}

/**
 * Build a PromptSpec for a custom user-described vibe.
 * We place the user's free-form description in `location` (the "setting"
 * sentence of the composed prompt) so it reads naturally, and we fill the
 * other framework fields with tasteful defaults. The user is free to embed
 * their own camera / lighting / style notes in the description — those
 * will simply appear alongside the defaults in the composed prompt.
 */
function buildCustomSpec(opts: {
  description: string;
  aspectRatio: AspectRatio;
}): PromptSpec {
  const description = opts.description.trim().replace(/\s+$/u, "");
  return {
    assetType: `A ${opts.aspectRatio} cinematic color photograph`,
    // Embed the family's own creative direction as a quoted note inside the
    // subject-action clause. This reads as the dominant brief the model
    // should honor over the generic defaults below.
    subjectAction: `together, honest and at ease — rendering the scene the family themselves described: "${description}"`,
    location:
      "an environment that matches the family's described scene above, with consistent props, season and time of day",
    camera:
      "tasteful documentary framing, a 50mm-equivalent field of view, eye-level composition, shallow depth of field",
    lighting:
      "soft natural light appropriate to the described scene, gentle directional key with subtle fill, honest tonality on skin",
    style:
      "Kodak Portra 400 emulation, subtle natural film grain, warm-neutral editorial palette, no oversaturation",
  };
}

/** A synthetic Theme object built from a custom-vibe generation row. */
export function buildCustomTheme(opts: {
  description: string;
  aspectRatio: AspectRatio;
}): Theme {
  return {
    id: "custom",
    name: "Custom vibe",
    blurb: opts.description,
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "",
    aspectRatio: opts.aspectRatio,
    supportsPets: true,
    spec: buildCustomSpec(opts),
  };
}

/**
 * Resolve the right Theme for a generation row — for canned themes we look up
 * the static catalog; for themeId === "custom" we synthesize one from the
 * custom vibe description and aspect ratio stored on the generation.
 *
 * If the generation row carries its own aspectRatio (because the user chose a
 * shape override at shoot time), that overrides the theme's default so that
 * downstream refines keep the same shape.
 */
export function resolveTheme(generation: {
  themeId: string;
  customVibeDescription: string | null;
  aspectRatio: string | null;
}): Theme {
  if (generation.themeId === "custom") {
    const description =
      generation.customVibeDescription?.trim() ||
      "A warm, honest family portrait.";
    const aspectRatio =
      (generation.aspectRatio as AspectRatio | null) ?? "4:5";
    return buildCustomTheme({ description, aspectRatio });
  }
  const theme = getTheme(generation.themeId);
  if (
    generation.aspectRatio &&
    generation.aspectRatio !== theme.aspectRatio
  ) {
    return { ...theme, aspectRatio: generation.aspectRatio as AspectRatio };
  }
  return theme;
}

