import type { Theme } from "./themes";
import type { Subject } from "./providers/types";

const FAMILY_POSITIVE_DIRECTIVE =
  "Family-positive keepsake direction: keep the mood warm, respectful and optimistic. Do not include smoking, cigarettes, cigars, vaping, ashtrays, lighters in use, smoke clouds, weapons, or threatening menace";

/**
 * Compose a framework-ordered prompt for a family portrait:
 *   [Asset Type + Aspect] → [Subject + Action, with family roster woven in]
 *   → [Location] → [Camera] → [Lighting] → [Style] → [Wardrobe] → [Card text]
 * Each part becomes one sentence in flowing prose rather than a labeled list.
 */
export function buildGenerationPrompt(
  theme: Theme,
  subjects: Subject[],
  wardrobeNote?: string | null,
  cardText?: string | null,
): string {
  const { spec } = theme;
  const familyClause = describeFamily(subjects);
  const hasPets = subjects.some((subject) => subject.role === "pet");
  const rosterDirective = buildRosterDirective(subjects);

  const sentences: string[] = [
    // Part 1
    `${spec.assetType}.`,
    // Part 2 — subject + action, with the roster woven in, then setting (part 3)
    `${familyClause} ${spec.subjectAction}, set in ${spec.location}.`,
    // Part 4
    `${spec.camera}.`,
    // Part 5
    `${spec.lighting}.`,
    // Part 6
    `${spec.style}.`,
    rosterDirective,
    hasPets
      ? "Include only the selected pet subjects listed in the cast lock; do not invent additional animals or background pets."
      : "No pets or animals should appear anywhere in the image.",
    FAMILY_POSITIVE_DIRECTIVE + ".",
  ];

  if (wardrobeNote && wardrobeNote.trim()) {
    sentences.push(`Wardrobe and mood note from the family: ${wardrobeNote.trim()}.`);
  }

  if (cardText && cardText.trim()) {
    sentences.push(buildCardTextDirective(cardText.trim()));
  }

  return sentences.join(" ").replace(/—/g, "-");
}

/** Framework part 7 — explicit text directive, used for card themes. */
export function buildCardTextDirective(cardText: string): string {
  return [
    `Within the image's deliberate negative space,`,
    `render the exact text "${cardText}"`,
    `as a warm-cream (or deep-umber where it better contrasts the background) serif greeting,`,
    `thin-to-regular weight, tastefully sized and kerned,`,
    `with subtle edge contrast for legibility.`,
    `No watermarks, no other text anywhere in the image.`,
  ].join(" ");
}

/**
 * Produce a natural noun phrase describing the family, suitable to start a
 * sentence — e.g. "A family of two adults, one child and one pet (Elena,
 * Matteo, Luca, Biscotto) together". The phrase is designed to weave directly
 * into the spec's subjectAction ("gathered close…", "walking toward the
 * tide…") without awkward glue.
 */
export function describeFamily(subjects: Subject[]): string {
  if (subjects.length === 0) return "A family";

  if (subjects.length === 1) {
    const subject = subjects[0];
    const nameTag = subject.name ? ` (${subject.name})` : "";
    return subject.role === "pet" ? `The selected pet${nameTag}` : `The selected person${nameTag}`;
  }

  const adults = subjects.filter((s) => s.role === "adult");
  const kids = subjects.filter((s) => s.role === "child");
  const pets = subjects.filter((s) => s.role === "pet");

  const parts: string[] = [];
  if (adults.length) parts.push(countPhrase(adults.length, "adult"));
  if (kids.length) parts.push(countPhrase(kids.length, "child", "children"));
  if (pets.length) parts.push(countPhrase(pets.length, "pet"));

  const composition = joinWithAnd(parts);
  const names = subjects.map((s) => s.name).filter(Boolean);
  const nameTag = names.length > 0 ? ` (${names.join(", ")})` : "";

  return `A family of ${composition}${nameTag}`;
}

function buildRosterDirective(subjects: Subject[]): string {
  const humans = subjects.filter((subject) => subject.role !== "pet");
  const pets = subjects.filter((subject) => subject.role === "pet");
  const humanNames = listNames(humans);
  const petNames = listNames(pets);

  const humanRule =
    humans.length === 0
      ? "exactly zero visible humans"
      : `exactly ${humans.length} visible human subject${humans.length === 1 ? "" : "s"}${humanNames}`;
  const petRule =
    pets.length === 0
      ? "exactly zero visible pets or animals"
      : `exactly ${pets.length} visible pet subject${pets.length === 1 ? "" : "s"}${petNames}`;

  return [
    `Cast lock: ${humanRule}; ${petRule}.`,
    subjects.length === 1
      ? "This is a solo portrait; reinterpret any plural or group staging in the theme as one selected subject only."
      : "This is a closed group portrait containing only the selected cast.",
    "Do not add unselected spouses, children, relatives, friends, strangers, background people, extra faces, duplicate versions of the same subject, silhouettes, reflections, wall portraits or implied family members.",
    "If the theme text uses group words like family, everyone, each, all or together, adapt that phrasing to this exact selected cast.",
  ].join(" ");
}

function listNames(subjects: Subject[]): string {
  const names = subjects.map((subject) => subject.name).filter(Boolean);
  return names.length > 0 ? `: ${names.join(", ")}` : "";
}

function countPhrase(n: number, singular: string, plural?: string): string {
  const words = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
  const word = n <= 8 ? words[n - 1] : String(n);
  const form = n === 1 ? singular : (plural ?? `${singular}s`);
  return `${word} ${form}`;
}

function joinWithAnd(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
