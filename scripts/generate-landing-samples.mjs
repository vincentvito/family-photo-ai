/**
 * Generates real landing-page + theme-cover assets via Replicate's hosted
 * Nano Banana Pro (google/nano-banana-pro — Gemini 3 Pro Image Preview).
 *
 * Resumable — images that already exist on disk are skipped.
 *
 * Run: node scripts/generate-landing-samples.mjs
 *       (add --force to re-generate everything)
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const envText = await fs.readFile(".env", "utf8").catch(() => "");
for (const line of envText.split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error("REPLICATE_API_TOKEN missing");
  process.exit(1);
}

const FORCE = process.argv.includes("--force");

const Replicate = (await import("replicate")).default;
const replicate = new Replicate({ auth: TOKEN });

const OUT = path.resolve("./public/samples");
await fs.mkdir(OUT, { recursive: true });

const MODEL = "google/nano-banana-pro";

/**
 * @typedef {{ id: string, aspect: "1:1"|"4:5"|"3:2"|"2:3"|"16:9", prompt: string, resolution?: "1K"|"2K"|"4K" }} Job
 */

/** @type {Job[]} */
const jobs = [
  {
    id: "hero",
    aspect: "3:2",
    resolution: "4K",
    prompt:
      "Cinematic editorial family portrait: two parents standing close together with a small curly-haired child between them and a calm golden retriever at their feet, on a windswept grass-topped coastal cliff path at late golden hour. Warm backlit rim light, soft amber sky, family looking gently to the side, not posed. Shot on medium format Portra 400 film, soft natural film grain, shallow depth of field, gentle warmth, timeless Annie Leibovitz composition. Earth-tone linen wardrobe. No logos, no text.",
  },

  {
    id: "before-1",
    aspect: "3:2",
    prompt:
      "Amateur iPhone snapshot of a family of four in a modern kitchen on a Sunday morning, harsh overhead fluorescent light, imperfect composition, one child out of focus, clutter on the counter, nobody looking at the camera, realistic candid home phone photo quality, slightly underexposed, visible phone-camera sensor noise. No text.",
  },
  {
    id: "after-1",
    aspect: "3:2",
    prompt:
      "Cinematic editorial family portrait of a family of four in a sunlit kitchen on a Sunday morning, kneading bread at a pale wood island. Soft window light, warm earth tones, genuine emotional connection, shot on medium format film with film grain, shallow depth of field, kinfolk magazine aesthetic. No text.",
  },
  {
    id: "before-2",
    aspect: "3:2",
    prompt:
      "Amateur phone photo of a family of five sprinting around a suburban backyard in autumn, motion blur, crooked framing, one kid cut off at the edge, overcast flat light, realistic iPhone photo of real family chaos. No text.",
  },
  {
    id: "after-2",
    aspect: "3:2",
    prompt:
      "Cinematic documentary family portrait of a family of five gathered on a blanket in a backyard of rust-colored autumn leaves, honest warm faces, overcast golden light filtered through foliage, shot on 35mm film with grain, National Geographic warmth. No text.",
  },
  {
    id: "before-3",
    aspect: "3:2",
    prompt:
      "Overexposed Christmas morning iPhone photo of a family in pajamas in a messy living room, wrapping paper on the floor, a toddler mid-tantrum, flash washout on faces, realistic candid phone snapshot. No text.",
  },
  {
    id: "after-3",
    aspect: "3:2",
    prompt:
      "Tender editorial Christmas-morning family portrait of a family in matching flannel pajamas by a decorated tree, warm lamplight and string-light bokeh, mugs of cocoa, a golden retriever in the frame, candid soft expressions, shot on 50mm film. No text.",
  },

  {
    id: "g-1",
    aspect: "2:3",
    prompt:
      "Golden hour beach family portrait — a family of three and a dog walking barefoot on soft sand, linen and neutral tones, long shadows, backlit ocean haze, shot on medium format film. No text.",
  },
  {
    id: "g-2",
    aspect: "1:1",
    prompt:
      "Family of four sitting on the wooden porch of a cedar cabin in autumn, chunky knits, steaming mugs, golden retriever at their feet, amber foliage, soft overcast light, 35mm film with grain. No text.",
  },
  {
    id: "g-3",
    aspect: "3:2",
    prompt:
      "Bright Kinfolk-style family kitchen scene: parents and two children baking, flour dust in the light, pale wood island, plants, ceramic bowls, warm muted palette, documentary feel. No text.",
  },
  {
    id: "g-4",
    aspect: "1:1",
    prompt:
      "Vintage 1970s Polaroid family snapshot, slightly faded warm colors, soft focus, paper border, natural living room with period-correct furniture, lived-in authentic feeling. No text.",
  },
  {
    id: "g-5",
    aspect: "2:3",
    prompt:
      "Annie Leibovitz style editorial family studio portrait, dramatic Rembrandt side-light, painted umber and teal Old Master backdrop, tailored wardrobe, formal but warm, theatrical stillness. No text.",
  },
  {
    id: "g-6",
    aspect: "3:2",
    prompt:
      "National Geographic style family expedition portrait on a windswept alpine ridge at dawn, technical outerwear in earth tones, mist, low sun through clouds, expansive landscape, documentary realism. No text.",
  },
  {
    id: "g-7",
    aspect: "1:1",
    prompt:
      "Tender Christmas morning family portrait by a decorated tree, matching flannel pajamas, warm lamplight, string-light bokeh, dog in frame, quiet candid honest. No text.",
  },
  {
    id: "g-8",
    aspect: "2:3",
    prompt:
      "Pixar style 3D animated family portrait — soft stylized faces, expressive eyes, subsurface-scattered warm skin, volumetric cinematic lighting, wholesome cheerful mood, shallow depth of field. No text.",
  },
  {
    id: "g-9",
    aspect: "1:1",
    prompt:
      "Wes Anderson inspired family portrait, perfectly symmetrical dead-center composition, pastel butter-yellow and salmon palette, coordinated vintage wardrobe, dollhouse-styled interior with ornate wallpaper, flat even frontal lighting. No text.",
  },

  themeCover(
    "theme-golden-hour-beach",
    "Cinematic golden hour beach family portrait on soft sand, warm low sun rim-lit family of three in linen, long shadows, subtle film grain, ocean bokeh behind, medium format feel. No text.",
  ),
  themeCover(
    "theme-autumn-cabin",
    "Documentary family portrait on a cedar cabin porch on a crisp autumn morning, chunky knits, boots, steaming mugs, visible breath, amber rust foliage, overcast daylight, 35mm film. No text.",
  ),
  themeCover(
    "theme-kinfolk-kitchen",
    "Candid Kinfolk-style family kitchen portrait on Sunday morning, soft window light, pale wood, ceramic bowls, flour dust, gentle activity, airy documentary warmth. No text.",
  ),
  themeCover(
    "theme-vintage-polaroid",
    "Vintage late-70s Polaroid-style family snapshot, faded warm colors, soft focus, paper border, gentle flash, period correct. No text.",
  ),
  themeCover(
    "theme-leibovitz",
    "Annie Leibovitz editorial family studio portrait, dramatic single-source Rembrandt side-light, painted Old-Master umber and teal backdrop, tailored wardrobe, theatrical stillness, one unscripted human moment. No text.",
  ),
  themeCover(
    "theme-wes-anderson",
    "Wes Anderson inspired family portrait, perfectly symmetrical composition, pastel butter-yellow salmon mint palette, coordinated vintage wardrobe, dollhouse interior, ornate wallpaper, flat frontal lighting. No text.",
  ),
  themeCover(
    "theme-natgeo",
    "National Geographic family expedition portrait on a windswept alpine ridge at dawn, earth-tone technical outerwear, mist, low sun, expansive landscape, documentary realism, 35mm. No text.",
  ),
  themeCover(
    "theme-film-noir",
    "Film noir family portrait, high-contrast black and white, venetian-blind shadows across scene, 1940s wardrobe — trenchcoats, fedoras, silk — moody single-source lighting, silver-gelatin grain. No text.",
  ),
  themeCover(
    "theme-christmas-morning",
    "Tender Christmas morning family portrait in a living room with a decorated tree, matching flannel pajamas, warm lamplight, string-light bokeh, mugs of cocoa, dog in frame, candid soft. No text.",
  ),
  themeCover(
    "theme-pixar",
    "Pixar style 3D animated family portrait, soft stylized faces, expressive eyes, subsurface-scattered skin, warm volumetric cinematic lighting, wholesome mood. No text.",
  ),
  themeCover(
    "theme-manga",
    "Studio Ghibli style anime family illustration, soft hand-drawn linework, painterly cel shading, gentle summer palette, quiet outdoor scene. No text.",
  ),
  themeCover(
    "theme-superhero",
    "Cinematic superhero family portrait on a city rooftop at golden hour, coordinated distinct hero costumes, billowing capes, confident heroic poses, sweeping skyline, dramatic lens flare. The family's small dog wears a matching tiny cape. No text.",
  ),
  themeCover(
    "theme-cartoon",
    "1990s Saturday morning cartoon family portrait, bold ink outlines, bright primary palette, flat cel shading, cheerful expressive faces, kitchen-table setting with cereal. No text.",
  ),
  themeCover(
    "theme-card-christmas",
    "Christmas card style family portrait in front of a wreath-lit front door, snow on the step, warm interior glow, elegant composition with generous negative space on the left, classic forest-green cranberry cream palette. No text.",
  ),
  themeCover(
    "theme-card-easter",
    "Springtime Easter family card portrait in a garden of tulips and dogwood blossom, soft pastel palette, linen and cotton pastel wardrobe, low morning light, generous space for text. No text.",
  ),
  themeCover(
    "theme-card-birthday",
    "Warm birthday invitation family portrait around a lit cake on a wooden table, paper streamers, candlelight on everyone's faces, joyful candid expressions, negative space for text. No text.",
  ),

  // ── Photoreal expansion ────────────────────────────────────────
  themeCover(
    "theme-tuscan-summer",
    "Warm golden hour family portrait on a Tuscan villa terrace overlooking cypress hills and olive groves, aged limestone walls, terracotta tiles, linen wardrobe, soft Mediterranean side-light, medium format film grain. No text.",
  ),
  themeCover(
    "theme-cherry-blossom",
    "Tender family portrait beneath blooming sakura cherry blossom trees in a traditional Japanese garden in early spring, soft pink petals drifting, cotton and muted-neutral wardrobe, tranquil morning light, 35mm film. No text.",
    { aspect: "2:3" },
  ),
  themeCover(
    "theme-snowy-hygge",
    "Warm Nordic family portrait at the doorway of a snow-dusted timber cabin during evening snowfall, chunky wool cable knits, candle lanterns casting amber glow, visible breath in cold air, cozy hygge palette. No text.",
  ),
  themeCover(
    "theme-desert-santa-fe",
    "Family portrait against adobe walls under a wide Southwest sky in Santa Fe at golden hour, warm terracotta tones, a turquoise detail, linen and chambray wardrobe, dramatic long shadows, cottonwood silhouettes. No text.",
    { aspect: "3:2" },
  ),
  themeCover(
    "theme-parisian-cafe",
    "Editorial family portrait at a sidewalk café on a narrow cobblestone Paris street in the early morning, rattan chairs, small marble table with espresso and croissants, soft overcast Paris light, muted neutrals, 50mm lens feel. No text.",
  ),
  themeCover(
    "theme-lake-house",
    "Warm summer-evening family portrait on a long weathered wooden dock stretching over a still lake, reflected pines, golden-hour horizon, linen wardrobe, bare feet, golden retriever at the edge, medium-format film warmth. No text.",
    { aspect: "3:2" },
  ),

  // ── Stylized expansion ─────────────────────────────────────────
  themeCover(
    "theme-ghibli-countryside",
    "Studio Ghibli style hand-drawn illustration of a family in a rolling green countryside meadow under a wide watercolor sky, wind through tall grass, softly-painted cumulus clouds, Hayao Miyazaki aesthetic, cel shading. No text.",
    { aspect: "16:9" },
  ),
  themeCover(
    "theme-renaissance-oil",
    "Renaissance Dutch-masters oil painting of a family, chiaroscuro candlelight on faces, deep umber and teal background, rich wool and velvet period wardrobe, theatrical stillness, textured canvas brushwork, Vermeer-inflected warmth. No text.",
  ),
  themeCover(
    "theme-yellow-cartoon",
    "Classic American yellow-skinned cartoon family portrait in the spirit of 90s Springfield prime-time animation, bold black ink outlines, flat bright primary colors, exaggerated simplified features, four-finger hands, family seated on a living-room couch. No text.",
    { aspect: "16:9" },
  ),
  themeCover(
    "theme-lego-family",
    "Family portrait rendered as plastic toy-brick minifigures, glossy ABS plastic, cylindrical hair pieces, C-shaped hands, simplified printed faces with tiny smiles, standing on a plastic brick base, warm cinematic studio lighting, detailed brick textures. No text.",
    { aspect: "1:1" },
  ),
  themeCover(
    "theme-watercolor-storybook",
    "Soft watercolor children's-storybook illustration of a family in a whimsical garden with lanterns and wildflowers, gentle paper-grain texture, delicate inked outlines, Beatrix Potter meets Oliver Jeffers sensibility, warm nostalgic palette. No text.",
  ),

  // ── Cards / Occasions expansion ────────────────────────────────
  themeCover(
    "theme-card-halloween",
    "Warm Halloween-card family portrait on a wood porch lit by carved jack-o'-lanterns, wisps of ground fog, coordinated not-scary costumes (a little witch, a small vampire, a gentle ghost, a dog dressed as a pumpkin), rich orange and deep purple palette, playful cinematic. No text.",
  ),
  themeCover(
    "theme-card-thanksgiving",
    "Thanksgiving-card family portrait gathered around a harvest table, warm amber candlelight, pumpkins and autumn florals as centerpiece, a roast turkey, hands lightly holding, soft overcast backlight through a window, cozy plaid and linen wardrobe. No text.",
  ),
  themeCover(
    "theme-card-new-years",
    "Glamorous New Year's-card family portrait, black-tie and cocktail-dress wardrobe, coupes of champagne, gold confetti mid-air, softly-lit chandelier behind, warm cinematic bokeh. No text.",
  ),
  themeCover(
    "theme-card-graduation",
    "Warm graduation-card portrait of a family around a graduate in cap and gown, golden afternoon backlight, ivy-covered brick wall, genuine pride and quiet emotion. No text.",
  ),
  themeCover(
    "theme-card-newborn",
    "Tender newborn-announcement family portrait in a sunlit bedroom, soft white bedding, a swaddled sleeping newborn held at center, parents and siblings gathered around, quiet natural window light, muted pastel palette. No text.",
  ),
];

