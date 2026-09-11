import type { Theme } from "@/lib/themes";
import { getPromptStudioHref, getThemeStudioHref, normalizeStudioPrompt } from "@/lib/theme-links";

export type StudioSearchParams = Record<string, string | string[] | undefined>;
export type StudioIntent =
  | { kind: "theme"; output: "photoshoot" | "card"; themeId: string }
  | { kind: "prompt"; output: "photoshoot"; prompt: string };
type StudioStep = "/studio/theme" | "/studio/roster" | "/studio/output";

/** Server entry points supply the catalog; navigation may preserve a syntactically valid intent. */
export function parseStudioIntent(
  params: StudioSearchParams,
  catalog?: readonly Pick<Theme, "id" | "category">[],
): StudioIntent | null {
  const { output, theme, card, prompt } = params;
  if ([output, theme, card, prompt].some(Array.isArray)) return null;
  if (output !== undefined && output !== "photoshoot" && output !== "card") return null;
  if ([theme, card, prompt].filter((value) => value !== undefined).length !== 1) return null;

  if (prompt !== undefined) {
    const normalized = normalizeStudioPrompt(prompt);
    return normalized && output !== "card"
      ? { kind: "prompt", output: "photoshoot", prompt: normalized }
      : null;
  }

  const id = card ?? theme;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return null;
  const selected = catalog?.find((entry) => entry.id === id);
  if (catalog && !selected) return null;
  const isCard = selected ? selected.category === "card" : card !== undefined;
  if (card !== undefined && !isCard) return null;
  if (!isCard && output === "card") return null;
  return { kind: "theme", output: isCard ? "card" : "photoshoot", themeId: id };
}

export function getStudioIntentHref(intent: StudioIntent, step: StudioStep = "/studio/theme") {
  const themeHref =
    intent.kind === "prompt"
      ? getPromptStudioHref(intent.prompt)
      : getThemeStudioHref({
          id: intent.themeId,
          category: intent.output === "card" ? "card" : "photoreal",
        });
  return step + themeHref.slice("/studio/theme".length);
}

/** A selected look needs a real reference before it can reach the generation screen. */
export function getStudioIntentDestination(
  intent: StudioIntent,
  roster: readonly { photos: readonly unknown[] }[],
) {
  return getStudioIntentHref(
    intent,
    roster.some((entry) => entry.photos.length > 0) ? "/studio/theme" : "/studio/roster",
  );
}

export function getStudioNavigationHref(href: string, params: StudioSearchParams) {
  const intent = parseStudioIntent(params);
  if (!intent) return href;
  if (href === "/studio/roster" || href === "/studio/output" || href === "/studio/theme") {
    return getStudioIntentHref(intent, href);
  }
  if (href.startsWith("/sign-in?next=")) {
    return `/sign-in?next=${encodeURIComponent(getStudioIntentHref(intent))}`;
  }
  return href;
}

/** Preserve duplicates so the parser can reject ambiguous query strings. */
export function studioSearchParamsFromUrl(
  params: Pick<URLSearchParams, "getAll">,
): StudioSearchParams {
  return Object.fromEntries(
    ["output", "theme", "card", "prompt"].map((key) => {
      const values = params.getAll(key);
      return [key, values.length > 1 ? values : values[0]];
    }),
  );
}
