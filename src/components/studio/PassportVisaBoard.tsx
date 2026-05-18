"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SubjectPicker from "./SubjectPicker";
import type { RosterMember } from "./ThemeBoard";
import {
  PASSPORT_VISA_THEME_ID,
  type PassportVisaSpec,
  type PassportVisaSpecId,
} from "@/lib/passport-visa-specs";
import {
  GENERATION_MODEL_IDS,
  MODEL_CATALOG,
  type GenerationModelId,
} from "@/lib/replicate/models";

type SpecGroup = {
  countryName: string;
  specs: PassportVisaSpec[];
};

const CreditPurchaseDialog = dynamic(() => import("@/components/billing/CreditPurchaseDialog"), {
  ssr: false,
});

export default function PassportVisaBoard({
  specs,
  roster,
  isAdmin,
  defaultModel,
  creditBalance,
  canStartFreePreview,
}: {
  specs: PassportVisaSpec[];
  roster: RosterMember[];
  isAdmin: boolean;
  defaultModel: GenerationModelId;
  creditBalance: number;
  canStartFreePreview: boolean;
}) {
  const router = useRouter();
  const [specId, setSpecId] = useState<PassportVisaSpecId>(specs[0].id as PassportVisaSpecId);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(() => {
    const firstHumanWithRef = roster.find((member) => member.role !== "pet" && member.hasReference);
    return firstHumanWithRef ? new Set([firstHumanWithRef.id]) : new Set();
  });
  const [note, setNote] = useState("");
  const [modelId, setModelId] = useState<GenerationModelId>(defaultModel);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [creditDialogOpen, setCreditDialogOpen] = useState(
    () => creditBalance <= 0 && !canStartFreePreview,
  );

  const groupedSpecs = useMemo<SpecGroup[]>(() => {
    const byCountry = specs.reduce<Record<string, PassportVisaSpec[]>>((groups, spec) => {
      groups[spec.countryName] = [...(groups[spec.countryName] ?? []), spec];
      return groups;
    }, {});
    return Object.entries(byCountry).map(([countryName, countrySpecs]) => ({
      countryName,
      specs: countrySpecs,
    }));
  }, [specs]);

  const selectedSpec = specs.find((spec) => spec.id === specId) ?? specs[0];
  const selectedSubjects = roster.filter((member) => selectedSubjectIds.has(member.id));
  const selectedHumanWithReference = selectedSubjects.filter(
    (member) => member.role !== "pet" && member.hasReference,
  );
  const canCreateShoot = creditBalance > 0 || canStartFreePreview;

  const toggleSubject = (id: string) => {
    const member = roster.find((item) => item.id === id);
    setError(null);
    if (!member) return;
    if (member.role === "pet") {
      setError("Passport and visa presets are for one person at a time, not pets.");
      return;
    }
    setSelectedSubjectIds((prev) => (prev.has(id) ? new Set() : new Set([id])));
  };

  const selectFirstSubject = () => {
    setError(null);
    const firstHumanWithRef = roster.find((member) => member.role !== "pet" && member.hasReference);
    setSelectedSubjectIds(firstHumanWithRef ? new Set([firstHumanWithRef.id]) : new Set());
  };

  const launch = () => {
    setError(null);
    if (!canCreateShoot) {
      setCreditDialogOpen(true);
      return;
    }
    if (selectedHumanWithReference.length !== 1) {
      setError("Select exactly one adult or child with a reference photo.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            themeId: PASSPORT_VISA_THEME_ID,
            outputType: "photoshoot",
            passportVisa: { specId: selectedSpec.id },
            wardrobeNote: note.trim() || null,
            aspectOverride: selectedSpec.nearestAspectRatio,
            subjectIds: [selectedHumanWithReference[0].id],
            modelId: isAdmin ? modelId : undefined,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        if (data?.debugPromptsOnly) {
          console.log("PROMPT_DEBUG_ONLY prompts", data.prompts);
          throw new Error("Prompt debug mode is on. Prompts were logged; no credits spent.");
        }
        router.push(`/studio/generate/${data.generationId}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Couldn't start passport/visa photos.";
        if (/credit|pack|preview/i.test(message)) setCreditDialogOpen(true);
        else setError(message);
      }
    });
  };

  return (
    <>
      {!canCreateShoot && (
        <section className="mt-8 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-5 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="chip chip-coral !bg-white/70">
              <span className="dot dot-coral" />
              Credits needed
            </span>
            <p className="mt-3 text-sm text-[color:var(--color-ink-muted)]">
              Add a photo pack before creating passport or visa photo variants.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreditDialogOpen(true)}
            className="btn btn-coral btn-sm"
          >
            View packs
          </button>
        </section>
      )}

      {isAdmin && (
        <section className="mt-8 rounded-[var(--radius-xl)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
          <span className="chip chip-coral">
            <span className="dot dot-coral" />
            Admin · model
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {GENERATION_MODEL_IDS.map((id) => {
              const model = MODEL_CATALOG[id];
              const active = modelId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setModelId(id)}
                  className={`spring-press rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] shadow-[var(--shadow-sm)]"
                      : "border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                  }`}
                >
                  {model.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
          <span className="chip chip-sage">
            <span className="dot dot-sage" />1 · Select country and document
          </span>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="small-caps text-[color:var(--color-ink-muted)]">Country</span>
              <select
                value={selectedSpec.countryName}
                onChange={(event) => {
                  const group = groupedSpecs.find(
                    (item) => item.countryName === event.target.value,
                  );
                  if (group?.specs[0]) setSpecId(group.specs[0].id as PassportVisaSpecId);
                }}
                className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-2.5 outline-none transition-all focus:border-[color:var(--color-sage)] focus:shadow-[var(--shadow-ring-sage)]"
              >
                {groupedSpecs.map((group) => (
                  <option key={group.countryName} value={group.countryName}>
                    {group.countryName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="small-caps text-[color:var(--color-ink-muted)]">Document</span>
              <select
                value={selectedSpec.id}
                onChange={(event) => setSpecId(event.target.value as PassportVisaSpecId)}
                className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-2.5 outline-none transition-all focus:border-[color:var(--color-sage)] focus:shadow-[var(--shadow-ring-sage)]"
              >
                {groupedSpecs
                  .find((group) => group.countryName === selectedSpec.countryName)
                  ?.specs.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.documentLabel} · {spec.sizeLabel}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="mt-5 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-faint)]">
                  Selected preset
                </p>
                <h2 className="serif mt-1 text-3xl tracking-[-0.02em]">
                  {selectedSpec.countryName} {selectedSpec.documentLabel}
                </h2>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-butter)] px-4 py-3 text-right">
                <p className="text-xs text-[color:var(--color-ink-muted)]">Size</p>
                <p className="text-lg font-semibold">{selectedSpec.sizeLabel}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Output</dt>
                <dd className="text-[color:var(--color-ink-muted)]">{selectedSpec.outputPixels}</dd>
              </div>
              <div>
                <dt className="font-semibold">Shape sent to model</dt>
                <dd className="text-[color:var(--color-ink-muted)]">
                  {selectedSpec.nearestAspectRatio} nearest supported aspect
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold">Printable sheet</dt>
                <dd className="text-[color:var(--color-ink-muted)]">
                  {selectedSpec.printableSheet}
                </dd>
              </div>
            </dl>
            <ul className="mt-4 grid gap-2 text-sm text-[color:var(--color-ink-muted)]">
              {selectedSpec.notes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--color-sage)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)] sm:p-7">
          <span className="chip chip-butter">
            <span className="dot dot-butter" />2 · Pick one family member
          </span>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
            Official-style photos work best one person at a time. Run this flow again for each adult
            or child in the family.
          </p>

          {roster.length === 0 ? (
            <div className="mt-5 rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-line-strong)] p-5 text-sm text-[color:var(--color-ink-muted)]">
              Add a person and reference photo before generating passport or visa photos.
              <Link href="/studio/roster" className="btn btn-sage btn-sm mt-4">
                Add family member
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <SubjectPicker
                roster={roster}
                selectedIds={selectedSubjectIds}
                onToggle={toggleSubject}
                onSelectAll={selectFirstSubject}
                onClear={() => setSelectedSubjectIds(new Set())}
                maxSubjects={1}
                consistencyWarningThreshold={1}
              />
            </div>
          )}

          <label className="mt-6 block">
            <span className="small-caps text-[color:var(--color-ink-muted)]">Optional note</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={180}
              rows={3}
              placeholder="e.g. keep current shirt color, tidy hair, no jewelry glare"
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[color:var(--color-sage)] focus:shadow-[var(--shadow-ring-sage)]"
            />
          </label>

          <div className="mt-5 rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-butter)] p-4 text-xs leading-relaxed text-[color:var(--color-ink-muted)]">
            Presets are practical size guides, not a legal guarantee. Always verify the latest
            government or embassy requirements before submitting.
          </div>

          {error && (
            <p className="mt-4 rounded-[var(--radius-sm)] bg-[color:var(--color-coral-soft)] px-3 py-2 text-sm text-[color:var(--color-coral-deep)]">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={launch}
            disabled={pending || roster.length === 0}
            className="btn btn-coral mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Generating…" : "Generate 4 document photo options"}
          </button>
        </div>
      </section>

      <CreditPurchaseDialog open={creditDialogOpen} onClose={() => setCreditDialogOpen(false)} />
    </>
  );
}
