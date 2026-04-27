/**
 * Prints the composed prompt for one theme in each category, plus a custom vibe.
 * Used to eyeball that every prompt follows the 7-part framework.
 *
 * Run: node scripts/inspect-prompts.mjs
 */
const { getTheme, buildCustomTheme, THEMES } = await import("../src/lib/themes.ts");
const { buildGenerationPrompt } = await import("../src/lib/prompts.ts");

const roster = [
  { personId: "p1", name: "Elena", role: "adult", notes: null, referencePaths: [] },
  { personId: "p2", name: "Matteo", role: "adult", notes: null, referencePaths: [] },
  { personId: "p3", name: "Luca", role: "child", notes: "4 years old, curly hair", referencePaths: [] },
  { personId: "p4", name: "Biscotto", role: "pet", notes: "golden retriever", referencePaths: [] },
];

const cases = [
  { label: "PHOTOREAL — golden-hour-beach", theme: getTheme("golden-hour-beach"), wardrobe: "linen in sandy tones, everyone barefoot", card: null },
  { label: "STYLIZED — pixar-family", theme: getTheme("pixar-family"), wardrobe: null, card: null },
  { label: "CARD — card-christmas", theme: getTheme("card-christmas"), wardrobe: null, card: "The Vitali Family · 2026" },
  { label: "CUSTOM VIBE", theme: buildCustomTheme({ description: "Everyone reading in a sunroom on a rainy afternoon, slate and wool, wet windows, quiet.", aspectRatio: "4:5" }), wardrobe: null, card: null },
];

for (const c of cases) {
  const prompt = buildGenerationPrompt(c.theme, roster, c.wardrobe, c.card);
  console.log("━".repeat(80));
  console.log(c.label);
  console.log("━".repeat(80));
  console.log(prompt);
  console.log("");
}

console.log(`(${THEMES.length} themes in catalog)`);