function themeCover(id, prompt, overrides = {}) {
  return { id, aspect: "4:5", prompt, ...overrides };
}

async function urlFromOutput(output) {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length) return urlFromOutput(output[0]);
  if (output && typeof output === "object") {
    if (typeof output.url === "function") {
      const u = await output.url();
      return typeof u === "string" ? u : u.toString();
    }
    if (typeof output.url === "string") return output.url;
  }
  throw new Error(`Unexpected output shape: ${JSON.stringify(output).slice(0, 200)}`);
}

async function runJob(job) {
  const outPath = path.join(OUT, `${job.id}.jpg`);
  if (!FORCE) {
    try {
      await fs.access(outPath);
      return { job, skipped: true };
    } catch {
      /* fall through */
    }
  }

  const output = await replicate.run(MODEL, {
    input: {
      prompt: job.prompt,
      aspect_ratio: job.aspect,
      resolution: job.resolution ?? "2K",
      output_format: "jpg",
      safety_filter_level: "block_only_high",
    },
  });

  const url = await urlFromOutput(output);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).jpeg({ quality: 90, mozjpeg: true }).toFile(outPath);
  return { job, skipped: false };
}

function runInBatches(items, size, worker) {
  let i = 0;
  const results = [];
  return new Promise(async (resolve) => {
    async function runOne() {
      const idx = i++;
      if (idx >= items.length) return;
      const started = Date.now();
      try {
        const r = await worker(items[idx]);
        const secs = ((Date.now() - started) / 1000).toFixed(1);
        results[idx] = { ok: true, result: r };
        console.log(
          `  [${idx + 1}/${items.length}] ${r.skipped ? "skip " : "done "}${secs.padStart(6)}s  ${items[idx].id}`,
        );
      } catch (err) {
        results[idx] = { ok: false, error: err };
        console.error(
          `  [${idx + 1}/${items.length}] FAIL ${items[idx].id}: ${err instanceof Error ? err.message : err}`,
        );
      }
      await runOne();
    }
    await Promise.all(Array.from({ length: size }, runOne));
    resolve(results);
  });
}

console.log(`⋯ generating ${jobs.length} landing samples via ${MODEL}`);
console.log(`  (1× 4K hero, ${jobs.length - 1}× 2K, ${FORCE ? "forcing regen" : "resumable"})`);
const startedAt = Date.now();
const results = await runInBatches(jobs, 6, runJob);
const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

const skipped = results.filter((r) => r.ok && r.result.skipped).length;
const generated = results.filter((r) => r.ok && !r.result.skipped).length;
const failed = results.filter((r) => !r.ok).length;

console.log(`\n✓ ${generated} generated · ${skipped} skipped · ${failed} failed in ${elapsed}s`);
if (failed) process.exit(1);
