import type { Theme } from "@/lib/themes";

export const MAX_STUDIO_PROMPT_LENGTH = 800;

export function normalizeStudioPrompt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const prompt = value.trim();
  if (prompt.length < 4 || prompt.length > MAX_STUDIO_PROMPT_LENGTH) return null;
  // Keep ordinary multiline prompts, but reject control characters in shared links.
  if (
    [...prompt].some((char) => {
      const code = char.charCodeAt(0);
      return (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127;
    })
  )
    return null;
  return prompt;
}

export function getThemeStudioHref(theme: Pick<Theme, "id" | "category">) {
  const parameter = theme.category === "card" ? "card" : "theme";
  const output = theme.category === "card" ? "card" : "photoshoot";
  return `/studio/theme?output=${output}&${parameter}=${encodeURIComponent(theme.id)}`;
}

export function getPromptStudioHref(value: string) {
  const prompt = normalizeStudioPrompt(value);
  if (!prompt)
    throw new RangeError(`Studio prompts must contain 4–${MAX_STUDIO_PROMPT_LENGTH} characters.`);
  return `/studio/theme?output=photoshoot&prompt=${encodeURIComponent(prompt)}`;
}
