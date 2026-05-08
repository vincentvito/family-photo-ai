"use client";

import {
  CARD_ART_STYLES,
  type CardArtStyleId,
  type CardSlotStyleSelection,
  getCardArtStyle,
} from "@/lib/card-art-styles";

export default function CardArtStylePicker({
  defaultStyleId,
  slotStyleIds,
  canUseProStyles,
  onDefaultStyleChange,
  onSlotStyleChange,
}: {
  defaultStyleId: CardArtStyleId;
  slotStyleIds: CardSlotStyleSelection[];
  canUseProStyles: boolean;
  onDefaultStyleChange: (styleId: CardArtStyleId) => void;
  onSlotStyleChange: (slotIndex: number, styleId: CardSlotStyleSelection) => void;
}) {
  const defaultStyle = getCardArtStyle(defaultStyleId);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--color-ink-faint)]">
            Card art style
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
            Pick one default, then override any output slot that needs its own look.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CARD_ART_STYLES.map((style) => {
          const active = style.id === defaultStyleId;
          const locked = style.proOnly && !canUseProStyles;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                if (!locked) onDefaultStyleChange(style.id);
              }}
              disabled={locked}
              aria-pressed={active}
              className={`group overflow-hidden rounded-[var(--radius-md)] border bg-[color:var(--color-bg-elevated)] text-left shadow-[var(--shadow-sm)] outline-none transition-all focus-visible:ring-2 focus-visible:ring-[color:var(--color-coral-deep)] ${
                active
                  ? "border-[color:var(--color-coral-deep)] ring-2 ring-[color:rgba(242,107,74,0.28)]"
                  : "border-[color:var(--color-line)] hover:border-[color:var(--color-ink)]"
              } ${locked ? "cursor-not-allowed opacity-55 hover:border-[color:var(--color-line)]" : ""}`}
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-[color:var(--color-bg-tinted-butter)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={style.previewImage}
                  alt={`${style.name} preview`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-white shadow-[var(--shadow-sm)] transition-opacity ${
                    active
                      ? "border-[color:var(--color-coral-deep)] bg-[color:var(--color-coral-deep)]"
                      : "border-white/70 bg-[color:rgba(31,26,36,0.34)] opacity-0 group-hover:opacity-100"
                  }`}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {style.proOnly && (
                  <span className="absolute left-2 top-2 rounded-full bg-[color:var(--color-ink)]/82 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-[var(--shadow-sm)]">
                    Pro
                  </span>
                )}
              </span>
              <span className="block p-3">
                <span className="block truncate text-sm font-semibold text-[color:var(--color-ink)]">
                  {style.name}
                </span>
                <span className="mt-1 block max-h-8 overflow-hidden text-xs leading-snug text-[color:var(--color-ink-muted)]">
                  {locked ? "Subscribe to Pro to use this preset." : style.blurb}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {slotStyleIds.map((slotStyleId, index) => {
          const resolvedStyle =
            slotStyleId === "default" ? defaultStyle : getCardArtStyle(slotStyleId);
          return (
            <div
              key={index}
              className="rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="small-caps text-[color:var(--color-ink-muted)]">
                  Slot {index + 1}
                </span>
              </div>
              <div className="mt-2 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-tinted-butter)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedStyle.previewImage}
                  alt={`${resolvedStyle.name} slot preview`}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <select
                value={slotStyleId}
                onChange={(event) =>
                  onSlotStyleChange(index, event.target.value as CardSlotStyleSelection)
                }
                className="mt-2 w-full rounded-[var(--radius-sm)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-2.5 py-2 text-xs font-semibold text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)]"
                aria-label={`Art style for output slot ${index + 1}`}
              >
                <option value="default">Default: {defaultStyle.name}</option>
                {CARD_ART_STYLES.map((style) => (
                  <option
                    key={style.id}
                    value={style.id}
                    disabled={style.proOnly && !canUseProStyles}
                  >
                    {style.name}
                    {style.proOnly ? " · Pro" : ""}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
