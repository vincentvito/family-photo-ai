"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { getRefineState } from "@/lib/refine-queries";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ExportMenu from "@/components/studio/ExportMenu";
import PrintButton from "@/components/studio/PrintButton";
import ShareButton from "@/components/studio/ShareButton";
import ImageRatingControl from "@/components/studio/ImageRatingControl";

type State = NonNullable<Awaited<ReturnType<typeof getRefineState>>>;
type TimelineStep = State["timeline"][number];

async function fetchRefineState(id: string): Promise<State | null> {
  const res = await fetch(`/api/refine/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function postRefine(body: {
  imageId: string;
  instruction: string;
}): Promise<{ imageId: string }> {
  const res = await fetch("/api/refine", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function deleteImage(imageId: string): Promise<{ fallbackImageId: string | null }> {
  const res = await fetch(`/api/images/${imageId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const suggestions = [
  { label: "Try warmer light", chip: "butter" as const },
  { label: "Everyone looking at camera", chip: "sage" as const },
  { label: "More natural smiles", chip: "coral" as const },
  { label: "Tidy the background", chip: "plum" as const },
  { label: "Softer color", chip: "sage" as const },
  { label: "More print-ready detail", chip: "plum" as const },
];

function aspectClass(aspectRatio: string) {
  switch (aspectRatio) {
    case "16:9":
      return "aspect-video";
    case "4:5":
      return "aspect-[4/5]";
    case "3:2":
      return "aspect-[3/2]";
    case "2:3":
      return "aspect-[2/3]";
    case "1:1":
      return "aspect-square";
    default:
      return "aspect-[4/5]";
  }
}

export default function RefineStage({ initialState }: { initialState: State }) {
  const [state, setState] = useState(initialState);
  const [instruction, setInstruction] = useState("");
  const [regenerating, startRegeneration] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteDialogImageId, setDeleteDialogImageId] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);
  const router = useRouter();
  const closeLightbox = useCallback(() => setLightboxImageId(null), []);

  const regenerationsLeft = Math.max(0, state.refinesMax - state.refinesUsed);
  const atCap = regenerationsLeft === 0;
  const sourceImageId = state.timeline[0]?.imageId ?? state.image.id;
  const regeneratedSteps = state.timeline.slice(1);

  const submit = (text?: string) => {
    if (atCap) return;
    const value = (text ?? instruction).trim();
    if (!value) return;
    setError(null);
    startRegeneration(async () => {
      try {
        const { imageId: newId } = await postRefine({
          imageId: state.image.id,
          instruction: value,
        });
        setInstruction("");
        const next = await fetchRefineState(newId);
        if (next) {
          setState(next);
          router.replace(`/studio/refine/${newId}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "The regeneration did not land.");
      }
    });
  };

  const removeRegeneration = async () => {
    const imageId = deleteDialogImageId;
    if (!imageId) return;
    setError(null);
    setDeleteError(null);
    setDeletingImageId(imageId);
    try {
      const { fallbackImageId } = await deleteImage(imageId);
      const nextStateId =
        state.image.id === imageId ? (fallbackImageId ?? sourceImageId) : state.image.id;
      const next = await fetchRefineState(nextStateId);
      if (next) {
        setState(next);
        router.replace(`/studio/refine/${next.image.id}`);
      } else {
        router.replace(`/studio/refine/${sourceImageId}`);
        router.refresh();
      }
      if (lightboxImageId === imageId) setLightboxImageId(null);
      setDeleteDialogImageId(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "The image was not deleted.");
    } finally {
      setDeletingImageId(null);
    }
  };

  return (
    <div className="mt-10 space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <div
          className={`group relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)] ${aspectClass(
            state.image.aspectRatio,
          )}`}
        >
          <button
            type="button"
            onClick={() => setLightboxImageId(sourceImageId)}
            className="block h-full w-full cursor-zoom-in overflow-hidden text-left"
            aria-label="Open original take"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/images/${sourceImageId}`}
              alt="Original generated portrait"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </button>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[color:rgba(31,26,36,0.7)] via-transparent to-transparent p-4">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink)]">
              Original
            </span>
            <ExportMenu
              imageId={sourceImageId}
              triggerClassName="spring-press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white"
            />
            <PrintButton
              imageId={sourceImageId}
              triggerClassName="spring-press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white"
            />
            <ShareButton
              imageId={sourceImageId}
              className="spring-press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white disabled:opacity-60"
            />
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip chip-plum">
                <span className="dot dot-plum" />
                Regenerate
              </span>
              <span
                className={`small-caps ${atCap ? "text-[color:var(--color-coral-deep)]" : "text-[color:var(--color-ink-muted)]"}`}
              >
                {state.refinesUsed} of {state.refinesMax} used - {regenerationsLeft} left
              </span>
            </div>
            <ImageRatingControl
              key={state.image.id}
              imageId={state.image.id}
              initialRating={state.image.rating ?? (state.image.isFavorite ? "up" : null)}
              variant="inline"
            />
          </div>

          <div className="mt-5">
            <label className="small-caps text-[color:var(--color-ink-muted)]">
              Guide the next take
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={5}
              disabled={atCap}
              placeholder={
                atCap
                  ? "No regenerations left for this image."
                  : `e.g. "Have everyone look at the camera"`
              }
              className="serif mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] p-3.5 text-lg leading-relaxed outline-none transition-all focus:border-[color:var(--color-coral)] focus:bg-[color:var(--color-bg-elevated)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-50"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => submit(s.label)}
                disabled={regenerating || atCap}
                className={`spring-press chip chip-${s.chip} cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-40`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-[color:var(--color-coral-deep)]">{error}</p>}
          {deleteError && (
            <p className="mt-3 text-sm text-[color:var(--color-coral-deep)]">{deleteError}</p>
          )}
          {atCap && !error && (
            <p className="mt-3 text-sm text-[color:var(--color-coral-deep)]">
              You&apos;ve used all {state.refinesMax} regenerations for this image.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="small-caps text-[color:var(--color-ink-faint)]">
              Ctrl/Command + Enter
            </span>
            <button
              type="button"
              onClick={() => submit()}
              disabled={regenerating || atCap || !instruction.trim()}
              className="btn btn-coral"
            >
              <RegenerateIcon />
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="small-caps text-[color:var(--color-ink-muted)]">
              {regeneratedSteps.length} regenerated take
              {regeneratedSteps.length === 1 ? "" : "s"}
            </span>
            <h2 className="serif mt-1 text-3xl leading-tight tracking-[-0.02em]">
              Pick your favorite version.
            </h2>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {regeneratedSteps.map((step, index) => (
            <GalleryTile
              key={step.imageId}
              step={step}
              index={index + 1}
              active={step.imageId === state.image.id}
              aspectRatio={state.image.aspectRatio}
              onOpen={setLightboxImageId}
              onDelete={setDeleteDialogImageId}
              deleting={deletingImageId === step.imageId}
            />
          ))}
          {regenerating && <GeneratingTile aspectRatio={state.image.aspectRatio} />}
          {regeneratedSteps.length === 0 && !regenerating && (
            <div className="rounded-[var(--radius-xl)] border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] p-6 text-sm text-[color:var(--color-ink-muted)] sm:col-span-2">
              Your regenerated takes will appear here.
            </div>
          )}
        </div>
      </section>

      <ImageLightbox imageId={lightboxImageId} onClose={closeLightbox} />
      <ConfirmDialog
        open={deleteDialogImageId !== null}
        title="Delete this take?"
        description="This removes the regenerated image from your shoot, album, and Cloudflare storage."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        pending={deletingImageId !== null}
        onConfirm={() => void removeRegeneration()}
        onCancel={() => {
          if (!deletingImageId) setDeleteDialogImageId(null);
        }}
      />
    </div>
  );
}

function GalleryTile({
  step,
  index,
  active,
  aspectRatio,
  onOpen,
  onDelete,
  deleting,
}: {
  step: TimelineStep;
  index: number;
  active: boolean;
  aspectRatio: string;
  onOpen: (imageId: string) => void;
  onDelete: (imageId: string) => void;
  deleting: boolean;
}) {
  return (
    <motion.figure
      className={`group relative overflow-hidden rounded-[var(--radius-xl)] border bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)] ${
        active ? "border-[color:var(--color-plum-soft)]" : "border-[color:var(--color-line)]"
      }`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => onOpen(step.imageId)}
        className={`block w-full cursor-zoom-in overflow-hidden text-left ${aspectClass(aspectRatio)}`}
        aria-label={`Open ${index === 0 ? "original take" : `regeneration ${index}`}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/images/${step.imageId}`}
          alt={index === 0 ? "Original generated portrait" : `Regenerated portrait ${index}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </button>

      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[color:rgba(31,26,36,0.78)] via-[color:rgba(31,26,36,0.22)] to-transparent p-4 text-white">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink)]">
              {index === 0 ? "Original" : `Regeneration ${index}`}
            </span>
            {active && (
              <span className="rounded-full border border-white/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Current
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/88">
            {step.instruction ?? "The first generated take from this shoot."}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(step.imageId);
            }}
            disabled={deleting}
            className="spring-press pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--color-coral-deep)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white disabled:opacity-55"
          >
            <TrashIcon />
            {deleting ? "Deleting" : "Delete"}
          </button>
          <ExportMenu
            imageId={step.imageId}
            triggerClassName="spring-press pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white"
          />
          <PrintButton
            imageId={step.imageId}
            triggerClassName="spring-press pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white"
          />
          <ShareButton
            imageId={step.imageId}
            className="spring-press pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white disabled:opacity-60"
          />
        </div>
      </figcaption>
    </motion.figure>
  );
}

function GeneratingTile({ aspectRatio }: { aspectRatio: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-plum-soft)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)] ${aspectClass(aspectRatio)}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 warm-noise" />
      <div className="absolute inset-0 flex items-center justify-center bg-[color:rgba(251,248,243,0.78)] backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-plum)]"
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
          <span className="chip chip-plum">Regenerating</span>
          <p className="serif mt-3 text-2xl tracking-[-0.02em] text-[color:var(--color-ink)]">
            Fresh take coming...
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ImageLightbox({ imageId, onClose }: { imageId: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!imageId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageId, onClose]);

  return (
    <AnimatePresence>
      {imageId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color:rgba(31,26,36,0.82)] p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Portrait preview"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 cursor-zoom-out"
            aria-label="Close preview"
          />
          <motion.div
            className="relative max-h-[92vh] max-w-[94vw]"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/images/${imageId}`}
              alt="Family portrait preview"
              loading="lazy"
              decoding="async"
              className="max-h-[92vh] max-w-[94vw] rounded-[var(--radius-lg)] object-contain shadow-[var(--shadow-xl)]"
            />
            <div className="absolute right-3 top-3 flex gap-2">
              <ExportMenu
                imageId={imageId}
                triggerVariant="icon"
                triggerClassName="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-ink)] shadow-[var(--shadow-md)] transition-colors hover:bg-white"
              />
              <PrintButton
                imageId={imageId}
                triggerVariant="icon"
                triggerClassName="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-ink)] shadow-[var(--shadow-md)] transition-colors hover:bg-white"
              />
              <ShareButton
                imageId={imageId}
                iconOnly
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-ink)] shadow-[var(--shadow-md)] transition-colors hover:bg-white disabled:opacity-60"
              />
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-ink)] shadow-[var(--shadow-md)] transition-colors hover:bg-white"
                aria-label="Close preview"
              >
                <CloseIcon />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RegenerateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M21 12a9 9 0 0 1-15.2 6.5" />
      <path d="M3 12A9 9 0 0 1 18.2 5.5" />
      <path d="M18 2v4h-4" />
      <path d="M6 22v-4h4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M2 2L12 12M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
