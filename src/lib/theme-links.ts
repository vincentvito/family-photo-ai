import type { Theme } from "@/lib/themes";

export function getThemeStudioHref(theme: Pick<Theme, "id" | "category">) {
  const parameter = theme.category === "card" ? "card" : "theme";
  const output = theme.category === "card" ? "card" : "photoshoot";
  return `/studio/theme?output=${output}&${parameter}=${encodeURIComponent(theme.id)}`;
}
