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
  const count = subjects.length;
  const adults = subjects.filter((subject) => subject.role === "adult").length;
  const children = subjects.filter((subject) => subject.role === "child").length;
  const pets = subjects.filter((subject) => subject.role === "pet").length;
  const scene = spec.scene ?? `${theme.blurb.trim()} ${spec.lighting}`;
  const composition =
    spec.composition ??
    "theme-appropriate spatial arrangement; final crop, subject size, lens feel, and camera distance are controlled by the variant composition mode";
  const safety = spec.safety ?? "no logos, no text, no watermark";

  const sections: string[] = [
    sentence(spec.assetType),
    `Scene: ${sentence(selectedCastLanguage(scene))}`,
    `Style: ${sentence(selectedCastLanguage(spec.style))}`,
    `Camera and framing: ${sentence(selectedCastLanguage(spec.camera))}`,
    `Lighting: ${sentence(selectedCastLanguage(spec.lighting))}`,
    buildSubjectLine(count, adults, children, pets),
    `Composition anchor: ${sentence(selectedCastLanguage(composition))}`,
    getReferenceMap(subjects),
    buildRosterDirective(subjects),
    buildHardConstraints({ children, pets, category: theme.category }),
    `Safety: ${sentence(selectedCastLanguage(safety))}`,
    sentence(FAMILY_POSITIVE_DIRECTIVE),
  ];

  if (wardrobeNote && wardrobeNote.trim()) {
    sections.push(`Wardrobe and mood note: ${sentence(selectedCastLanguage(wardrobeNote.trim()))}`);
  }

  if (cardText && cardText.trim()) {
    sections.push(buildCardTextDirective(cardText.trim()));
  }

  sections.push(`Aspect ratio: ${theme.aspectRatio}.`);

  return sections.join("\n\n");
}

/** Framework part 7: explicit text directive, used for card themes. */
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
 * Produce a natural phrase describing the subjects without implying a
 * larger family than the uploaded references contain.
 */
export function describeFamily(subjects: Subject[]): string {
  if (subjects.length === 0) return "The subjects photographed together";

  if (subjects.length === 1) {
    const subject = subjects[0];
    return subject.role === "pet" ? `The ${petLabel(subject)}` : "The person";
  }

  const adults = subjects.filter((s) => s.role === "adult");
  const kids = subjects.filter((s) => s.role === "child");
  const pets = subjects.filter((s) => s.role === "pet");

  const parts: string[] = [];
  if (adults.length) parts.push(countPhrase(adults.length, "adult"));
  if (kids.length) parts.push(countPhrase(kids.length, "child", "children"));
  if (pets.length) parts.push(describePets(pets));

  const composition = joinWithAnd(parts);
  return `Subjects: ${composition}, shown as the complete group`;
}

function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}

function selectedCastLanguage(text: string): string {
  return text
    .replace(/\bselected cast\b/giu, "subjects")
    .replace(/\bfamily-friendly\b/giu, "group-friendly")
    .replace(/\bfamily\b/giu, "group")
    .replace(/\beveryone\b/giu, "the subjects");
}

function buildSubjectLine(count: number, adults: number, children: number, pets: number): string {
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} ${adults === 1 ? "adult" : "adults"}`);
  if (children > 0) parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  if (pets > 0) parts.push(`${pets} ${pets === 1 ? "pet" : "pets"}`);

  return `Subjects: exactly ${countPhrase(count, "subject")} only: ${joinWithAnd(parts)}.`;
}

function getReferenceMap(subjects: Subject[]): string {
  if (subjects.length === 0) return "Reference identity map: none.";

  const roleCounts: Record<Subject["role"], number> = {
    adult: 0,
    child: 0,
    pet: 0,
  };

  const mappedSubjects = subjects.map((subject, index) => {
    roleCounts[subject.role] += 1;
    const label =
      subject.role === "pet"
        ? `${petLabel(subject)} ${roleCounts.pet}`
        : `${subject.role} ${roleCounts[subject.role]}`;

    return `reference image ${index + 1} is ${label}`;
  });

  return [
    `Reference identity map: ${mappedSubjects.join(", ")}.`,
    "Each reference image represents one distinct subject. Preserve facial structure, age cues, skin tone, hair, and recognizable facial features only. Do not merge, duplicate, replace, or rename subjects.",
  ].join(" ");
}

function buildHardConstraints({
  children,
  pets,
  category,
}: {
  children: number;
  pets: number;
  category: Theme["category"];
}): string {
  const anatomyRule =
    category === "photoreal"
      ? "Maintain coherent realistic anatomy, facial structure, limb proportions, and clean subject separation."
      : "Maintain coherent theme-appropriate anatomy, facial structure, limb proportions, and clean subject separation.";
  const scaleRule =
    children > 0
      ? "Maintain realistic adult-child height differences."
      : "Maintain consistent head scale and body proportions.";

  return [
    "Hard constraints:",
    "No background people, posters with faces, reflections of people, duplicated subjects, logos, text, or watermark.",
    `${anatomyRule} ${scaleRule}`,
    pets > 0 ? "Selected pets must remain animals, not people, dolls, statues, or mascots." : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildRosterDirective(subjects: Subject[]): string {
  const pets = subjects.filter((subject) => subject.role === "pet");
  const backgroundRule =
    pets.length === 0
      ? "Keep the background free of extra people, duplicate faces, posters and reflections."
      : "Keep the background free of extra people, duplicate faces, posters, reflections and unselected animals.";

  return [
    pets.length > 0
      ? "Selected pet references are required cast members and must appear as animals, not as extra adults, children, dolls, statues, mascots or human subjects."
      : "",
    pets.length > 0
      ? "When shot directions describe human poses, gestures, hands, feet, clothing or regalia, apply those details only to adult and child subjects; place selected pets naturally beside the people, held safely by a person, seated on a cushion, at their feet, or on nearby furniture as the scene allows."
      : "",
    subjects.length === 1
      ? "If the theme wording implies a group, reinterpret it as one selected subject only."
      : "If the theme wording implies a larger group, reinterpret it as these exact subjects.",
    backgroundRule,
  ]
    .filter(Boolean)
    .join(" ");
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

  return joinWithAnd(Object.entries(grouped).map(([label, count]) => countPhrase(count, label)));
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
