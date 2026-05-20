import type { AspectRatio } from "./providers/types";

export type ThemeCategory = "photoreal" | "stylized" | "card";

/**
 * Structured prompt spec. The composer in `src/lib/prompts.ts` weaves these
 * fields, plus `theme.name` and `theme.blurb`, into the final prompt.
 *
 * CONVENTION — read this before adding a new theme:
 *
 * - Each field below describes ONLY its own aspect (medium, optics, light,
 *   aesthetic). Do NOT describe the roster here: no counts ("up to five
 *   family members"), no pet mentions ("optionally with one dog"), no
 *   "uploaded" wording. The roster (people + pets + counts + identities)
 *   is generated dynamically by `buildRosterDirective` in prompts.ts from
 *   whatever the user selected, and is appended to every prompt.
 *
 * - Card themes that need a greeting set `acceptsCardText: true` on the
 *   Theme; the text is rendered by `buildCardTextDirective` and does not
 *   belong in any spec field.
 *
 * - The composer rewrites occurrences of "family"/"everyone" inside these
 *   fields to "selected cast". Either word is fine; prefer "family" in
 *   prose since it reads naturally.
 *
 * - If you write a roster detail into a spec field anyway it will fight
 *   the dynamic roster directive and the model may add or substitute
 *   subjects (e.g. swap a cat for a person to match hardcoded "five
 *   family members" wording). Don't.
 */
