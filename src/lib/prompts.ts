import type { Theme } from "./themes";
import type { Subject } from "./providers/types";

const FAMILY_POSITIVE_DIRECTIVE =
  "Keepsake mood: warm, respectful, optimistic, clean and safe-feeling";

/**
 * Compose the stable part of the prompt. Per-output variation prompts own the
 * exact pose, crop and sub-location so those details do not fight the theme.
 */
export function buildGenerationPrompt(
  theme: Theme,
  subjects: Subject[],
  wardrobeNote?: string | null,
  cardText?: string | null,
): string {
  const { spec } = theme;
  const familyClause = describeFamily(subjects);
  const rosterDirective = buildRosterDirective(subjects);

  const sentences: string[] = [
    // Part 1
    sentence(spec.assetType),
    // Part 2 - selected cast. The per-output variation supplies the physical staging.
    sentence(`${familyClause} in the ${theme.name} theme`),
    // Part 3 - broad setting/mood anchor. Avoid locking a pose or sub-location that can fight variants.
    sentence(`Theme atmosphere: ${selectedCastLanguage(theme.blurb.trim())}`),
    // Part 4
    sentence(selectedCastLanguage(spec.camera)),
    // Part 5
    sentence(selectedCastLanguage(spec.lighting)),
    // Part 6
    sentence(selectedCastLanguage(spec.style)),
    rosterDirective,
    sentence(FAMILY_POSITIVE_DIRECTIVE),
  ];

  if (wardrobeNote && wardrobeNote.trim()) {
    sentences.push(
      sentence(`Wardrobe and mood note: ${selectedCastLanguage(wardrobeNote.trim())}`),
    );
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
 * Produce a natural phrase describing the selected cast without implying a
 * larger family than the uploaded references contain.
 */
export function describeFamily(subjects: Subject[]): string {
  if (subjects.length === 0) return "The selected cast photographed together";

  if (subjects.length === 1) {
    const subject = subjects[0];
    return subject.role === "pet" ? `The selected ${petLabel(subject)}` : "The selected person";
  }

  const adults = subjects.filter((s) => s.role === "adult");
  const kids = subjects.filter((s) => s.role === "child");
  const pets = subjects.filter((s) => s.role === "pet");

  const parts: string[] = [];
  if (adults.length) parts.push(countPhrase(adults.length, "adult"));
  if (kids.length) parts.push(countPhrase(kids.length, "child", "children"));
  if (pets.length) parts.push(describePets(pets));

  const composition = joinWithAnd(parts);
  return `Selected cast: ${composition}, shown as the complete group`;
}

function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}

function selectedCastLanguage(text: string): string {
  return text
    .replace(/\bfamily\b/giu, "selected cast")
    .replace(/\beveryone\b/giu, "the selected cast");
}

function buildRosterDirective(subjects: Subject[]): string {
  const adults = subjects.filter((subject) => subject.role === "adult");
  const kids = subjects.filter((subject) => subject.role === "child");
  const pets = subjects.filter((subject) => subject.role === "pet");
  const castRule = buildCastRule({ adults, kids, pets });
  const identityRule = describeRosterIdentities(subjects);
  const backgroundRule =
    pets.length === 0
      ? "Keep the background free of extra people, duplicate faces, posters and reflections."
      : "Keep the background free of extra people, duplicate faces, posters, reflections and unselected animals.";

  return [
    `Cast rule: show only the selected cast: ${castRule}.`,
    `Total living subjects in the image must be exactly ${subjects.length}.`,
    identityRule,
    pets.length > 0
      ? "Selected pet references are required cast members and must appear as animals, not as extra adults, children, dolls, statues, mascots or human subjects."
      : "",
    pets.length > 0
      ? "When shot directions describe human poses, gestures, hands, feet, clothing or regalia, apply those details only to adult and child subjects; place selected pets naturally beside the people, held safely by a person, seated on a cushion, at their feet, or on nearby furniture as the scene allows."
      : "",
    subjects.length === 1
      ? "If the theme wording implies a group, reinterpret it as one selected subject only."
      : "If the theme wording implies a larger group, reinterpret it as this exact selected cast.",
    backgroundRule,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildCastRule({
  adults,
  kids,
  pets,
}: {
  adults: Subject[];
  kids: Subject[];
  pets: Subject[];
}): string {
  const parts: string[] = [];
  if (adults.length) parts.push(countSubjects(adults, "adult", "adults"));
  if (kids.length) parts.push(countSubjects(kids, "child", "children"));
  if (pets.length) {
    parts.push(describePets(pets));
  }
  return parts.join("; ");
}

function countSubjects(subjects: Subject[], singular: string, plural: string): string {
  return `${subjects.length} ${subjects.length === 1 ? singular : plural}`;
}

function countPhrase(n: number, singular: string, plural?: string): string {
  const words = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
  const word = n <= 8 ? words[n - 1] : String(n);
  const form = n === 1 ? singular : (plural ?? `${singular}s`);
  return `${word} ${form}`;
}

function describePets(pets: Subject[]): string {
  const labels = pets.map(petLabel);
  const grouped = labels.reduce<Record<string, number>>((counts, label) => {
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  }, {});

  return joinWithAnd(
    Object.entries(grouped).map(([label, count]) => countPhrase(count, label)),
  );
}

function describeRosterIdentities(subjects: Subject[]): string {
  if (subjects.length === 0) return "Reference identity map: none.";

  let referenceIndex = 1;
  const roleCounts: Record<Subject["role"], number> = {
    adult: 0,
    child: 0,
    pet: 0,
  };

  const identities = subjects.map((subject) => {
    roleCounts[subject.role] += 1;
    const stableLabel =
      subject.role === "pet"
        ? `${petLabel(subject)} ${roleCounts.pet}`
        : `${subject.role} ${roleCounts[subject.role]}`;
    const references = subject.referencePaths.length;
    const firstReferenceIndex = referenceIndex;
    const referenceLabel =
      references > 0
        ? references === 1
          ? `reference image ${firstReferenceIndex}`
          : `reference images ${firstReferenceIndex}-${firstReferenceIndex + references - 1}`
        : "no reference image";

    referenceIndex += references;

    return `${referenceLabel} is ${stableLabel}`;
  });

  return [
    `Reference identity map: ${joinWithAnd(identities)}.`,
    "Treat each mapped reference as one distinct selected subject; do not render names or file names, and do not merge, duplicate or replace subjects.",
  ].join(" ");
}

function petLabel(subject: Subject): string {
  const source = subject.name.toLowerCase();
  if (/\b(cat|kitten|kitty|feline)\b/u.test(source)) return "cat";
  if (/\b(dog|puppy|pup|canine)\b/u.test(source)) return "dog";
  return "pet";
}

function joinWithAnd(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
