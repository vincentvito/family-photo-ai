"use client";

import type { RosterMember } from "./ThemeBoard";

export default function SubjectPicker({
  roster,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
}: {
  roster: RosterMember[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  if (roster.length === 0) return null;

  const selectedWithRef = roster.filter((m) => selectedIds.has(m.id) && m.hasReference).length;
  const invalid = selectedWithRef === 0;
  const allSelected = selectedIds.size === roster.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--color-ink-faint)]">
          Who&apos;s in this shoot
        </p>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={allSelected}
            className="font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)] disabled:opacity-40"
          >
            All
          </button>
          <span className="text-[color:var(--color-line-strong)]">·</span>
          <button
            type="button"
            onClick={onClear}
            disabled={selectedIds.size === 0}
            className="font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)] disabled:opacity-40"
          >
            None
          </button>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap justify-center gap-3">
        {roster.map((member) => {
          const selected = selectedIds.has(member.id);
          const initials = member.name
            .split(/\s+/)
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => onToggle(member.id)}
                aria-pressed={selected}
                className={`group flex w-[68px] flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-1 outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--color-coral-deep)]`}
              >
                <span
                  className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-tinted-butter)] text-sm font-semibold text-[color:var(--color-ink-muted)] ring-2 transition ${
                    selected
                      ? "ring-[color:var(--color-coral-deep)]"
                      : "opacity-50 ring-transparent group-hover:opacity-80"
                  }`}
                >
                  {member.photoId ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`/api/images/${member.photoId}?thumb=240`}
                      alt={member.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span aria-hidden>{initials || "?"}</span>
                  )}
                  {!member.hasReference && (
                    <span
                      className="absolute inset-0 flex items-center justify-center bg-[color:rgba(31,26,36,0.55)] text-[10px] font-medium uppercase tracking-wide text-white"
                      title="No reference photo uploaded"
                    >
                      no ref
                    </span>
                  )}
                </span>
                <span
                  className={`max-w-full truncate text-xs ${
                    selected
                      ? "text-[color:var(--color-ink)]"
                      : "text-[color:var(--color-ink-muted)]"
                  }`}
                >
                  {member.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {invalid && (
        <p className="mt-3 rounded-[var(--radius-sm)] bg-[color:var(--color-coral-soft)] px-3 py-2 text-center text-xs text-[color:var(--color-coral-deep)]">
          Select at least one person or pet with a reference photo to start the shoot.
        </p>
      )}
    </div>
  );
}
