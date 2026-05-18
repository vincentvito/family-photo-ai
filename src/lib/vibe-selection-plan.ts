export const VIBE_VARIATION_SLOT_COUNT = 4;

export type VibePlanCatalogItem = {
  id: string;
  name: string;
};

export type VibePlanSlotSource = "selected" | "auto" | "repeat";

export type VibePlanSlot = {
  themeId: string;
  name: string;
  source: VibePlanSlotSource;
};

export function buildVibeSelectionPlan(
  selectedThemeIds: readonly string[],
  catalog: readonly VibePlanCatalogItem[],
  slotCount = VIBE_VARIATION_SLOT_COUNT,
): VibePlanSlot[] {
  if (slotCount <= 0) return [];

  const catalogById = new Map(catalog.map((item) => [item.id, item]));
  const dedupedSelected = selectedThemeIds
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .filter((id) => catalogById.has(id))
    .slice(0, slotCount);

  if (dedupedSelected.length === 0) return [];

  if (dedupedSelected.length === 1) {
    const selected = catalogById.get(dedupedSelected[0])!;
    return Array.from({ length: slotCount }, (_, index) => ({
      themeId: selected.id,
      name: selected.name,
      source: index === 0 ? "selected" : "repeat",
    }));
  }

  const plan: VibePlanSlot[] = dedupedSelected.map((id) => {
    const item = catalogById.get(id)!;
    return { themeId: item.id, name: item.name, source: "selected" };
  });
  const used = new Set(dedupedSelected);

  for (const item of catalog) {
    if (plan.length >= slotCount) break;
    if (used.has(item.id)) continue;
    plan.push({ themeId: item.id, name: item.name, source: "auto" });
    used.add(item.id);
  }

  return plan;
}
