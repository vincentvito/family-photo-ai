"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LUXURY_CARVED_NUMBER_BIRTHDAY_THEME_ID, getRequiredCardTextError } from "@/lib/themes";
import type { Theme } from "@/lib/themes";
import type { AspectRatio } from "@/lib/providers/types";
import { authClient } from "@/lib/auth-client";
import ThemeCard from "./ThemeCard";
import ThemeSection from "./ThemeSection";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SubjectPicker from "./SubjectPicker";
import CardArtStylePicker from "./CardArtStylePicker";
import {
  CARD_STYLE_SLOT_COUNT,
  DEFAULT_CARD_ART_STYLE_ID,
  type CardArtStyleId,
} from "@/lib/card-art-styles";
import {
  GENERATION_MODEL_IDS,
  MODEL_CATALOG,
  type GenerationModelId,
} from "@/lib/replicate/models";
import { uploadLocationReference } from "@/lib/upload-client";
import { MAX_SHOT_SUBJECTS } from "@/lib/generation-limits";
import { getThemeStudioHref } from "@/lib/theme-links";

type ShapeId = "portrait" | "square" | "wide";
type ShapePick = "auto" | ShapeId;
type OutputMode = "photoshoot" | "card";
type PendingShoot = { kind: "theme"; themes: Theme[] } | { kind: "custom" };
type AuthResume = { kind: "shoot"; shoot: PendingShoot } | { kind: "card"; theme: Theme };
const CUSTOM_AUTO_RATIO: AspectRatio = "2:3";
const ADD_CREDITS_MESSAGE =
  "Your free preview is one-time. Add credits before starting another one.";
const BUY_PACK_MESSAGE = "Buy a photo pack before starting a shoot.";
const CreditPurchaseDialog = dynamic(() => import("@/components/billing/CreditPurchaseDialog"), {
  ssr: false,
});

export type RosterMember = {
  id: string;
  name: string;
  role: "adult" | "child" | "pet";
  hasReference: boolean;
  photoId: string | null;
};

const shapeOptions: {
  id: ShapeId;
  label: string;
  ratio: AspectRatio;
}[] = [
  { id: "portrait", label: "Portrait", ratio: "2:3" },
  { id: "square", label: "Square", ratio: "1:1" },
  { id: "wide", label: "Wide", ratio: "3:2" },
];

function ShapeIcon({ id, className = "" }: { id: ShapeId; className?: string }) {
  const dims = id === "portrait" ? "h-3.5 w-2.5" : id === "square" ? "h-3 w-3" : "h-2.5 w-3.5";
  return (
    <span
      aria-hidden
      className={`inline-block rounded-[2px] border border-current ${dims} ${className}`}
    />
  );
}

