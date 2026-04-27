"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "@/lib/themes";
import type { AspectRatio } from "@/lib/providers/types";
import { startGeneration } from "@/actions/generate";
import ThemeCard from "./ThemeCard";

type ShapeId =
  | "default"
  | "portrait"
  | "tall"
  | "square"
  | "landscape"
  | "wide";

const shapeOptions: {
  id: ShapeId;
  label: string;
  ratio: AspectRatio | null;
}[] = [
  { id: "default", label: "Theme default", ratio: null },
  { id: "portrait", label: "Portrait", ratio: "4:5" },
  { id: "tall", label: "Tall", ratio: "2:3" },
  { id: "square", label: "Square", ratio: "1:1" },
  { id: "landscape", label: "Landscape", ratio: "3:2" },
  { id: "wide", label: "Widescreen", ratio: "16:9" },
];

const CUSTOM_SHAPE_FALLBACK: AspectRatio = "4:5";

export default function ThemeBoard({
  photoreal,
  stylized,
  cards,
}: {
  photoreal: Theme[];
  stylized: Theme[];
  cards: Theme[];
}) {
  const [shape, setShape] = useState<ShapeId>("default");
  const [wardrobe, setWardrobe] = useState("");
  const [cardText, setCardText] = useState("");
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);

  const [customDescription, setCustomDescription] = useState("");
  const [locationFile, setLocationFile] = useState<File | null>(null);
  const [locationPreview, setLocationPreview] = useState<string | null>(null);
  const [launchingCustom, setLaunchingCustom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cardsExpanded, setCardsExpanded] = useState(false);
  const [mode, setMode] = useState<"curated" | "custom">("curated");
  const router = useRouter();

  const selectedShape =
    shapeOptions.find((o) => o.id === shape) ?? shapeOptions[0];

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

  const launch = (theme: Theme) => {
    setError(null);
    setActiveTheme(theme);
    setLaunchingCustom(false);
    start(async () => {
      try {
        const { generationId } = await startGeneration({
          themeId: theme.id,
          wardrobeNote: wardrobe.trim() || null,
          cardText: theme.acceptsCardText ? cardText.trim() || null : null,
          aspectOverride: selectedShape.ratio,
        });
        router.push(`/studio/generate/${generationId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't start the shoot.");
        setActiveTheme(null);
      }
    });
  };

  const launchCustom = () => {
    const trimmed = customDescription.trim();
    if (trimmed.length < 4) {
      setError("A sentence or two will do.");
      return;
    }
    setError(null);
    setActiveTheme(null);
    setLaunchingCustom(true);
    start(async () => {
      try {
        let locationReferencePath: string | null = null;
        if (locationFile) {
          const fd = new FormData();
          fd.append("file", locationFile);
          const res = await fetch("/api/upload-location", {
            method: "POST",
            body: fd,
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error ?? `Upload failed (${res.status})`);
          }
          locationReferencePath = data.path;
        }
        const aspect = selectedShape.ratio ?? CUSTOM_SHAPE_FALLBACK;
        const { generationId } = await startGeneration({
          customVibe: { description: trimmed, aspectRatio: aspect },
          locationReferencePath,
        });
        router.push(`/studio/generate/${generationId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't start the shoot.");
        setLaunchingCustom(false);
      }
    });
  };

  return (
    <>
      {/* ─── Shared controls ──────────────────────────────────────── */}
      <div className="mt-10 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 sm:p-7 shadow-[var(--shadow-sm)]">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="small-caps text-[color:var(--color-ink-muted)]">
              Wardrobe & mood
              <span className="normal-case tracking-normal text-[0.7rem] opacity-70 ml-1">(optional)</span>
            </label>
            <input
              value={wardrobe}
              onChange={(e) => setWardrobe(e.target.value)}
              placeholder="e.g. linen in sandy tones, everyone barefoot"
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-2.5 outline-none transition-all focus:border-[color:var(--color-sage)] focus:bg-[color:var(--color-bg-elevated)] focus:shadow-[var(--shadow-ring-sage)]"
            />
            <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
              Applied to any curated vibe.
            </p>
          </div>

          <div>
            <label className="small-caps text-[color:var(--color-ink-muted)]">Shape</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {shapeOptions.map((o) => {
                const active = shape === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setShape(o.id)}
                    className={`spring-press rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.02em] transition-all ${
                      active
                        ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] shadow-[var(--shadow-sm)]"
                        : "border border-[color:var(--color-line-strong)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lane tabs (curated vs custom) ────────────────────────── */}
      <div className="mt-10 flex justify-center">
        <div role="tablist" aria-label="Vibe source" className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-1 shadow-[var(--shadow-sm)]">
          {([
            { id: "curated", label: `Pick a vibe · ${photoreal.length + stylized.length + cards.length} curated`, dot: "dot-sage" },
            { id: "custom", label: "Design your own", dot: "dot-coral" },
          ] as const).map((t) => {
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
                    active ? "bg-[color:var(--color-coral)]" : `bg-[color:var(--color-${t.dot === "dot-coral" ? "coral" : "sage"})]`
                  }`}
                  aria-hidden
                />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Lane content (curated or custom) ─────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        {mode === "curated" ? (
          <motion.div
            key="curated"
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Curated themes — Photographic */}
            <ThemeSection
              label="Photographic"
              sublabel="Real light, real rooms"
              chipColor="sage"
              themes={photoreal}
              pending={pending}
              activeId={activeTheme?.id ?? null}
              onPick={launch}
            />

            <ThemeSection
              label="Stylized"
              sublabel="Illustration & cinema"
              chipColor="plum"
              themes={stylized}
              pending={pending}
              activeId={activeTheme?.id ?? null}
              onPick={launch}
            />

            <section className="mt-20">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <span className="chip chip-butter">
                    <span className="dot dot-butter" />
                    For a card or occasion
                  </span>
                  <h2 className="serif mt-3 text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
                    Make it a <em className="serif-italic" style={{ color: "#8a6a1f" }}>keepsake</em>.
                  </h2>
                </div>
                <div className="w-full max-w-md">
                  <label className="small-caps text-[color:var(--color-ink-muted)]">Greeting / card text</label>
                  <input
                    value={cardText}
                    onChange={(e) => setCardText(e.target.value)}
                    placeholder={`e.g. "The Vitali Family — 2026"`}
                    className="serif mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-4 py-2.5 text-lg outline-none transition-all focus:border-[color:var(--color-butter)] focus:shadow-[0_0_0_4px_rgba(255,210,122,0.35)]"
                  />
                </div>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cards.slice(0, 6).map((t) => (
                  <ThemeCard
                    key={t.id}
                    theme={t}
                    disabled={pending}
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
                        transition={{ duration: 0.4, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ThemeCard
                          theme={t}
                          disabled={pending}
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
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                        Show fewer
                      </>
                    ) : (
                      <>
                        Show all {cards.length}
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>
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
              A vibe <em className="serif-italic text-[color:var(--color-coral-deep)]">only you</em> can describe.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-[color:var(--color-ink-muted)]">
              Write it out in your own words. Drop a photo of a place, a light, a palette — anything the shoot should feel like.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.25fr_1fr]">
          <div>
            <label className="small-caps text-[color:var(--color-ink-muted)]">Describe the moment</label>
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
              Reference a place <span className="normal-case tracking-normal text-[0.7rem] opacity-70">(optional)</span>
            </label>
            <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
              A photo of a room, a corner, a light, a color palette — we'll use it as a guide alongside your family.
            </p>
            <div className="mt-3">
              {locationPreview ? (
                <div className="warm-noise relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={locationPreview} alt="Location reference" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-sm bg-white/90 text-[color:var(--color-ink)] hover:bg-white">
                      Swap
                    </button>
                    <button type="button" onClick={clearFile} className="btn btn-sm bg-[color:rgba(31,26,36,0.72)] text-white hover:bg-[color:var(--color-ink)]">
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
            className="btn btn-coral btn-lg"
          >
            {pending && launchingCustom ? "Setting up…" : "Begin this shoot"}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </section>
          </motion.div>
        )}
      </AnimatePresence>

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
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
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
    </>
  );
}

function ThemeSection({
  label,
  sublabel,
  chipColor,
  themes,
  pending,
  activeId,
  onPick,
  initialCount = 6,
}: {
  label: string;
  sublabel: string;
  chipColor: "sage" | "plum" | "butter";
  themes: Theme[];
  pending: boolean;
  activeId: string | null;
  onPick: (t: Theme) => void;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const head = themes.slice(0, initialCount);
  const tail = themes.slice(initialCount);
  const hasMore = tail.length > 0;

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className={`chip chip-${chipColor}`}>
            <span className={`dot dot-${chipColor}`} />
            {label}
          </span>
          <p className="mt-3 serif text-2xl tracking-[-0.02em] text-[color:var(--color-ink)]">{sublabel}</p>
        </div>
        <p className="text-xs text-[color:var(--color-ink-muted)]">
          {!hasMore || expanded
            ? `${themes.length} ${themes.length === 1 ? "vibe" : "vibes"}`
            : `${initialCount} of ${themes.length}`}
        </p>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {head.map((t) => (
          <ThemeCard
            key={t.id}
            theme={t}
            disabled={pending}
            loading={activeId === t.id && pending}
            onPick={() => onPick(t)}
          />
        ))}
        <AnimatePresence initial={false}>
          {expanded &&
            tail.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
              >
                <ThemeCard
                  theme={t}
                  disabled={pending}
                  loading={activeId === t.id && pending}
                  onPick={() => onPick(t)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
      {hasMore && (
        <div className="mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="btn btn-ghost btn-sm"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 15l-6-6-6 6" />
                </svg>
                Show fewer
              </>
            ) : (
              <>
                Show all {themes.length}
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
