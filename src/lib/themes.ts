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
  /** Setting, mood, and environment. No crop, pose, subject scale, or roster references. */
  scene?: string;
  /** Camera, lens, angle, framing. For non-photo themes: viewpoint / engine. No roster references. */
  camera: string;
  /** Composition geometry only. Pose, crop, subject scale, and negative space stay dynamic. */
  composition?: string;
  /** Direction + quality of light + mood. No roster references. */
  lighting: string;
  /** Film stock / rendering engine / texture / palette. No roster references. */
  style: string;
  /** IP, text, watermark, logo, and theme-specific safety constraints. */
  safety?: string;
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

export const LUXURY_CARVED_NUMBER_BIRTHDAY_THEME_ID = "card-luxury-carved-number-birthday";

export function getRequiredCardTextError(
  theme: Pick<Theme, "id">,
  cardText?: string | null,
): string | null {
  if (theme.id !== LUXURY_CARVED_NUMBER_BIRTHDAY_THEME_ID) return null;

  const trimmed = cardText?.trim() ?? "";
  if (!trimmed) return "Add birthday card text with the age for this carved-number card.";
  if (!/\d/u.test(trimmed)) {
    return "Include the birthday age in the card text so the carved number is correct.";
  }
  return null;
}

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
    name: "Studio",
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
      "A dramatic King of Pop Stage Portrait family shoot with glittering spotlights, sharp tailoring, moonlit floor glow, smoke, and IP-safe 1980s pop-superstar energy.",
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
        "King of Pop Stage Portrait vibe, IP-safe 1980s pop superstar stage energy, no celebrity likeness, no names, no logos, no text, no watermark; one selected adult may wear a vivid red military-style performance jacket with gold accents, black cropped pants, bright white socks and black loafers; another selected cast member may wear a black fedora-inspired hat; children wear coordinated sparkling black-and-white stage outfits; premium editorial quality",
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
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 cinematic space-adventure family portrait",
      camera:
        "large-format digital cinema camera with a 40mm anamorphic lens, heroic vertical group framing, desert horizon and starship-hangar silhouettes layered behind the cast",
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
    coverImage: "/samples/theme-iconic-crosswalk-album-cover.png",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 vertical text-free premium social teaser image",
      scene:
        "quiet London-like city zebra crosswalk, soft overcast daylight, clean editorial street-crossing portrait",
      camera:
        "medium-format film camera with a 50mm lens, straight-on street-level vertical perspective",
      composition:
        "side-oriented cinematic crosswalk walk, mostly side-facing bodies with slight natural face turns toward camera for readable faces, clean zebra-crossing geometry in the foreground",
      lighting:
        "soft overcast London-like city daylight, gentle pavement bounce fill, low contrast with crisp silhouettes and polished readable faces",
      style:
        "classic late-1960s British music-magazine energy, tailored coats and boots, muted black, cream, camel, gray and brick palette, subtle film grain, cinematic editorial realism, polished but natural family mood",
      safety:
        "original street scene, no exact album recreation, no band likeness, no logos, no text, no watermark, not a posed sidewalk fashion portrait",
    },
  },
  {
    id: "runway-editor-in-chief-family-editorial",
    name: "Runway Editor-in-Chief Family Editorial",
    blurb:
      "A polished high-fashion magazine family shoot with sharp tailoring, glossy editorial light, city office and runway mood, confident poses, and a luxury neutral palette.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-runway-editorial.png",
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
    coverImage: "/samples/theme-noughties-family-throwback.png",
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
  {
    id: "dockside-family-weekend",
    name: "Dockside Family Weekend",
    blurb:
      "Weathered planks, lake light, striped towels, canvas totes, and the easy rhythm of a long summer weekend by the dock.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-dockside-family-weekend.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 warm lakeside editorial family photograph",
      scene:
        "a quiet wooden dock at a lake house, still water, pine shoreline, folded towels, canvas totes, boat cushions and summer-weekend details without visible brands",
      camera:
        "Contax 645 medium format with an 80mm lens, low dock-level environmental portrait perspective, readable faces with water and shoreline context",
      lighting:
        "late-afternoon sun skimming across the lake, soft water-bounced fill, warm rim light on hair and shoulders, gentle highlight sparkle without blown-out whites",
      style:
        "Kodak Portra 400 medium format, lake blue, sun-faded red, towel stripe, pine green and warm cedar palette, relaxed documentary polish, no boat logos or marina branding",
    },
  },
  {
    id: "backyard-sports-day-portrait",
    name: "Backyard Sports Day Portrait",
    blurb:
      "A friendly backyard field day with clean jerseys, chalk lines, lawn games, ribbons, sneakers, and bright competitive joy.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-backyard-sports-day-portrait.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 upbeat backyard sports-day family photograph",
      scene:
        "a tidy backyard or neighborhood grass field set for a friendly family sports day, chalk lane marks, cones, ribbon markers, lawn-game props and blank athletic tops with no team identifiers",
      camera:
        "sports-lifestyle photographer perspective with a 35mm lens, low eye-level framing, enough space for full-body motion and readable faces",
      lighting:
        "bright late-morning sun softened by open shade, crisp grass bounce, clean rim highlights on active silhouettes and clear skin tones",
      style:
        "commercial lifestyle sports photography, fresh grass green, sky blue, white, red and sunny yellow accents, realistic motion, print-ready color, no club crests, sponsors, league marks or athlete likeness",
    },
  },
  {
    id: "slow-travel-summer-picnic",
    name: "Slow Travel Summer Picnic",
    blurb:
      "A checked blanket, market fruit, linen layers, paper maps, wildflowers, and unhurried travel light on a warm afternoon.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-slow-travel-summer-picnic.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 sunlit slow-travel picnic family photograph",
      scene:
        "a scenic summer picnic near a quiet meadow, canal path or village overlook, checked blanket, market fruit, paper maps, woven basket, wildflowers and simple travel details",
      camera:
        "Leica M10 with a 35mm Summilux lens, blanket-level documentary framing, relaxed environmental portrait with landscape and picnic textures held in balance",
      lighting:
        "soft golden afternoon light filtered through trees, grass-bounced fill, gentle haze in the background and flattering open shade on faces",
      style:
        "Kodak Gold 200 travel-photo warmth, cream linen, tomato red, meadow green, sky blue and sunflower yellow palette, natural grain, unhurried editorial keepsake finish",
    },
  },
  {
    id: "sunset-festival-family-glow",
    name: "Sunset Festival Family Glow",
    blurb:
      "String lights, paper lanterns, food-stall color, face-safe sparkle, and golden-hour festival warmth without the late-night edge.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-sunset-festival-family-glow.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 golden-hour outdoor festival family portrait",
      scene:
        "a family-friendly summer festival lane at sunset, string lights, paper lanterns, colorful fabric flags, simple food-stall shapes and soft crowd-free background atmosphere",
      camera:
        "digital medium-format portrait camera with a 55mm lens, vertical editorial framing, shallow depth of field with glowing lights and clean subject separation",
      lighting:
        "warm sunset backlight mixed with amber lantern glow, soft front fill for readable faces, gentle bokeh highlights and controlled contrast",
      style:
        "premium outdoor lifestyle photography, coral, teal, marigold, denim and warm cream palette, tasteful face-safe sparkle details, joyful print-ready glow, no alcohol cues, drug cues, logos or performer likeness",
    },
  },
  {
    id: "summer-color-pop-studio",
    name: "Summer Color Pop Studio",
    blurb:
      "A crisp studio portrait with bold summer color blocks, glossy props, bright wardrobe accents, and clean commercial polish.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-summer-color-pop-studio.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 high-key summer color-pop studio family portrait",
      scene:
        "a clean seamless studio with bold color-block panels, glossy beach-ball shapes, simple sunglasses, striped mats and summer props without readable text or brands",
      camera:
        "digital medium-format camera with a 50mm lens, straight-on commercial studio framing, graphic spacing with crisp silhouettes and visible hands",
      lighting:
        "large high-key softboxes, polished catchlights, clean contact shadows on the cyclorama floor and saturated color reflections kept off skin tones",
      style:
        "bright commercial campaign photography, turquoise, cherry red, lemon yellow, white and grass green palette, glossy summer energy, natural facial detail, no logos, no text, no watermark",
    },
  },
  {
    id: "whimsical-adventure-postcard",
    name: "Whimsical Adventure Postcard",
    blurb:
      "A playful original travel postcard come to life with painted skies, oversized luggage, map edges, and storybook-adventure charm.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-whimsical-adventure-postcard.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 whimsical illustrated travel-postcard family portrait",
      scene:
        "an original storybook travel scene with rolling hills, a tiny station platform or scenic overlook, oversized luggage, map-border shapes and decorative postcard framing with no readable text",
      camera:
        "storybook illustration viewpoint with a gentle three-quarter perspective, clear character silhouettes, readable faces and a balanced postcard layout",
      lighting:
        "warm painted sunset wash, soft sky glow, gentle rim highlights and cheerful color separation across the scene",
      style:
        "hand-painted gouache and watercolor postcard texture, sky blue, leaf green, poppy red, butter yellow and warm paper palette, family-safe adventure mood, no franchise characters, no logos, no text, no watermark",
    },
  },
  {
    id: "retro-summer-postcard",
    name: "Retro Summer Postcard",
    blurb:
      "A sun-washed family vacation portrait with postcard color, retro stripes, summer linens, and soft film-camera nostalgia.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-retro-summer-postcard.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 nostalgic summer-postcard family photograph",
      scene:
        "a beach, lake, or picnic-safe summer backdrop with sun-faded towels, striped fabric, casual linen layers, warm sand or grass, and a clean print-ready vacation setting",
      camera:
        "35mm film camera with a 40mm lens, relaxed eye-level vacation portrait framing, postcard-balanced spacing with readable faces and a hint of scenic context",
      composition:
        "gentle diagonal spacing, clean printed-postcard margins, no app interface, no stickers, no readable captions",
      lighting:
        "warm late-afternoon sunlight with soft bounce fill, mild rosy highlight warmth, gentle haze and crisp facial detail without heavy filter effects",
      style:
        "retro summer travel photography, rose-tinted film warmth, cream, coral, sky blue, grass green and sun-yellow accents, subtle grain, polished keepsake finish",
      safety:
        "original vacation scene, no brand names, no recognizable social app interface, no celebrity likeness, no logos, no text, no watermark",
    },
  },
  {
    id: "toy-box-keepsake-portrait",
    name: "Toy-Box Keepsake Portrait",
    blurb:
      "A bright playroom keepsake portrait with wooden blocks, storybooks, handmade toys, soft primary color, and childlike wonder.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-toy-box-keepsake-portrait.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 whimsical playroom family keepsake portrait",
      scene:
        "a bright nursery or playroom with generic wooden blocks, handmade plush keepsakes, picture books, soft rugs, storage cubbies and tidy colorful childhood details",
      camera:
        "digital medium-format camera with a 45mm lens, low seated-level framing, playful environmental portrait perspective with clean face readability",
      composition:
        "balanced floor-level rug geometry, clear sightlines through the toy details, visible hands and uncluttered toy-box texture",
      lighting:
        "large soft window light with gentle wall bounce, bright catchlights, pastel shadow detail and no harsh flash",
      style:
        "premium keepsake lifestyle photography, soft primary colors, warm cream, maple wood, gentle blue and red accents, tactile nursery textures, print-ready polish",
      safety:
        "generic handmade toys only, no branded toy shapes, no franchise characters, no studio names, no mascot characters, no logos, no readable text",
    },
  },
  {
    id: "cool-blue-lake-day",
    name: "Cool Blue Lake Day",
    blurb:
      "A crisp cool-blue lake portrait with airy dock light, linen and denim styling, glacier-blue accents, and calm editorial freshness.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-cool-blue-lake-day.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 crisp cool-blue lakeside family photograph",
      scene:
        "a quiet lake dock or airy coastal overlook with still water, pale sky, weathered planks, clean towels, simple picnic details and calm summer freshness",
      camera:
        "Contax 645 medium format with an 80mm lens, eye-level editorial portrait framing, waterline and sky used as clean graphic layers",
      composition:
        "premium negative space, faces held in the brighter third, dock or shoreline lines guiding into the frame",
      lighting:
        "clean natural morning light, cool sky fill, subtle water bounce, dewy highlight freshness and crisp skin detail",
      style:
        "cool blue editorial photography, glacier blue, pale denim, white linen, cloud cream and soft silver palette, restrained contrast, print-ready premium finish",
      safety:
        "modest summer styling, no swimwear-forward posing, no revealing wardrobe, no brands, no logos, no text, no watermark",
    },
  },
  {
    id: "poetcore-family-library-portrait",
    name: "Poetcore Family Library Portrait",
    blurb:
      "A warm library portrait with oversized knits, vintage blazers, book props, handwritten card details, and soft literary intimacy.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-poetcore-family-library-portrait.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 warm literary-library family portrait",
      scene:
        "a cozy home library or study with wood shelves, stacked books, a writing desk, blank handwritten cards, messenger satchel details, oversized knits and vintage blazers",
      camera:
        "medium-format portrait camera with a 55mm lens, vertical waist-up to knee-up framing, intimate study-room depth and clear face priority",
      composition:
        "triangular portrait arrangement near a reading chair, desk or shelves, with book and letter details kept secondary",
      lighting:
        "soft window light through sheer curtains, warm desk-lamp glow, gentle amber fill across wood shelves and flattering falloff on faces",
      style:
        "literary editorial photography, wool, tweed, oxblood, parchment, moss green and warm walnut palette, quiet protagonist mood, gallery-print finish",
      safety:
        "original library setting, no author likeness, no public-figure resemblance, no readable copyrighted text, no brand logos, no watermark",
    },
  },
  {
    id: "butter-yellow-summer-portrait",
    name: "Butter Yellow Summer Portrait",
    blurb:
      "Soft butter-yellow wardrobe notes, pale florals, sunlit linen, and relaxed summer brightness with a polished editorial finish.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-butter-yellow-summer-portrait.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 bright summer editorial family photograph",
      scene:
        "a sunny porch, garden path or coastal cottage setting with pale florals, linen textures, woven baskets and butter-yellow wardrobe accents",
      camera:
        "digital medium-format camera with a 55mm lens, relaxed eye-level portrait perspective, crisp faces with airy summer context",
      composition:
        "loose editorial grouping with breathable negative space, natural hand placement, clean sightlines and no crowded prop styling",
      lighting:
        "soft late-morning sunlight filtered through white curtains or light foliage, creamy bounce fill and gentle highlight rolloff",
      style:
        "premium summer lifestyle photography, butter yellow, white linen, hydrangea blue, leaf green and warm cream palette, natural skin texture, print-ready polish",
      safety:
        "modest summer wardrobe, no brand logos, no readable text, no celebrity likeness, no political symbols, no watermark",
    },
  },
  {
    id: "scarf-garden-story",
    name: "Scarf Garden Story",
    blurb:
      "A breezy garden portrait with silk-scarf color, climbing greenery, dappled light, and storybook-summer ease.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-scarf-garden-story.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 garden-editorial family photograph",
      scene:
        "a leafy garden walkway with climbing greenery, simple flowers, linen layers and silk-scarf-inspired color accents used as wardrobe or picnic details",
      camera:
        "Fuji GFX medium format with a 63mm lens, vertical environmental portrait framing, faces prioritized against soft garden depth",
      composition:
        "gentle S-curve garden path composition, selected cast held in the brighter center third, scarf details secondary and not covering faces",
      lighting:
        "dappled open-shade sunlight, soft leaf-filtered highlights, warm garden bounce and clean facial detail",
      style:
        "romantic summer editorial photography, sage, poppy red, cream, pale yellow and soft blue accents, tactile fabric texture, refined keepsake finish",
      safety:
        "original scarf and garden styling only, no luxury-brand patterns, no logos, no readable text, no celebrity resemblance, no watermark",
    },
  },
  {
    id: "butter-yellow-summer-card",
    name: "Butter Yellow Summer Card",
    blurb:
      "Warm cream, butter-yellow accents, linen textures, soft summer light, and clean print-ready card space.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-butter-yellow-summer-card.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 warm summer family greeting-card portrait",
      scene:
        "a sun-washed cream porch, garden wall or airy cottage entry with pale flowers, linen textures, cotton layers, woven details and butter-yellow accent styling",
      camera:
        "digital medium-format camera with a 55mm lens, vertical card-ready portrait framing, crisp faces and refined lifestyle polish",
      composition:
        "balanced portrait-card layout with generous pale negative space reserved for typography, relaxed grouping, clear sightlines and no cluttered prop styling",
      lighting:
        "soft summer daylight filtered through white curtains or open shade, creamy bounce fill, gentle highlight rolloff and natural skin detail",
      style:
        "premium warm-weather card photography, butter yellow, sun-washed cream, white linen, pale floral green and soft gold palette, natural fabric texture, print-ready finish",
      safety:
        "original summer-card styling only, modest wardrobe, no swimwear-forward posing, no neon, no logos, no readable text besides provided card text, no watermark",
    },
  },
  {
    id: "joyful-photo-dump",
    name: "Joyful Photo Dump",
    blurb:
      "A polished candid family portrait with mid-laugh energy, soft flash, tiny motion, and layered snapshot-card charm.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-joyful-photo-dump.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 polished candid social-native family portrait",
      scene:
        "a bright home entry, sunlit stoop or clean sidewalk moment with layered blank snapshot cards, casual outfit texture and cheerful everyday movement",
      camera:
        "35mm lifestyle camera at close eye level, spontaneous mid-laugh framing with hands on shoulders and readable faces",
      composition:
        "organized snapshot-card layering behind the portrait, face-first grouping, gentle off-center crop and no collage elements covering expressions",
      lighting:
        "soft direct flash balanced with daylight, bright catchlights, controlled shadows and crisp facial detail with only subtle motion in hair or fabric",
      style:
        "premium casual flash photography, clean neutrals, denim blue, cream, soft green and warm skin tones, social-native polish, print-ready clarity",
      safety:
        "original candid-photo styling only, no celebrity likeness, no platform logos, no song names, no audio references, no alcohol cues, no readable text, no watermark",
    },
  },
  {
    id: "storybook-ocean-quest",
    name: "Storybook Ocean Quest",
    blurb:
      "A bright tide-pool adventure with watercolor ocean blues, seashell props, sketchbook details, and safe shoreline wonder.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-storybook-ocean-quest.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 bright watercolor storybook family adventure portrait",
      scene:
        "a safe shallow shoreline beside tide pools with seashells, sea-glass color, blank sketchbook pages, paper-map shapes and clear coastal sky",
      camera:
        "storybook illustration viewpoint with a gentle three-quarter shoreline perspective, readable faces and stable shallow-water posture",
      composition:
        "open-sky storybook layout with decorative shell and seaweed border details, the portrait action kept away from deeper water and clear central face space",
      lighting:
        "luminous coastal daylight, bright watercolor sky wash, soft ocean bounce and cheerful blue-green color separation",
      style:
        "watercolor and colored-pencil storybook rendering, ocean blue, sea-glass green, coral, sand, cream and sunlit yellow palette, polished printable keepsake texture",
      safety:
        "original ocean-story styling only, no franchise characters, no protected character cues, no deep-water danger, no cultural costume styling, no logos, no readable text, no watermark",
    },
  },
  {
    id: "summer-color-hunt",
    name: "Summer Color Hunt",
    blurb:
      "A playful outdoor color-search portrait with swatches, flowers, fruit, and bright discovery energy without app or brand cues.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-summer-color-hunt.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 playful outdoor color-hunt family photograph",
      scene:
        "a garden, park or backyard setup with simple color swatches, flowers, fruit bowls and chalk-free discovery props arranged like a family color scavenger hunt",
      camera:
        "commercial lifestyle camera with a 35mm lens, active eye-level framing with enough space for gestures and readable faces",
      composition:
        "bright color clusters balanced around the selected cast, props clearly secondary, no boards, posters or readable labels",
      lighting:
        "clear open-shade summer daylight, crisp catchlights, gentle grass bounce and clean saturated accents without harsh contrast",
      style:
        "fresh lifestyle photography, tomato red, lemon yellow, sky blue, leaf green and white accents, cheerful editorial polish, natural expressions",
      safety:
        "generic color-play setup, no social app interface, no logos, no readable text, no branded packaging, no watermark",
    },
  },
  {
    id: "poetcore-porch",
    name: "Poetcore Porch",
    blurb:
      "A cozy porch or garden-bench portrait with vintage layers, satchel details, stationery props, and late-afternoon letter mood.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-poetcore-porch.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 cozy literary-porch family portrait",
      scene:
        "a covered porch, garden bench or library-window threshold with soft plants, a satchel, generic books, stationery, blank letter paper and vintage blazer-cardigan layers",
      camera:
        "medium-format portrait camera with a 55mm lens, vertical porch-level framing, intimate environmental depth and clear face priority",
      composition:
        "relaxed seated-and-standing porch arrangement, props kept secondary, clean blank paper areas and no book covers facing camera",
      lighting:
        "late-afternoon porch shade with warm side light, soft window glow, gentle amber bounce and flattering falloff on faces",
      style:
        "warm literary editorial photography, tweed, wool, cardigan knit, parchment, garden green and walnut palette, handwritten-letter mood without readable marks, gallery-print finish",
      safety:
        "original cozy-porch styling only, no gloomy academic darkness, no author likeness, no smoking cues, no alcohol cues, no copyrighted book covers, no readable text, no watermark",
    },
  },
  {
    id: "family-watch-party",
    name: "Family Watch Party",
    blurb:
      "A cozy game-day living room portrait with blank banners, snacks, pillows, and team-color energy without real teams or logos.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-family-watch-party.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 cozy family watch-party photograph",
      scene:
        "a comfortable living room arranged for a family watch party, sofa blankets, snack bowls, blank pennants, color-block pillows and a soft TV glow with no visible screen content",
      camera:
        "documentary lifestyle camera with a 35mm lens, sofa-level environmental portrait framing, readable faces and warm room context",
      composition:
        "layered sofa grouping with snack table foreground kept tidy, blank decor areas only, no readable signs or scoreboards",
      lighting:
        "soft window light mixed with gentle screen-like blue fill and warm lamp glow, balanced skin tones and clear subject separation",
      style:
        "premium at-home lifestyle photography, navy, cream, red, green and warm wood palette, cozy energetic finish, no team identifiers",
      safety:
        "fictional watch party only, no real teams, no league names, no logos, no alcohol cues, no readable text, no watermark",
    },
  },
  {
    id: "ocean-explorer-card",
    name: "Ocean Explorer Card",
    blurb:
      "A bright adventure-card portrait with tide-pool blues, paper-map shapes, shells, and clean space for a greeting.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-ocean-explorer-card.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 3:2 ocean-adventure greeting-card family portrait",
      scene:
        "a family-friendly shoreline exploration scene with tide pools, shells, compass-like decorative shapes, paper-map edges and airy negative space for greeting text",
      camera:
        "polished card-art viewpoint with a gentle three-quarter shoreline perspective, readable faces and clean separation from decorative map details",
      composition:
        "stable greeting-card layout with open sky or pale sand reserved for typography, selected cast grouped away from the text area",
      lighting:
        "fresh coastal morning light, soft ocean bounce, bright catchlights and clear blue-green color separation",
      style:
        "premium illustrated-photo hybrid card art, sea glass blue, coral, sand, white and kelp green palette, print-ready texture and no fake readable labels",
      safety:
        "original ocean exploration styling only, no franchise adventure cues, no resort logos, no readable map text, no water-danger scene, no watermark",
    },
  },
  {
    id: "time-travel-toy-shelf",
    name: "Time-Travel Toy Shelf",
    blurb:
      "A nostalgic shelf-world portrait with handmade toys, tiny eras, warm dust motes, and no branded characters.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/theme-time-travel-toy-shelf.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType:
        "A 3:2 whimsical miniature toy-shelf portrait of the subjects transformed into handmade toy figurines",
      scene:
        "an imaginative toy shelf arranged like tiny time capsules, generic wooden toys, handmade blocks, blank book spines, paper stars and warm nostalgic keepsake objects",
      camera:
        "miniature-world camera perspective with shallow shelf depth, readable toy-figurine faces, tactile toy details and gentle scale play",
      composition:
        "the subjects reimagined as a small handmade toy-figurine group framed among shelf levels and toy vignettes, uncluttered face sightlines, decorative blank labels only",
      lighting:
        "warm window beam through dust motes, soft shelf shadows, cozy amber fill and polished subject clarity",
      style:
        "storybook miniature realism, carved wood and soft fabric doll textures, simplified button-like features adapted from each reference face, maple wood, faded primary colors, cream paper and warm amber palette, handmade texture, print-ready charm",
      safety:
        "transform people into original handmade toy figurines, do not render full-size real human people, generic handmade toys only, no branded toys, no copyrighted characters, no logos, no readable book titles, no watermark",
    },
  },
  {
    id: "retro-jazz-porch",
    name: "Retro Jazz Porch",
    blurb:
      "A relaxed porch portrait with vintage radio warmth, brass accents, striped shade, and family-safe backyard rhythm.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-retro-jazz-porch.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 retro porch family photograph",
      scene:
        "a shaded front porch or backyard stoop with a vintage-style radio, blank record sleeves, woven chairs, potted plants, brass-toned accents and striped awning shade",
      camera:
        "35mm film camera with a 45mm lens, relaxed porch-level portrait framing, readable faces with tactile home details",
      composition:
        "casual seated-and-standing porch arrangement, music props kept decorative, no readable album art or performer references",
      lighting:
        "late-afternoon porch shade with warm side light, soft amber bounce from wood surfaces and gentle filmic contrast",
      style:
        "retro editorial photography, olive, rust, cream, brass, denim and warm wood palette, subtle film grain, cozy musical mood",
      safety:
        "original music-inspired porch scene, no musician likeness, no album covers, no venue logos, no readable text, no alcohol cues, no watermark",
    },
  },
  {
    id: "future-glow-family",
    name: "Future Glow Family",
    blurb:
      "A clean optimistic tech-family portrait with pearl highlights, opalescent accessories, subtle chrome, and cool blue-lilac light.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-future-glow-family.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 clean futuristic studio family portrait",
      scene:
        "a bright modern studio with soft curved panels, pearl surfaces, subtle chrome accents, cool blue-lilac glow and playful metallic accessories",
      camera:
        "digital medium-format portrait camera with an 80mm lens, vertical studio framing, polished face-first arrangement and clean negative space",
      composition:
        "optimistic tech-portrait layout with curved architectural lines behind the group, metallic accessories kept secondary and natural body proportions preserved",
      lighting:
        "cool blue and lilac studio key light with soft warm fill, pearlescent rim highlights, controlled chrome reflections and clean catchlights",
      style:
        "near-future editorial photography, pearl white, opalescent pink, cool blue, soft lilac and subtle silver palette, natural skin texture, premium print finish",
      safety:
        "original future-studio styling only, no franchise cues, no aliens, no weapons, no dystopian atmosphere, no metallic skin distortion, no nightclub styling, no logos, no readable text, no watermark",
    },
  },
  {
    id: "heirloom-pin-portrait",
    name: "Heirloom Pin Portrait",
    blurb:
      "An elegant multi-generation family portrait with heirloom pin accents, neutral tailoring, subtle gold, and warm home-studio polish.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/theme-heirloom-pin-portrait.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 elegant multi-generation family portrait",
      scene:
        "a warm studio or refined home interior with neutral tailoring, heirloom brooch and pin accents, subtle gold-crystal details, soft drapery and quiet framed-art shapes",
      camera:
        "medium-format portrait camera with a 75mm lens, vertical formal-yet-warm framing, refined seated-and-standing arrangement and crisp faces",
      composition:
        "premium print-ready portrait geometry with graceful tiering, uncluttered background, clear hands and subtle jewelry accents visible without dominating",
      lighting:
        "warm studio key light with soft fill, gentle home-interior shadows, gold-toned practical glow and polished skin detail",
      style:
        "premium heirloom portrait photography, ivory, taupe, warm gray, champagne gold and soft crystal highlights, neutral tailoring, timeless gallery-print finish",
      safety:
        "original heirloom styling only, no luxury brands, no funeral styling, no political insignia, no military insignia, no religious symbols unless user-provided, no logos, no readable text, no watermark",
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

  {
    id: "private-jet-family",
    name: "Private Jet Family",
    blurb:
      "Cream leather seats, glowing cabin windows, designer-travel polish. The family as a rich-but-warm private jet editorial.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/best-family-photo-prompts/private-jet-family.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 luxury editorial family photograph",
      scene:
        "inside a private jet cabin above the clouds, cream leather seating, polished wood trim, soft window glow, tasteful travel details and premium luggage without visible brand logos",
      camera:
        "medium-format camera with a 45mm lens, wide cabin portrait perspective, readable faces with aircraft interior context and elegant staggered seating",
      lighting:
        "soft daylight pouring through oval jet windows, warm cabin practicals, controlled fill across faces, glossy highlights on leather and wood",
      style:
        "luxury travel editorial photography, champagne, ivory, walnut, sky blue and gold palette, polished magazine finish, natural skin texture, no airline marks or logos",
    },
  },
  {
    id: "soccer-team-family",
    name: "Soccer Team Family",
    blurb:
      "A pre-game squad photo on the pitch. Matching jerseys, stadium lights, muddy boots, serious game faces.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/best-family-photo-prompts/soccer-team-family.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 professional sports team family photograph",
      scene:
        "on a soccer pitch moments before kickoff, stadium lights, green turf, subtle mist, matching blank jerseys, cleats, one classic soccer ball as a prop, no club crests or sponsors",
      camera:
        "sports photographer perspective with a 35mm lens, low eye-level squad-photo framing, strong horizontal lineup geometry with slight coach-poster drama",
      lighting:
        "bright stadium floodlights with crisp rim highlights, cool evening ambient fill, clean shadow separation on the turf",
      style:
        "realistic sports photography, saturated grass green, white kit accents, cinematic contrast, sharp faces, professional team-photo polish, no copyrighted logos",
    },
  },
  {
    id: "white-cyclorama-exaggerated-faces",
    name: "White Cyclorama Faces",
    blurb:
      "Clean white studio, fashion-campaign light, and a different exaggerated expression on every face.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/best-family-photo-prompts/white-cyclorama-exaggerated-faces.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 high-key studio family portrait",
      scene:
        "a seamless white cyclorama studio with clean floor curve, minimal props, fashion-campaign emptiness, playful exaggerated facial expressions and body language",
      camera:
        "digital medium-format camera with a 50mm lens, straight-on full-to-three-quarter body studio framing, graphic spacing and crisp subject separation",
      lighting:
        "large high-key softboxes, clean shadow control, glossy catchlights, bright white backdrop with subtle floor contact shadows",
      style:
        "premium studio campaign photography, bright white and soft neutral palette, crisp faces, playful expression-driven energy, polished commercial retouch without plastic skin",
    },
  },
  {
    id: "zero-gravity-family",
    name: "Zero Gravity Family",
    blurb:
      "Hair, socks, toys and snacks floating in a bright space-station portrait with Earth outside the window.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/best-family-photo-prompts/zero-gravity-family.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 cinematic zero-gravity family photograph",
      scene:
        "inside a bright space-station module, Earth visible through a round window, floating toys, snacks, socks and hair suspended naturally in microgravity, clean family-friendly sci-fi details",
      camera:
        "wide 28mm cinematic camera perspective, floating mid-room composition with readable faces and curved station architecture around the group",
      lighting:
        "soft cool daylight from the Earth-facing window, gentle white cabin fill, subtle blue rim light and clean highlights on metal surfaces",
      style:
        "believable near-future space photography, white, silver, sky-blue and soft orange palette, cinematic realism, no franchise suits, no space agency logos",
    },
  },
  {
    id: "western-wanted-family",
    name: "Western Wanted Family",
    blurb:
      "Sepia parchment, dusty outlaw poses, cowboy hats, saloon drama, and funny-serious wanted-poster faces.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/best-family-photo-prompts/western-wanted-family.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 vintage far-west wanted-poster family portrait",
      scene:
        "aged sepia parchment poster treatment, old saloon atmosphere, dust coats, cowboy hats, worn wood, playful outlaw styling, humorous serious expressions, weathered paper edges",
      camera:
        "front-facing portrait-poster composition with subtle vintage lens distortion, stacked poster hierarchy and space for decorative western typography-style ornaments without readable real text",
      lighting:
        "warm saloon-window side light, smoky amber fill, dramatic cheek shadows, antique studio falloff",
      style:
        "old western lithograph and sepia photo hybrid, brown parchment, black ink, faded cream and dusty amber palette, distressed print texture, no real weapons emphasized, no gore",
    },
  },
  {
    id: "fluffy-cloud-family",
    name: "Fluffy Cloud Family",
    blurb:
      "A dreamy portrait on a soft cloud at blue-pink sunrise, pastel glow, pajamas, robes, and sky magic.",
    category: "photoreal",
    provider: "nanobanana",
    coverImage: "/samples/best-family-photo-prompts/fluffy-cloud-family.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    spec: {
      assetType: "A 3:2 dreamy magical-realism family photograph",
      scene:
        "posing on a giant fluffy cloud high in the sky, blue and pink sunrise, soft pastel horizon, cozy pajamas and robes, gentle wind, peaceful whimsical atmosphere",
      camera:
        "cinematic portrait camera with a 50mm lens, slightly low floating perspective, airy negative space and readable faces against the sunrise sky",
      lighting:
        "pink sunrise rim light, soft blue skylight fill, glowing cloud bounce from below, gentle halation and pastel highlight bloom",
      style:
        "magical-realism photography, blush pink, sky blue, cream and warm gold palette, photoreal faces with dreamlike environment polish, no angel or religious iconography",
    },
  },
  {
    id: "cereal-box-family",
    name: "Cereal Box Family",
    blurb:
      "The family as the mascots on a giant colorful breakfast cereal box, glossy, loud, and supermarket-ready.",
    category: "stylized",
    provider: "nanobanana",
    coverImage: "/samples/best-family-photo-prompts/cereal-box-family.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    spec: {
      assetType: "A 2:3 glossy breakfast-cereal box family illustration",
      scene:
        "a giant colorful cereal package design, oversized spoons, flying cereal rings, milk splash shapes, playful supermarket packaging energy, blank made-up branding areas with no readable real brand names",
      camera:
        "front-facing product-packaging composition, bold central mascot-style family pose, dynamic diagonal cereal motion and clean readable silhouette hierarchy",
      lighting:
        "bright commercial product lighting, glossy highlights, crisp shadows, high-energy color pop",
      style:
        "premium cartoon-packaging illustration, saturated rainbow breakfast colors, shiny box texture, playful mascot charm, clean vector-like edges mixed with polished 3D depth, no real cereal logos",
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
    id: LUXURY_CARVED_NUMBER_BIRTHDAY_THEME_ID,
    name: "Luxury Carved Number Birthday Poster",
    blurb:
      "A premium off-white paper wall with the birthday age carved deep into it, balloons and florals inside, and the child breaking the frame in a luxe 3D poster look.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-card-luxury-carved-number-birthday.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 professional luxury carved-number birthday card portrait",
      scene:
        "a premium off-white luxury paper textured wall with a large birthday-age number precisely carved into it, visible paper thickness, realistic inner depth, believable shadowed cut edges, soft balloons, subtle white flowers and an elegant bouquet arrangement inside the carved opening",
      composition:
        "clean minimalist luxury magazine-cover layout with the carved number dominating the frame, realistic 3D breakthrough depth at the number edge, and calm wall space reserved for the supplied greeting",
      camera:
        "medium-format premium studio photography, sharp focus, realistic skin, straight-on vertical card framing, refined negative space for wall typography and a print-ready 2:3 crop",
      lighting:
        "Warm cinematic sunlight from one side, soft rim light, realistic inner shadows inside the carved number, natural colors, no tree shadows and no fake-looking lighting",
      style:
        "Ultra-realistic high-end art direction, off-white textured paper, soft blue or palette-matched balloons, subtle white flowers, elegant celebration styling, luxury magazine-cover aesthetic, photorealistic skin, no AI artifacts",
      safety:
        "no logos, no watermark, no extra people, no fake tree shadows, no garbled typography, no fixed sample names, no fixed sample age; if the supplied card text includes an age number, the carved number should match it",
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
    id: "neo-deco-celebration-card",
    name: "Neo Deco Celebration Card",
    blurb:
      "An elegant celebration card with geometric arches, brass and chrome accents, cream-black-gold polish, and tasteful festive glamour.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-neo-deco-celebration-card.webp",
    aspectRatio: "2:3",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 2:3 elegant neo-deco celebration-card family portrait",
      scene:
        "a refined celebration-card set with art-deco-inspired geometric arches, brass and chrome accents, cream wall panels, polished floor reflections and a clean greeting area",
      camera:
        "digital medium-format camera with a 65mm portrait lens, vertical card framing with deliberate negative space for greeting text",
      composition:
        "balanced arch geometry, centered vertical rhythm and a readable card layout with faces kept clear of typography space",
      lighting:
        "soft cinematic key light, warm brass glints, gentle chrome rim highlights, controlled festive sparkle and flattering face fill",
      style:
        "neo-deco editorial card design, cream, black, gold, tomato red or emerald accent palette, crisp geometry, polished print finish",
      safety:
        "no speakeasy cues, no alcohol props, no gambling references, no nightlife setting, no logos, no readable venue text, no watermark",
    },
  },
  {
    id: "crochet-raffia-picnic-card",
    name: "Crochet & Raffia Picnic Card",
    blurb:
      "A soft summer picnic card with crochet texture accents, raffia basket details, gingham, citrus color, and natural dewy light.",
    category: "card",
    provider: "nanobanana",
    coverImage: "/samples/theme-crochet-raffia-picnic-card.webp",
    aspectRatio: "3:2",
    supportsPets: true,
    acceptsCardText: true,
    spec: {
      assetType: "A 3:2 soft summer picnic-card family portrait",
      scene:
        "a sunny picnic setup with a gingham blanket, crochet texture accents, raffia basket and hat details, warm cream textiles, fruit, flowers and a clean card greeting area",
      camera:
        "Leica M10 with a 35mm lens, blanket-level lifestyle framing with picnic textures balanced against negative space for greeting text",
      composition:
        "print-friendly card composition with the picnic blanket as a stable foreground grid, soft diagonal grouping and airy margin for typography",
      lighting:
        "natural dewy summer light, open-shade face fill, gentle sun rim through leaves, fresh highlight detail on woven textures",
      style:
        "summer lifestyle card photography, warm cream base with citrus yellow, tomato red, lime and soft green accents, tactile crochet and raffia texture, polished print-ready finish",
      safety:
        "modest casual styling, no brands, no logos, no readable product labels, no text except user-supplied greeting, no watermark",
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
    coverImage: "/samples/theme-card-anniversary.webp",
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
      "card-luxury-carved-number-birthday",
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