export default function ThemeBoard({
  photoreal,
  stylized,
  cards,
  isAdmin = false,
  defaultModel = "gpt-image-2",
  creditBalance,
  canStartFreePreview,
  roster,
  outputMode,
  isProSubscriber,
  subscriptionRenewalDate,
  isAuthenticated,
  initialThemeId = null,
}: {
  photoreal: Theme[];
  stylized: Theme[];
  cards: Theme[];
  isAdmin?: boolean;
  defaultModel?: GenerationModelId;
  creditBalance: number;
  canStartFreePreview: boolean;
  roster: RosterMember[];
  outputMode: OutputMode;
  isProSubscriber: boolean;
  subscriptionRenewalDate: string | null;
  isAuthenticated: boolean;
  initialThemeId?: string | null;
}) {
  const [shape, setShape] = useState<ShapePick>("auto");
  const [wardrobe, setWardrobe] = useState("");
  const [cardText, setCardText] = useState("");
  const [cardSlotStyleIds, setCardSlotStyleIds] = useState<CardArtStyleId[]>(() =>
    Array.from({ length: CARD_STYLE_SLOT_COUNT }, () => DEFAULT_CARD_ART_STYLE_ID),
  );
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>(() =>
    initialThemeId ? [initialThemeId] : [],
  );
  const [modelId, setModelId] = useState<GenerationModelId>(defaultModel);

  const [customDescription, setCustomDescription] = useState("");
  const [locationFile, setLocationFile] = useState<File | null>(null);
  const [locationPreview, setLocationPreview] = useState<string | null>(null);
  const [launchingCustom, setLaunchingCustom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(
    () => isAuthenticated && creditBalance <= 0 && !canStartFreePreview,
  );
  const [cardsExpanded, setCardsExpanded] = useState(false);
  const [mode, setMode] = useState<"curated" | "custom">("curated");
  const [pendingShoot, setPendingShoot] = useState<PendingShoot | null>(null);
  const [authResume, setAuthResume] = useState<AuthResume | null>(null);
  const [generationAuthReady, setGenerationAuthReady] = useState(isAuthenticated);
  const subjectLimit = isAdmin ? null : MAX_SHOT_SUBJECTS;
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(() => new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCardId = outputMode === "card" ? searchParams.get("card") : null;
  const selectedCardTheme = selectedCardId
    ? (cards.find((theme) => theme.id === selectedCardId) ?? null)
    : null;
  const selectedCardNeedsAgeText = selectedCardTheme?.id === LUXURY_CARVED_NUMBER_BIRTHDAY_THEME_ID;
  const availableShootThemes = useMemo(() => [...photoreal, ...stylized], [photoreal, stylized]);
  const availableShootThemeById = useMemo(
    () => new Map(availableShootThemes.map((theme) => [theme.id, theme])),
    [availableShootThemes],
  );
  const selectedThemes = useMemo(
    () =>
      selectedThemeIds
        .map((themeId) => availableShootThemeById.get(themeId))
        .filter((theme): theme is Theme => Boolean(theme)),
    [availableShootThemeById, selectedThemeIds],
  );
  const selectedThemeIdSet = useMemo(() => new Set(selectedThemeIds), [selectedThemeIds]);

  const selectedHasReference = roster.some((m) => selectedSubjectIds.has(m.id) && m.hasReference);

  const toggleSubject = (id: string) => {
    if (subjectLimit && !selectedSubjectIds.has(id) && selectedSubjectIds.size >= subjectLimit) {
      setError(`Choose up to ${subjectLimit} people or pets for one shot.`);
      return;
    }
    setError(null);
    setSelectedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllSubjects = () => {
    setError(null);
    setSelectedSubjectIds(
      new Set((subjectLimit ? roster.slice(0, subjectLimit) : roster).map((m) => m.id)),
    );
  };
  const clearSubjects = () => {
    setError(null);
    setSelectedSubjectIds(new Set());
  };
  const setCardSlotStyle = (slotIndex: number, styleId: CardArtStyleId) => {
    setCardSlotStyleIds((prev) =>
      prev.map((current, index) => (index === slotIndex ? styleId : current)),
    );
  };

  const buildSubjectIdsPayload = (): string[] | undefined => {
    if (roster.length === 0) return undefined;
    const selected = roster.filter((m) => selectedSubjectIds.has(m.id)).map((m) => m.id);
    if (selected.length === roster.length) return undefined;
    return selected;
  };

  const explicitShape =
    shape === "auto" ? null : (shapeOptions.find((o) => o.id === shape) ?? null);

  const resolveRatio = (themeRatio: AspectRatio | null): AspectRatio => {
    if (explicitShape) return explicitShape.ratio;
    return themeRatio ?? CUSTOM_AUTO_RATIO;
  };
  const hasCredits = creditBalance > 0;
  const canCreateShoot = !generationAuthReady || hasCredits || canStartFreePreview;
  const disabledLabel = !generationAuthReady
    ? "Sign in to generate"
    : canStartFreePreview
      ? "Free preview"
      : "Add credits first";
  const outOfCredits = generationAuthReady && !hasCredits && !canStartFreePreview;
  const themeActionLabel = useMemo(() => {
    if (!canCreateShoot) return disabledLabel;
    return selectedThemeIds.length === 0 ? "Select vibe" : "Toggle vibe";
  }, [canCreateShoot, disabledLabel, selectedThemeIds.length]);

  const openCreditDialog = useCallback(() => {
    setError(null);
    setCreditDialogOpen(true);
  }, []);

  const openGenerationAuth = useCallback((resume: AuthResume) => {
    setError(null);
    setAuthResume(resume);
  }, []);

  const handleStartError = (fallback: string) => (e: unknown) => {
    const message = e instanceof Error ? e.message : fallback;
    if (isCreditError(message)) {
      openCreditDialog();
      return;
    }
    setError(message);
  };

  const pickFile = (file: File) => {
    setLocationFile(file);
    const reader = new FileReader();
    reader.onload = () => setLocationPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setLocationFile(null);
    setLocationPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleThemeSelection = useCallback(
    (theme: Theme) => {
      const alreadySelected = selectedThemeIds.includes(theme.id);
      if (!alreadySelected && selectedThemeIds.length >= 4) {
        setError("Choose up to 4 vibes for one shoot.");
        return;
      }
      setError(null);
      setSelectedThemeIds(
        alreadySelected
          ? selectedThemeIds.filter((id) => id !== theme.id)
          : [...selectedThemeIds, theme.id],
      );
    },
    [selectedThemeIds],
  );

  const launchSelectedThemes = useCallback(() => {
    if (selectedThemes.length === 0) {
      setError("Pick at least one vibe to start the shoot.");
      return;
    }
    if (!canCreateShoot) {
      openCreditDialog();
      return;
    }
    setError(null);
    setPendingShoot({
      kind: "theme",
      themes: selectedThemes,
    });
  }, [canCreateShoot, openCreditDialog, selectedThemes]);

  const launch = (theme: Theme) => {
    setError(null);
    if (outputMode === "card") {
      router.push(getThemeStudioHref(theme));
      return;
    }
    if (!canCreateShoot) {
      openCreditDialog();
      return;
    }
    setPendingShoot({ kind: "theme", themes: [theme] });
  };

  const backToCards = () => {
    setError(null);
    router.push("/studio/theme?output=card");
  };

  const launchCustom = () => {
    const trimmed = customDescription.trim();
    if (trimmed.length < 4) {
      setError("A sentence or two will do.");
      return;
    }
    if (!canCreateShoot) {
      openCreditDialog();
      return;
    }
    setError(null);
    setPendingShoot({ kind: "custom" });
  };

  const executeShoot = (shoot: PendingShoot) => {
    if (shoot.kind === "theme") {
      const themes = shoot.themes;
      const theme = themes[0];
      setActiveTheme(theme);
      setLaunchingCustom(false);
      const subjectIds = buildSubjectIdsPayload();
      start(async () => {
        try {
          const { generationId } = await postGenerate({
            themeId: theme.id,
            themeIds: themes.map((item) => item.id),
            outputType: outputMode,
            wardrobeNote: wardrobe.trim() || null,
            cardText: theme.acceptsCardText ? cardText.trim() || null : null,
            aspectOverride: explicitShape?.ratio ?? null,
            modelId: isAdmin ? modelId : undefined,
            subjectIds,
            cardArtStyles:
              outputMode === "card"
                ? {
                    defaultStyleId: DEFAULT_CARD_ART_STYLE_ID,
                    slotStyleIds: cardSlotStyleIds,
                  }
                : undefined,
          });
          router.push(`/studio/generate/${generationId}`);
        } catch (e) {
          handleStartError("Couldn't start the shoot.")(e);
          setActiveTheme(null);
        }
      });
      return;
    }

    setActiveTheme(null);
    setLaunchingCustom(true);
    const subjectIds = buildSubjectIdsPayload();
    start(async () => {
      try {
        let locationReferencePath: string | null = null;
        if (locationFile) {
          const uploaded = await uploadLocationReference(locationFile);
          locationReferencePath = uploaded.path;
        }
        const aspect = resolveRatio(null);
        const trimmed = customDescription.trim();
        const { generationId } = await postGenerate({
          customVibe: { description: trimmed, aspectRatio: aspect },
          outputType: "photoshoot",
          locationReferencePath,
          modelId: isAdmin ? modelId : undefined,
          subjectIds,
        });
        router.push(`/studio/generate/${generationId}`);
      } catch (e) {
        handleStartError("Couldn't start the shoot.")(e);
        setLaunchingCustom(false);
      }
    });
  };

  const confirmShoot = () => {
    if (!pendingShoot) return;
    const shoot = pendingShoot;
    setPendingShoot(null);
    if (!generationAuthReady) {
      openGenerationAuth({ kind: "shoot", shoot });
      return;
    }
    executeShoot(shoot);
  };

  const beginCardShoot = () => {
    if (!selectedCardTheme) return;
    if (!canCreateShoot) {
      openCreditDialog();
      return;
    }
    if (roster.length > 0 && !selectedHasReference) {
      setError("Select at least one person or pet with a reference photo to start the shoot.");
      return;
    }
    const cardTextError = getRequiredCardTextError(selectedCardTheme, cardText);
    if (cardTextError) {
      setError(cardTextError);
      return;
    }

    const theme = selectedCardTheme;
    if (!generationAuthReady) {
      openGenerationAuth({ kind: "card", theme });
      return;
    }
    executeCardShoot(theme);
  };

  const executeCardShoot = (theme: Theme) => {
    const cardTextError = getRequiredCardTextError(theme, cardText);
    if (cardTextError) {
      setError(cardTextError);
      return;
    }
    setError(null);
    setActiveTheme(theme);
    setLaunchingCustom(false);
    const subjectIds = buildSubjectIdsPayload();
    start(async () => {
      try {
        const { generationId } = await postGenerate({
          themeId: theme.id,
          outputType: "card",
          wardrobeNote: wardrobe.trim() || null,
          cardText: theme.acceptsCardText ? cardText.trim() || null : null,
          aspectOverride: explicitShape?.ratio ?? null,
          modelId: isAdmin ? modelId : undefined,
          subjectIds,
          cardArtStyles: {
            defaultStyleId: DEFAULT_CARD_ART_STYLE_ID,
            slotStyleIds: cardSlotStyleIds,
          },
        });
        router.push(`/studio/generate/${generationId}`);
      } catch (e) {
        handleStartError("Couldn't start the card.")(e);
        setActiveTheme(null);
      }
    });
  };

  async function postGenerate(body: unknown): Promise<{ generationId: string }> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    if (data?.debugPromptsOnly) {
      console.log("PROMPT_DEBUG_ONLY prompts", data.prompts);
      throw new Error("Prompt debug mode is on. Prompts were logged; no credits spent.");
    }
    return data;
  }

  const handleGenerationAuthVerified = () => {
    const resume = authResume;
    if (!resume) return;

    setGenerationAuthReady(true);
    setAuthResume(null);
    router.refresh();

    if (resume.kind === "shoot") {
      executeShoot(resume.shoot);
      return;
    }
    executeCardShoot(resume.theme);
  };

  const confirmTitle = (() => {
    if (!pendingShoot) return "";
    if (pendingShoot.kind === "theme") {
      const names = pendingShoot.themes.map((theme) => theme.name).join(", ");
      return `Start with ${names}?`;
    }
    return "Start the custom shoot?";
  })();

  const confirmDescription = (() => {
    if (!pendingShoot) return undefined;
    const themeRatio =
      pendingShoot.kind === "theme" ? (pendingShoot.themes[0]?.aspectRatio ?? null) : null;
    const ratio = resolveRatio(themeRatio);
    const label = shapeOptions.find((o) => o.ratio === ratio)?.label ?? "Wide";
    const noun = outputMode === "card" ? "card designs" : "shots";
    const styleNote =
      outputMode === "card" && pendingShoot.kind === "theme"
        ? " The selected card art style is added on top of the layout prompt."
        : "";
    const previewNote =
      !hasCredits && canStartFreePreview
        ? " This will be a watermarked free preview until you unlock it."
        : "";
    const remainingVibeSlots = pendingShoot.kind === "theme" ? 4 - pendingShoot.themes.length : 0;
    const vibeNote =
      pendingShoot.kind === "theme" && outputMode === "photoshoot"
        ? pendingShoot.themes.length === 1
          ? " Since you picked 1 vibe, we'll generate 4 different variations of that same vibe."
          : pendingShoot.themes.length < 4
            ? ` We'll fill the remaining ${remainingVibeSlots} ${remainingVibeSlots === 1 ? "slot" : "slots"} with recommended vibes automatically.`
            : " We'll use your 4 selected vibes."
        : "";
    return `We'll create 4 ${label} (${ratio}) ${noun}.${vibeNote}${previewNote} You can rate, regenerate, or try another vibe after.${styleNote}`;
  })();

  return (
    <>
      {isAdmin && (
        <div className="mt-10 rounded-[var(--radius-xl)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip chip-coral">
              <span className="dot dot-coral" />
              Admin · model
            </span>
            <span className="text-xs text-[color:var(--color-ink-muted)]">
              Per-shoot override. Default is set on the admin overview.
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {GENERATION_MODEL_IDS.map((id) => {
              const m = MODEL_CATALOG[id];
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
                  <span>{m.label}</span>
                  <span className={`ml-2 text-[0.7rem] ${active ? "opacity-80" : "opacity-60"}`}>
                    {m.priceLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {generationAuthReady && !hasCredits && canStartFreePreview && (
        <section className="mt-10 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <span className="chip chip-butter">
            <span className="dot dot-butter" />
            Free preview
          </span>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
            Your first photoshoot can run as a watermarked preview. If you love it, unlock that
            exact photoshoot and it counts as your first paid generation.
          </p>
        </section>
      )}

      {outOfCredits && (
        <section className="mt-10 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-5 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <span className="chip chip-coral !bg-white/70">
              <span className="dot dot-coral" />
              Out of credits
            </span>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              Add a pack before your next photoshoot. You can review the prices any time.
            </p>
          </div>
          <button type="button" onClick={openCreditDialog} className="btn btn-coral btn-sm">
            View packs
          </button>
        </section>
      )}

      {/* ─── Shared controls ──────────────────────────────────────── */}
      <div className="mt-10 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 sm:p-7 shadow-[var(--shadow-sm)]">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="small-caps text-[color:var(--color-ink-muted)]">
              Wardrobe & mood
              <span className="normal-case tracking-normal text-[0.7rem] opacity-70 ml-1">
                (optional)
              </span>
            </label>
            <input
              value={wardrobe}
              onChange={(e) => setWardrobe(e.target.value)}
              placeholder="e.g. linen in sandy tones, everyone barefoot"
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-2.5 outline-none transition-all focus:border-[color:var(--color-sage)] focus:bg-[color:var(--color-bg-elevated)] focus:shadow-[var(--shadow-ring-sage)]"
            />
            <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
              {outputMode === "card"
                ? "Applied to whichever card layout you launch."
                : "Applied to any curated vibe."}
            </p>
          </div>

          <div>
            <label className="small-caps text-[color:var(--color-ink-muted)]">Shape</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(() => {
                const active = shape === "auto";
                return (
                  <button
                    type="button"
                    onClick={() => setShape("auto")}
                    title="Use the shape each vibe was designed for"
                    className={`spring-press inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.02em] transition-all ${
                      active
                        ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] shadow-[var(--shadow-sm)]"
                        : "border border-[color:var(--color-line-strong)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                    }`}
                  >
                    <span aria-hidden className="inline-flex items-end gap-[2px]">
                      <span className="block h-2 w-[3px] rounded-[1px] bg-current opacity-50" />
                      <span className="block h-2.5 w-[3px] rounded-[1px] bg-current opacity-75" />
                      <span className="block h-3 w-[3px] rounded-[1px] bg-current" />
                    </span>
                    <span>Auto</span>
                    <span
                      className={`text-[0.65rem] font-medium ${active ? "opacity-70" : "opacity-60"}`}
                    >
                      vibe default
                    </span>
                  </button>
                );
              })()}
              {shapeOptions.map((o) => {
                const active = shape === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setShape(o.id)}
                    className={`spring-press inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.02em] transition-all ${
                      active
                        ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] shadow-[var(--shadow-sm)]"
                        : "border border-[color:var(--color-line-strong)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                    }`}
                  >
                    <ShapeIcon id={o.id} />
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lane tabs (curated vs custom) ────────────────────────── */}
      {outputMode === "photoshoot" && (
        <div className="mt-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Vibe source"
            className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-1 shadow-[var(--shadow-sm)]"
          >
            {(
              [
                {
                  id: "curated",
                  label: `Pick a vibe - ${photoreal.length + stylized.length} curated`,
                  dot: "dot-sage",
                },
                { id: "custom", label: "Design your own", dot: "dot-coral" },
              ] as const
            ).map((t) => {
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setMode(t.id)}
                  className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.04em] transition-colors sm:px-5 sm:text-sm ${
                    active
                      ? "text-white"
                      : "text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="vibe-tab-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-[color:var(--color-ink)]"
                      transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    />
                  )}
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      active
                        ? "bg-[color:var(--color-coral)]"
                        : `bg-[color:var(--color-${t.dot === "dot-coral" ? "coral" : "sage"})]`
                    }`}
                    aria-hidden
                  />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Lane content (curated or custom) ─────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        {outputMode === "card" || mode === "curated" ? (
          <motion.div
            key={selectedCardTheme ? `card-${selectedCardTheme.id}` : "curated"}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Curated themes — Photographic */}
            {outputMode === "photoshoot" && (
              <>
                <ThemeSection
                  label="Photographic"
                  sublabel="Real light, real rooms"
                  chipColor="sage"
                  themes={photoreal}
                  pending={pending}
                  disabledLabel={!canCreateShoot ? disabledLabel : undefined}
                  actionLabel={themeActionLabel}
                  activeId={activeTheme?.id ?? null}
                  selectedIds={selectedThemeIdSet}
                  onPick={toggleThemeSelection}
                />

                <ThemeSection
                  label="Stylized"
                  sublabel="Illustration & cinema"
                  chipColor="plum"
                  themes={stylized}
                  pending={pending}
                  disabledLabel={!canCreateShoot ? disabledLabel : undefined}
                  actionLabel={themeActionLabel}
                  activeId={activeTheme?.id ?? null}
                  selectedIds={selectedThemeIdSet}
                  onPick={toggleThemeSelection}
                />
                <div className="h-32 sm:h-28" aria-hidden />
              </>
            )}

            {outputMode === "card" &&
              (selectedCardTheme ? (
                <section className="mt-12">
                  <button type="button" onClick={backToCards} className="btn btn-ghost btn-sm">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M19 12H5M11 18l-6-6 6-6" />
                    </svg>
                    Back to layouts
                  </button>

                  <div className="mt-6 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
                    <aside className="lg:sticky lg:top-8">
                      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)]">
                        <div className="relative aspect-[4/5] bg-[color:var(--color-bg-tinted-butter)]">
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${selectedCardTheme.coverImage})` }}
                            aria-hidden
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-[color:rgba(31,26,36,0.66)] via-transparent to-transparent"
                            aria-hidden
                          />
                          <div className="absolute inset-x-0 bottom-0 p-4">
                            <span className="chip chip-butter shadow-[var(--shadow-sm)]">
                              Selected layout
                            </span>
                            <h2 className="serif mt-3 text-3xl leading-tight tracking-[-0.02em] text-white drop-shadow-sm">
                              {selectedCardTheme.name}
                            </h2>
                          </div>
                        </div>
                        <p className="p-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                          {selectedCardTheme.blurb}
                        </p>
                      </div>
                    </aside>

                    <div className="min-w-0">
                      <div>
                        <CardArtStylePicker
                          slotStyleIds={cardSlotStyleIds}
                          canUseProStyles={isProSubscriber}
                          onSlotStyleChange={setCardSlotStyle}
                        />
                      </div>

                      <div className="mt-8 border-t border-[color:var(--color-line)] pt-8">
                        <label className="small-caps text-[color:var(--color-ink-muted)]">
                          Greeting / card text
                          <span className="ml-1 text-[0.7rem] normal-case tracking-normal opacity-70">
                            {selectedCardNeedsAgeText ? "(required)" : "(optional)"}
                          </span>
                        </label>
                        <input
                          value={cardText}
                          onChange={(e) => setCardText(e.target.value)}
                          placeholder={
                            selectedCardNeedsAgeText
                              ? `e.g. "AVA ROSE - CHAPTER 7"`
                              : `e.g. "The Vitali Family - 2026"`
                          }
                          className="serif mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-4 py-2.5 text-lg outline-none transition-all focus:border-[color:var(--color-butter)] focus:shadow-[0_0_0_4px_rgba(255,210,122,0.35)]"
                        />
                        {selectedCardNeedsAgeText && (
                          <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
                            Include the birthday age so the carved number matches the card.
                          </p>
                        )}
                      </div>

                      {roster.length > 0 && (
                        <div className="mt-8 border-t border-[color:var(--color-line)] pt-8">
                          <SubjectPicker
                            roster={roster}
                            selectedIds={selectedSubjectIds}
                            onToggle={toggleSubject}
                            onSelectAll={selectAllSubjects}
                            onClear={clearSubjects}
                            maxSubjects={subjectLimit}
                          />
                        </div>
                      )}

                      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[color:var(--color-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-[color:var(--color-ink-muted)]">
                          Creates 4 card designs, one for each selected slot style.
                        </p>
                        <button
                          type="button"
                          onClick={beginCardShoot}
                          disabled={pending || (roster.length > 0 && !selectedHasReference)}
                          className={`btn btn-lg ${
                            canCreateShoot && selectedHasReference ? "btn-coral" : "btn-ghost"
                          }`}
                        >
                          {!generationAuthReady
                            ? "Sign in to generate"
                            : !canCreateShoot
                              ? "Add credits to begin"
                              : pending && activeTheme?.id === selectedCardTheme.id
                                ? "Setting up..."
                                : hasCredits
                                  ? "Generate card"
                                  : "Create free preview"}
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="mt-12">
                  <div>
                    <span className="chip chip-butter">
                      <span className="dot dot-butter" />
                      Card layouts
                    </span>
                    <h2 className="serif mt-3 text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
                      Occasion-ready, with room for{" "}
                      <em className="serif-italic" style={{ color: "#8a6a1f" }}>
                        words
                      </em>
                      .
                    </h2>
                  </div>
                  {selectedCardId && (
                    <p className="mt-4 rounded-[var(--radius-md)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
                      That card layout is no longer available. Pick another layout below.
                    </p>
                  )}
                  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.slice(0, 6).map((t) => (
                      <ThemeCard
                        key={t.id}
                        theme={t}
                        disabled={pending}
                        disabledLabel={!canCreateShoot ? disabledLabel : undefined}
                        actionLabel={!canCreateShoot ? disabledLabel : undefined}
                        loading={activeTheme?.id === t.id && pending}
                        onPick={() => launch(t)}
                      />
                    ))}
                    <AnimatePresence initial={false}>
                      {cardsExpanded &&
                        cards.slice(6).map((t, i) => (
                          <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{
                              duration: 0.4,
                              delay: i * 0.025,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <ThemeCard
                              theme={t}
                              disabled={pending}
                              disabledLabel={!canCreateShoot ? disabledLabel : undefined}
                              actionLabel={!canCreateShoot ? disabledLabel : undefined}
                              loading={activeTheme?.id === t.id && pending}
                              onPick={() => launch(t)}
                            />
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                  {cards.length > 6 && (
                    <div className="mt-8 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setCardsExpanded((e) => !e)}
                        className="btn btn-ghost btn-sm"
                        aria-expanded={cardsExpanded}
                      >
                        {cardsExpanded ? (
                          <>
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M18 15l-6-6-6 6" />
                            </svg>
                            Show fewer
                          </>
                        ) : (
                          <>
                            Show all {cards.length}
                            <svg
                              className="h-3.5 w-3.5"
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
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </section>
              ))}
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <section className="panel-coral mt-10 p-6 sm:p-10">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <span className="chip chip-coral !bg-white/70">
                    <span className="dot dot-coral" />
                    Design your own
                  </span>
                  <h2 className="serif mt-3 text-3xl leading-tight tracking-[-0.025em] sm:text-4xl">
                    A vibe{" "}
                    <em className="serif-italic text-[color:var(--color-coral-deep)]">only you</em>{" "}
                    can describe.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-[color:var(--color-ink-muted)]">
                    Write it out in your own words. Drop a photo of a place, a light, a palette —
                    anything the shoot should feel like.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-[1.25fr_1fr]">
                <div>
                  <label className="small-caps text-[color:var(--color-ink-muted)]">
                    Describe the moment
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={6}
                    placeholder={`e.g. "Everyone reading in a sunroom on a rainy afternoon, slate and wool, wet windows, quiet."`}
                    className="serif mt-2 w-full resize-none rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-elevated)] p-4 text-lg leading-relaxed outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)]"
                  />
                </div>

                <div>
                  <label className="small-caps text-[color:var(--color-ink-muted)]">
                    Reference a place{" "}
                    <span className="normal-case tracking-normal text-[0.7rem] opacity-70">
                      (optional)
                    </span>
                  </label>
                  <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
                    A photo of a room, a corner, a light, a color palette — we&apos;ll use it as a
                    guide alongside your family.
                  </p>
                  <div className="mt-3">
                    {locationPreview ? (
                      <div className="warm-noise relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-bg-tinted-butter)] shadow-[var(--shadow-md)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={locationPreview}
                          alt="Location reference"
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-sm bg-white/90 text-[color:var(--color-ink)] hover:bg-white"
                          >
                            Swap
                          </button>
                          <button
                            type="button"
                            onClick={clearFile}
                            className="btn btn-sm bg-[color:rgba(31,26,36,0.72)] text-white hover:bg-[color:var(--color-ink)]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="spring-press flex aspect-[4/3] w-full items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-coral-deep)] transition-all hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-coral-soft)]"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Drop a reference photo
                        </span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end">
                <button
                  onClick={launchCustom}
                  disabled={pending || customDescription.trim().length < 4}
                  className={`btn btn-lg ${canCreateShoot ? "btn-coral" : "btn-ghost"}`}
                >
                  {!generationAuthReady
                    ? "Sign in to generate"
                    : !canCreateShoot
                      ? "Add credits to begin"
                      : pending && launchingCustom
                        ? "Setting up…"
                        : hasCredits
                          ? "Begin this shoot"
                          : "Create free preview"}
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {outputMode === "photoshoot" && mode === "curated" && (
        <div className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-5xl rounded-[var(--radius-xl)] border border-[color:var(--color-line-strong)] bg-[color:rgba(255,253,248,0.94)] p-3 shadow-[0_28px_80px_rgba(31,26,36,0.28),0_8px_24px_rgba(31,26,36,0.14),0_0_0_1px_rgba(255,255,255,0.72)] backdrop-blur-md sm:bottom-5 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-4">
          <div className="min-w-0">
            <p className="small-caps text-[color:var(--color-ink-muted)]">
              {selectedThemes.length}/4 vibes selected
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
              {selectedThemes.length === 0
                ? "Pick 1 to 4 vibes. We'll always create 4 variations."
                : selectedThemes.length === 1
                  ? "We'll make 4 different variations of this vibe after you confirm."
                  : selectedThemes.length < 4
                    ? `We'll add ${4 - selectedThemes.length} recommended ${4 - selectedThemes.length === 1 ? "vibe" : "vibes"} automatically.`
                    : "We'll use your 4 selected vibes."}
            </p>
            {selectedThemes.length > 0 && (
              <p className="mt-2 truncate text-sm font-medium text-[color:var(--color-ink)]">
                {selectedThemes.map((theme) => theme.name).join(" · ")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={launchSelectedThemes}
            disabled={pending || selectedThemes.length === 0}
            className={`btn btn-lg mt-3 w-full sm:mt-0 sm:w-auto ${
              canCreateShoot && selectedThemes.length > 0 ? "btn-coral" : "btn-ghost"
            }`}
          >
            {!generationAuthReady
              ? "Sign in to generate"
              : !canCreateShoot
                ? "Add credits to begin"
                : pending
                  ? "Setting up..."
                  : hasCredits
                    ? "Generate 4 shots"
                    : "Create free preview"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-4 text-sm text-[color:var(--color-coral-deep)]">
          {error}
        </div>
      )}

      <AnimatePresence>
        {pending && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-[color:rgba(251,248,243,0.85)] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="mx-auto mb-6 flex gap-1.5 justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-coral)]"
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <span className="chip chip-coral">Setting up your shoot</span>
              <p className="serif mt-4 text-4xl tracking-[-0.02em]">
                {launchingCustom ? "A custom vibe" : (activeTheme?.name ?? "")}
              </p>
              <p className="mt-3 text-sm text-[color:var(--color-ink-muted)]">
                Warming up the studio lights…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingShoot}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Start shoot"
        tone="coral"
        pending={pending}
        confirmDisabled={roster.length > 0 && !selectedHasReference}
        onConfirm={confirmShoot}
        onCancel={() => setPendingShoot(null)}
      >
        {roster.length > 0 && (
          <SubjectPicker
            roster={roster}
            selectedIds={selectedSubjectIds}
            onToggle={toggleSubject}
            onSelectAll={selectAllSubjects}
            onClear={clearSubjects}
            maxSubjects={subjectLimit}
          />
        )}
      </ConfirmDialog>

      <InlineGenerationAuthGate
        open={!!authResume}
        onClose={() => setAuthResume(null)}
        onVerified={handleGenerationAuthVerified}
      />

      <CreditPurchaseDialog
        open={creditDialogOpen}
        isProSubscriber={isProSubscriber}
        currentPeriodEnd={subscriptionRenewalDate}
        onClose={() => setCreditDialogOpen(false)}
      />
    </>
  );
}

function isCreditError(message: string) {
  return message === ADD_CREDITS_MESSAGE || message === BUY_PACK_MESSAGE;
}

function InlineGenerationAuthGate({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pending, start] = useTransition();

  const normalizedEmail = email.trim().toLowerCase();
  const cooldownActive = resendCooldown > 0;
  const reset = useCallback(() => {
    setStep("email");
    setEmail("");
    setOtp("");
    setMarketingOptIn(false);
    setMessage(null);
    setError(null);
    setResendCooldown(0);
  }, []);
  const close = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open, pending]);

  useEffect(() => {
    if (!cooldownActive) return;
    const interval = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [cooldownActive]);

  if (!open) return null;

  const sendCode = () => {
    setError(null);
    setMessage(null);

    if (step === "code" && cooldownActive) return;
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Enter the email for your FamilyShoot account.");
      return;
    }

    start(async () => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message ?? "Could not send the code.");
        return;
      }

      setStep("code");
      setOtp("");
      setResendCooldown(60);
      setMessage(`We sent a 6-digit code to ${normalizedEmail}.`);
    });
  };

  const verifyCode = () => {
    setError(null);
    setMessage(null);

    if (otp.trim().length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    start(async () => {
      const result = await authClient.signIn.emailOtp({
        email: normalizedEmail,
        otp: otp.trim(),
      });

      if (result.error) {
        setError(result.error.message ?? "That code did not work.");
        return;
      }

      const consent = await fetch("/api/account/marketing-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: marketingOptIn, source: "generation_gate" }),
      }).catch((err) => {
        console.error("Failed to claim temp roster after inline OTP", err);
        return null;
      });

      if (!consent || !consent.ok) {
        setError("You are signed in, but we could not attach this roster. Please try again.");
        return;
      }

      onVerified();
    });
  };

  const resendLabel = cooldownActive
    ? `Resend in ${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, "0")}`
    : "Resend code";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[color:rgba(31,26,36,0.48)] p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generation-auth-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) close();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-5 shadow-[var(--shadow-xl)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="chip chip-coral">
              <span className="dot dot-coral" />
              Save or load account
            </span>
            <h2
              id="generation-auth-title"
              className="serif mt-4 text-3xl leading-tight tracking-[-0.02em]"
            >
              Enter your email to start.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              If you already have an account, we&apos;ll load your roster and credits. Once the code
              checks out, this shoot starts automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={pending}
            className="spring-press inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)] disabled:opacity-50"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path
                d="M2 2L12 12M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <label className="mt-6 block">
          <span className="small-caps text-[color:var(--color-ink-muted)]">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            disabled={pending || step === "code"}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-4 py-3 outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
          />
        </label>

        {step === "code" && (
          <label className="mt-4 block">
            <span className="small-caps text-[color:var(--color-ink-muted)]">Code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              disabled={pending}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="serif mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-center text-3xl tracking-[0.32em] outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
            />
          </label>
        )}

        <label className="mt-4 flex gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
          <input
            type="checkbox"
            checked={marketingOptIn}
            disabled={pending}
            onChange={(event) => setMarketingOptIn(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[color:var(--color-line-strong)] accent-[color:var(--color-coral)]"
          />
          <span>Send me product updates, new styles, offers, and tips.</span>
        </label>

        {message && (
          <p className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-sage)] px-4 py-3 text-sm text-[color:var(--color-sage-deep)]">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-coral)] px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={step === "email" ? sendCode : verifyCode}
            className="btn btn-coral btn-lg w-full"
          >
            {pending
              ? step === "email"
                ? "Sending code..."
                : "Starting shoot..."
              : step === "email"
                ? "Send code"
                : "Start my shoot"}
          </button>
          {step === "code" && (
            <button
              type="button"
              disabled={pending || cooldownActive}
              onClick={sendCode}
              className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendLabel}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
