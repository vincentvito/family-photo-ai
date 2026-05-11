"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CARD_ART_STYLES, type CardArtStyleId, getCardArtStyle } from "@/lib/card-art-styles";

export default function CardArtStylePicker({
  slotStyleIds,
  canUseProStyles,
  onSlotStyleChange,
}: {
  slotStyleIds: CardArtStyleId[];
  canUseProStyles: boolean;
  onSlotStyleChange: (slotIndex: number, styleId: CardArtStyleId) => void;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--color-ink-faint)]">
            Output styles
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
            Choose the style for each card slot. Every generated option can have its own look.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {slotStyleIds.map((slotStyleId, index) => {
          const resolvedStyle = getCardArtStyle(slotStyleId);
          return (
            <div
              key={index}
              className="rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="small-caps text-[color:var(--color-ink-muted)]">
                  Slot {index + 1}
                </span>
                {resolvedStyle.proOnly && (
                  <span className="rounded-full bg-[color:var(--color-ink)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    Pro
                  </span>
                )}
              </div>

              <div className="mt-2 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-tinted-butter)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedStyle.previewImage}
                  alt={`${resolvedStyle.name} slot preview`}
                  className="aspect-square w-full object-cover"
                />
              </div>

              <StyleSelect
                value={slotStyleId}
                canUseProStyles={canUseProStyles}
                label={`Art style for output slot ${index + 1}`}
                onChange={(styleId) => onSlotStyleChange(index, styleId)}
              />

              <p className="mt-2 min-h-8 text-xs leading-snug text-[color:var(--color-ink-muted)]">
                {resolvedStyle.blurb}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StyleSelect({
  value,
  canUseProStyles,
  label,
  onChange,
}: {
  value: CardArtStyleId;
  canUseProStyles: boolean;
  label: string;
  onChange: (styleId: CardArtStyleId) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const selectedStyle = getCardArtStyle(value);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative mt-2">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-2.5 py-2 text-left text-xs font-semibold text-[color:var(--color-ink)] outline-none transition hover:border-[color:var(--color-ink)] focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)]"
      >
        <span className="min-w-0">
          <span className="block truncate">{selectedStyle.name}</span>
          {selectedStyle.proOnly && (
            <span className="mt-0.5 inline-block rounded-full bg-[color:var(--color-ink)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
              Pro
            </span>
          )}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] p-1.5 shadow-[var(--shadow-md)]"
        >
          {CARD_ART_STYLES.map((style) => {
            const selected = style.id === value;
            const locked = style.proOnly && !canUseProStyles;
            return (
              <button
                key={style.id}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  onChange(style.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-xs transition ${
                  selected
                    ? "bg-[color:var(--color-bg-tinted-coral)] text-[color:var(--color-coral-deep)]"
                    : "text-[color:var(--color-ink)] hover:bg-[color:var(--color-bg-tinted-butter)]"
                } ${locked ? "cursor-not-allowed opacity-45 hover:bg-transparent" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{style.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-[color:var(--color-ink-muted)]">
                    {locked ? "Pro style" : style.shortName}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {style.proOnly && (
                    <span className="rounded-full border border-[color:var(--color-line)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]">
                      Pro
                    </span>
                  )}
                  {selected && (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