export type PromptSpec = {
  /** Medium + aspect ratio as a single crisp handle. e.g. "A 3:2 cinematic color photograph". */
  assetType: string;
  /** Camera, lens, angle, framing. For non-photo themes: viewpoint / engine. No roster references. */
  camera: string;
  /** Direction + quality of light + mood. No roster references. */
  lighting: string;
  /** Film stock / rendering engine / texture / palette. No roster references. */
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
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 candid documentary color photograph",
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
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 editorial magazine studio portrait",
      camera:
        "Hasselblad H6D-100c, 100mm f/2.8 lens, waist-up framing, classical triangular composition, shallow depth of field",
      lighting:
        "single large diffused key from camera-right at 45° Rembrandt angle, deep controlled falloff, subtle silver bounce fill, a hair light grazing shoulders",
      style:
        "digital medium format with a painterly chiaroscuro color grade, Kodak Portra 160 film emulation, rich creamy skin tones, gallery-print finish",
    },
  },
  {
    id: "stacked-love",
    name: "Stacked Love",
    blurb:
      "A close black-and-white studio portrait with faces gently stacked together. Soft smiles, white backdrop, timeless album-cover intimacy.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-stacked-love.jpg",
    aspectRatio: "2:3",
    supportsPets: false,
    spec: {
      assetType: "A 2:3 classic black-and-white studio family portrait",
      camera:
        "medium-format portrait camera with an 85mm lens, vertical close crop, faces layered in a gentle stacked pyramid composition, all selected people looking toward camera",
      lighting:
        "large softbox front light with delicate fill, clean white-to-light-gray studio backdrop, soft shadow falloff, bright eyes and flattering skin texture",
      style:
        "timeless monochrome silver-gelatin print, smooth midtone contrast, subtle natural grain, clean white background, no props, no color, polished album finish",
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
    blurb: "On a windswept ridge at dawn. Technical outerwear, real weather, real awe.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-natgeo.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 documentary expedition photograph",
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
    blurb: "Black-and-white, venetian-blind shadows. The family as an elegant mystery vignette.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-film-noir.jpg",
    aspectRatio: "2:3",
    supportsPets: false,
    spec: {
      assetType: "A 2:3 high-contrast black-and-white film photograph",
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
    blurb: "The tree in the background, pajamas, warm lamplight. Somewhere between chaos and calm.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-christmas-morning.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 candid tender color photograph",
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
    blurb: "Pink petals drifting in a Kyoto garden at spring's first warmth. Cotton, film, quiet.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-cherry-blossom.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 tender documentary color photograph",
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
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 warm Nordic documentary photograph",
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
    blurb: "Adobe walls and open sky, the red earth of the American Southwest at dusk.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-desert-santa-fe.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 warm Southwest documentary photograph",
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
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 editorial documentary photograph",
      camera:
        "Leica Q2 with its 28mm Summilux f/1.7, slight low angle from across the table, loose composition with the street opening behind",
      lighting:
        "soft overcast Paris morning light, cool white sky as the main source, gentle warm bounce from the limestone buildings, no direct sun",
      style:
        "Kodak Portra 400 with a cool-Paris grade, muted café-neutral palette, fine grain, documentary-elegant finish",
    },
  },
  {
    id: "new-york-city",
    name: "New York City",
    blurb:
      "Brooklyn Bridge underfoot, Manhattan behind them. Instantly New York, casual and cinematic.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-new-york-city.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 editorial documentary city photograph",
      camera:
        "Leica M10 with a 35mm Summilux f/1.4, eye-level walking composition, bridge cables as leading lines, skyline held soft but unmistakable behind the family",
      lighting:
        "late-afternoon golden city light from camera-left, warm bounce from the bridge deck, soft open shade on faces and a mild breeze in coats and hair",
      style:
        "Kodak Portra 400, fine film grain, warm city-neutral palette with denim and coffee-brown accents, polished documentary finish",
    },
  },
  {
    id: "paris-family-stroll",
    name: "Paris Family Stroll",
    blurb:
      "The Eiffel Tower close behind them, flowers and a baguette in hand. Elegant without feeling staged.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-paris-family-stroll.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 refined travel-documentary photograph",
      camera:
        "Leica Q2 with its 28mm Summilux f/1.7, waist-level walking composition, gentle motion in coats and scarves, Eiffel Tower filling much of the background while the family remains the focus",
      lighting:
        "soft golden Paris morning light with warm limestone bounce, gentle rim highlights, soft highlight roll-off and no harsh shadows",
      style:
        "Kodak Portra 400 with a cool cream-and-charcoal Paris palette, fine grain, understated editorial-travel polish",
    },
  },
  {
    id: "backyard-picnic",
    name: "Backyard Picnic",
    blurb:
      "A plaid blanket under the tree, lemonade, strawberries and the kind of laughter that needs no pose.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-backyard-picnic.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 bright family lifestyle photograph",
      camera:
        "Canon R5 with a 50mm f/1.8 lens, low blanket-level composition, family arranged in a loose circle with food in the foreground",
      lighting:
        "warm dappled afternoon light through leaves, soft grass-bounced fill, lively highlights on glass and fruit",
      style:
        "Kodak Portra 400, fresh green palette with coral, denim and picnic-red accents, fine grain, candid lifestyle warmth",
    },
  },
  {
    id: "sunday-sofa",
    name: "Sunday Sofa",
    blurb:
      "Rain on the window, blankets on the couch, a book open in someone's lap. Soft and close.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-sunday-sofa.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 cozy documentary interior photograph",
      camera:
        "Fuji GFX medium format with a 63mm f/2.8 lens, close chest-level composition from the coffee table, intimate framing with faces gathered around the book",
      lighting:
        "warm tungsten lamp glow mixed with cool rainy window light, gentle falloff into the shelves, soft shadows and a calm indoor mood",
      style:
        "Kodak Portra 800 emulation, cozy neutral palette with sage, rust and cream accents, visible fine grain, soft editorial intimacy",
    },
  },
  {
    id: "orchard-picking",
    name: "Orchard Picking",
    blurb:
      "Rows of apple trees, flannel layers, a wooden basket and one kid reaching for the best apple.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-orchard-picking.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 joyful early-fall documentary photograph",
      camera:
        "Nikon Z8 with a 50mm f/1.8 lens, low eye-level composition down the orchard row, subjects on the right third with apples framing the foreground",
      lighting:
        "late-afternoon golden light filtering through branches, warm hair rim, gentle leaf-bounced fill and soft autumn haze",
      style:
        "Kodak Portra 400, crisp autumn palette of apple red, moss green, denim blue and warm amber, fine grain, joyful keepsake finish",
    },
  },
  {
    id: "lake-house",
    name: "Lake House",
    blurb: "The long wooden dock, warm water behind, a retriever at the edge. Summer ease.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-lake-house.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 warm summer-evening documentary photograph",
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
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 lifestyle editorial photograph",
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
      camera:
        "Nikon F2 SLR with a 50mm f/1.4 Nikkor, eye-level three-quarter framing, the wagon angled to lead the eye toward the road",
      lighting:
        "low-angle golden afternoon sun from camera-right, warm dust haze in the air, long shadows trailing across the asphalt",
      style:
        "Kodachrome 64 emulation, characteristic deep reds, mustard yellows and forest greens, organic film grain, period-correct slightly-faded color cast",
    },
  },

  {
    id: "pop-icon-stage-portrait",
    name: "Pop Icon Stage Portrait",
    blurb:
      "A dramatic concert-stage family portrait with glittering spotlights, sharp tailoring, moonlit floor glow, smoke, and 1980s pop-performance energy.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-pop-icon-stage-portrait.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 dramatic concert-stage editorial portrait",
      camera:
        "Hasselblad medium format with an 80mm lens, low three-quarter stage perspective, crisp faces with theater depth and clean performance-poster framing",
      lighting:
        "hard white follow-spot from above, cool moonlit stage-floor reflections, rim lights through cinematic smoke, deep high-contrast shadows with readable faces",
      style:
        "1980s pop-concert editorial photography, black, white, silver and deep-blue palette, sequined highlights, sharp tailoring, no public-figure likeness, no branded costume recreation",
    },
  },
  {
    id: "galactic-family-adventure",
    name: "Galactic Family Adventure",
    blurb:
      "A cinematic space-opera family portrait on a desert-world horizon with a starship-hangar atmosphere, twin suns, heroic rim light, and adventurous wonder.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-galactic-family-adventure.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 cinematic space-adventure family portrait",
      camera:
        "large-format digital cinema camera with a 40mm anamorphic lens, heroic wide group framing, desert horizon and starship-hangar silhouettes layered behind the cast",
      lighting:
        "low twin-sun golden backlight, cool blue hangar fill, glowing rim light on shoulders and hair, atmospheric dust haze with readable skin tones",
      style:
        "original space-opera production still, sand, bronze, indigo and starlight palette, practical weathered travel wardrobe, no franchise symbols, no glowing weapon props, no character costumes",
    },
  },
  {
    id: "iconic-crosswalk-album-cover",
    name: "Iconic Crosswalk Album Cover",
    blurb:
      "A clean editorial street-crossing portrait with classic 1960s music-magazine energy, soft overcast city light, stylish coats, and print-ready album-cover framing.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-new-york-city.jpg",
    aspectRatio: "1:1",
    supportsPets: true,
    spec: {
      assetType: "A 1:1 square editorial street-crossing portrait",
      camera:
        "medium-format film camera with a 50mm lens, straight-on street-level composition, clean crosswalk geometry and balanced negative space for album-cover impact",
      lighting:
        "soft overcast city daylight, gentle pavement bounce fill, low contrast with crisp silhouettes and polished faces",
      style:
        "classic late-1960s music-magazine photography, tailored coats, muted black, cream, gray and brick palette, subtle film grain, original street scene, no exact album recreation, no band likeness",
    },
  },
  {
    id: "runway-editor-in-chief-family-editorial",
    name: "Runway Editor-in-Chief Family Editorial",
    blurb:
      "A polished high-fashion magazine family shoot with sharp tailoring, glossy editorial light, city office and runway mood, confident poses, and a luxury neutral palette.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-leibovitz.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 polished high-fashion magazine family editorial",
      camera:
        "digital medium format with a 90mm portrait lens, refined vertical editorial framing, confident staggered poses with runway and city-office cues in the background",
      lighting:
        "glossy studio key light with crisp cheek highlights, soft fill, subtle rim on tailored silhouettes, reflective floor accents and controlled shadows",
      style:
        "luxury fashion editorial photography, ivory, charcoal, camel and glossy black palette, sharp tailoring, premium magazine retouch, no brand logos, no movie-character styling",
    },
  },
  {
    id: "noughties-family-throwback",
    name: "Noughties Family Throwback",
    blurb:
      "Early-2000s family-photo energy with warm compact-camera flash, denim layers, playful mall-photo nostalgia, and a premium printable finish.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-y2k-disposable.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 early-2000s compact-camera family portrait",
      camera:
        "consumer digital compact camera at normal focal length, slight off-center candid framing, close enough for faces and outfit details with a nostalgic snapshot feel",
      lighting:
        "warm direct on-camera flash balanced with soft indoor ambient light, gentle red-orange highlights, mild background falloff",
      style:
        "premium noughties throwback photography, casual denim and layered knits, sticker-album and mall-photo mood, soft JPEG-era color character, polished for print, no phone-screen props",
    },
  },

  // ─── Travel & Special Occasion ──────────────────────────────────────
  {
    id: "royal-family-portrait",
    name: "Royal Family Portrait",
    blurb: "Velvet, crowns, grand halls, and old-world ceremony. Your family styled like royalty.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-royal-family-portrait.png",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 formal editorial family portrait",
      camera:
        "Hasselblad medium format with an 80mm f/2.8 lens, refined editorial portrait perspective, crisp facial detail with gentle palace-background compression",
      lighting:
        "painterly window light from camera-left, soft Rembrandt side light, controlled warm highlights on gold and velvet, gentle fill on faces",
      style:
        "premium editorial portrait photography with old-world ceremonial styling, ruby velvet, navy, ivory and antique gold palette, polished gallery finish, no public-figure resemblance",
    },
  },
  {
    id: "disney-world",
    name: "Disney World",
    blurb:
      "A castle plaza, vacation outfits, snack sticks, fireworks haze. The family-trip photo everyone wanted.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-disney-world.png",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 cheerful vacation family photograph",
      camera:
        "Canon R5 with a 35mm f/1.8 lens, cheerful vacation portrait perspective, crisp faces with castle-plaza atmosphere layered behind",
      lighting:
        "warm late-afternoon sunshine, clean open shade on faces, sparkling highlights, cheerful high-energy vacation mood",
      style:
        "crisp commercial lifestyle photography, sky blue, coral, cream and garden-green palette, polished but natural, no logos, no character costumes",
    },
  },
  {
    id: "national-park",
    name: "National Park",
    blurb:
      "Granite cliffs, pine air, trail layers, and the everyone-made-it-to-the-viewpoint feeling.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-national-park.png",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 outdoor adventure family photograph",
      camera:
        "Nikon Z8 with a 35mm f/1.8 lens, flexible environmental portrait perspective, readable faces with sweeping trail, cliff and forest context",
      lighting:
        "early morning alpine light, clear air, warm rim light from camera-right, soft sky fill and gentle shadow detail",
      style:
        "premium outdoor family photography, pine green, granite gray, sky blue, warm tan and rust accents, natural color grade, no park logos",
    },
  },
  {
    id: "hawaii-vacation",
    name: "Hawaii Vacation",
    blurb:
      "Palms, lava rock, leis, sunset water, and the kind of family trip that deserves a frame.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-hawaii-vacation.png",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 destination family portrait photograph",
      camera:
        "Sony A1 with a 50mm f/1.4 lens, clean destination portrait perspective, readable faces with ocean, palm and sunset context",
      lighting:
        "warm sunset rim light, soft ocean-reflected fill, breezy open-air highlights, gentle haze near the horizon",
      style:
        "premium destination family photography, turquoise ocean, coral flowers, white linen, palm green and warm sand palette, respectful non-costume styling",
    },
  },
  {
    id: "cape-cod-summer",
    name: "Cape Cod Summer",
    blurb:
      "Cedar shingles, hydrangeas, dune grass, navy stripes. A soft New England family summer.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-cape-cod-summer.png",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 coastal editorial family photograph",
      camera:
        "Fuji GFX medium format with a 63mm f/2.8 lens, coastal editorial portrait perspective, readable faces with cottage, dune or ocean context",
      lighting:
        "soft late-summer morning light, airy sea-breeze fill, low contrast, gentle highlights on white linen and hydrangeas",
      style:
        "premium editorial coastal family photography, hydrangea blue, weathered gray cedar, white linen, navy, pale sand and sea-green palette, nostalgic but real",
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
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 Pixar-quality 3D animated hero frame",
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
    blurb: "Hand-drawn lines, cel-shaded color. A quiet Studio Ghibli family moment.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-manga.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 hand-drawn anime illustration",
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
      "Costumes, capes, the whole family on a rooftop at golden hour. Everyone gets a hero moment.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-superhero.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 blockbuster superhero movie promotional still",
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
    blurb: "A hand-drawn 90s cartoon frame. Bright primary colors, cheerful chaos.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-cartoon.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 1990s Saturday-morning hand-drawn cartoon cel",
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
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 Studio-Ghibli-style hand-painted illustration",
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
    blurb: "The family as a Dutch-master painting. Deep umbers, candlelight, stillness.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-renaissance-oil.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 Dutch-Golden-Age style oil painting on canvas",
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
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 1990s Springfield-style prime-time animated cel",
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
      assetType: "A 1:1 photoreal CGI render of plastic toy-brick minifigures",
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
    blurb: "A children's-book illustration of the family. Soft washes, hand-lettered warmth.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-watercolor-storybook.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 hand-painted watercolor children's storybook illustration",
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
      "A bridge in a lantern-lit bath-house town. Steam rising, paper lanterns warm, wonder gathered around the family.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-spirited-away.jpg",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 hand-painted Studio-Ghibli illustration in the Spirited-Away tradition",
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
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 South-Park-style construction-paper cutout animation cel",
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
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 in-game render in the style of The Sims 4",
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
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 Saturday-Evening-Post cover illustration in oil",
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
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 in-game render in the style of Minecraft",
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
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 stop-motion claymation frame in the Aardman tradition",
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
    blurb: "A card-ready portrait with a thoughtful serif greeting laid into the image.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-christmas-photo.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 holiday-card family portrait",
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
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 spring holiday-card family portrait",
      camera:
        "Contax 645 medium format with 80mm f/2, waist-up composition with deliberate negative space low-right for a greeting",
      lighting:
        "soft low morning sun from camera-left, gentle pastel-warm fill from blossoms, dewy highlights",
      style:
        "Kodak Portra 160, pastel spring palette (blush, pale yellow, mint, cream), fine grain, bright airy editorial finish",
    },
  },
  {
    id: "card-diwali",
    name: "Holiday Card — Diwali",
    blurb:
      "Diyas, marigolds, rangoli and warm gold light. A festive card for the festival of lights.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-diwali.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 festive Diwali-card family portrait",
      camera:
        "Leica Q2 with 28mm Summilux f/1.7, eye-level chest-up composition, ample negative space upper-left for a serif greeting",
      lighting:
        "warm diya candlelight and soft indoor ambient glow, gentle gold rim light on hair and jewelry, polished holiday-card warmth",
      style:
        "Kodak Portra 400, saffron-gold-deep-teal palette, fine grain, elegant editorial-card finish",
    },
  },
  {
    id: "card-eid",
    name: "Holiday Card — Eid",
    blurb:
      "Morning light, lanterns, sweets and family gathered after prayer. Airy, joyful and refined.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-eid.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 festive Eid-al-Fitr family portrait",
      camera:
        "Fuji GFX medium format with 63mm f/2.8, gentle three-quarter composition, upper-left negative space for a greeting",
      lighting:
        "soft morning sunlight with warm lantern accents, airy highlight roll-off, calm celebratory mood",
      style:
        "Fuji Pro 400H, emerald-cream-gold palette with soft rose accents, fine grain, refined card finish",
    },
  },
  {
    id: "card-nowruz",
    name: "Nowruz Card",
    blurb:
      "A bright haft-sin table, spring flowers, mirror, candles and a poetry book. Fresh, refined and joyful.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-nowruz.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 refined Nowruz-card family portrait",
      camera:
        "Fuji GFX medium format with 63mm f/2.8, gentle eye-level three-quarter composition, selected cast placed to one side with ample negative space upper-left for a serif Nowruz greeting",
      lighting:
        "soft spring morning window light, gentle candle sparkle from the haft-sin table, fresh airy highlights, calm celebratory warmth",
      style:
        "Kodak Portra 160, luminous spring palette of cream, fresh green, sky blue, soft gold and hyacinth purple, fine grain, refined editorial-card finish",
    },
  },
  {
    id: "card-dia-de-muertos",
    name: "Holiday Card — Día de Muertos",
    blurb:
      "Marigolds, candles and a glowing ofrenda. Reverent, colorful and made for family remembrance.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-dia-de-muertos.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 Día-de-Muertos family remembrance card portrait",
      camera:
        "Leica M10 with 50mm Summilux f/1.4, eye-level composition, family foreground right with negative space top-left for a greeting",
      lighting:
        "candlelit warmth from the ofrenda with gentle magenta and cobalt accents, soft falloff, cinematic remembrance mood",
      style:
        "Kodak Portra 400, marigold-orange-magenta-cobalt palette, fine grain, respectful editorial-card finish",
    },
  },
  {
    id: "card-birthday",
    name: "Happy Birthday Card",
    blurb: "A joyful birthday card with cake, streamers, warm candlelight and room for a greeting.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-birthday.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 warm happy-birthday card portrait",
      camera:
        "Fuji GFX medium format with a 63mm f/2.8, slightly low eye-level from across the table, composition with deliberate negative space upper-left for birthday greeting text",
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
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 warm Halloween-card family portrait",
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
    blurb: "A harvest table in amber light. Gratitude, a full spread, hands clasped.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-thanksgiving.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 Thanksgiving-card family portrait",
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
    blurb: "Confetti, black-tie, a midnight toast. The year ahead looks cinematic.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-new-years.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 glamorous New-Year's-card family portrait",
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
    blurb: "Caps, gowns, golden afternoon light. A quiet moment before the next chapter.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-graduation.jpg",
    aspectRatio: "2:3",
    supportsPets: false,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 warm graduation-card family portrait",
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
    blurb: "Soft window light, a sleeping newborn, the family gathered. Tender space for a name.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-newborn.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 tender newborn-announcement family portrait",
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
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 romantic save-the-date engagement portrait",
      camera:
        "Contax 645 medium format with 80mm f/2 Zeiss Planar, chest-up composition, deliberate negative space lower-right for a serif greeting and date",
      lighting:
        "warm low golden-hour sun backlighting the couple, gentle field-bounced fill, soft hair rim, dreamy haze",
      style:
        "Kodak Portra 400 medium format, romantic cream-and-blush editorial palette, fine grain, magazine wedding-editorial polish",
    },
  },
  {
    id: "card-anniversary",
    name: "Happy Anniversary Card",
    blurb:
      "A romantic anniversary portrait with soft flowers, candlelight and elegant space for a message.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-save-the-date.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 romantic happy-anniversary card portrait",
      camera:
        "Contax 645 medium format with 80mm f/2 Zeiss Planar, gentle chest-up composition, deliberate negative space upper-right for anniversary greeting text",
      lighting:
        "soft golden-hour or candlelit glow with warm rim light, gentle floral bounce and creamy highlight roll-off",
      style:
        "Kodak Portra 400 medium format, romantic cream-blush-gold palette, fine grain, elegant editorial-card finish",
    },
  },
  {
    id: "card-mothers-day",
    name: "Mother's Day Card",
    blurb:
      "A garden in full bloom, soft pastels and a tender airy portrait with room for a sweet note.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-mothers-day.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 tender Mother's-Day-card family portrait",
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
    blurb: "A backyard catch with the kids, golden-afternoon light, room for a warm short note.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-fathers-day.jpg",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 warm Father's-Day-card family portrait",
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
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 festive Lunar-New-Year family portrait",
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
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 warm Hanukkah-card family portrait",
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
  const cardOrder = new Map(
    [
      "card-christmas",
      "card-easter",
      "card-hanukkah",
      "card-diwali",
      "card-nowruz",
      "card-lunar-new-year",
      "card-eid",
      "card-dia-de-muertos",
      "card-birthday",
      "card-anniversary",
      "card-save-the-date",
      "card-mothers-day",
      "card-fathers-day",
    ].map((id, index) => [id, index]),
  );

  return {
    photoreal: THEMES.filter((t) => t.category === "photoreal"),
    stylized: THEMES.filter((t) => t.category === "stylized"),
    card: THEMES.filter((t) => t.category === "card").sort(
      (a, b) =>
        (cardOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (cardOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    ),
  };
}

/**
 * Build a PromptSpec for a custom user-described vibe.
 *
 * The user's free-form description is carried on the synthetic Theme's
 * `blurb` (see `buildCustomTheme`), which the prompt composer reads as the
 * "Theme atmosphere" sentence. The spec below contributes tasteful
 * photographic defaults (optics, light, film stock) that sit alongside
 * the user's creative direction.
 */
function buildCustomSpec(opts: { aspectRatio: AspectRatio }): PromptSpec {
  return {
    assetType: `A ${opts.aspectRatio} cinematic color photograph`,
    camera:
      "tasteful documentary framing, a 50mm-equivalent field of view, eye-level composition, shallow depth of field",
    lighting:
      "soft natural light appropriate to the described scene, gentle directional key with subtle fill, honest tonality on skin",
    style:
      "Kodak Portra 400 emulation, subtle natural film grain, warm-neutral editorial palette, no oversaturation",
  };
}

/** A synthetic Theme object built from a custom-vibe generation row. */
export function buildCustomTheme(opts: { description: string; aspectRatio: AspectRatio }): Theme {
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

export function withAspectRatioOverride(theme: Theme, aspectRatio: AspectRatio): Theme {
  if (theme.aspectRatio === aspectRatio) return theme;
  return {
    ...theme,
    aspectRatio,
    spec: {
      ...theme.spec,
      assetType: theme.spec.assetType.replace(/\b[1234]:[1234]\b/u, aspectRatio),
    },
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
      generation.customVibeDescription?.trim() || "A warm, honest family portrait.";
    const aspectRatio = (generation.aspectRatio as AspectRatio | null) ?? "2:3";
    return buildCustomTheme({ description, aspectRatio });
  }
  const theme = getTheme(generation.themeId);
  if (generation.aspectRatio && generation.aspectRatio !== theme.aspectRatio) {
    return withAspectRatioOverride(theme, generation.aspectRatio as AspectRatio);
  }
  return theme;
}
