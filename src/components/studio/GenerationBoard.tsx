"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { getGenerationState } from "@/lib/generate-queries";
import type { AspectRatio } from "@/lib/providers/types";
import Confetti from "@/components/motion/Confetti";
import ExportMenu from "@/components/studio/ExportMenu";
import ShareButton from "@/components/studio/ShareButton";

type State = Awaited<ReturnType<typeof getGenerationState>>;

type FavoriteResponse = { isFavorite: boolean };

async function fetchGenerationState(id: string): Promise<State> {
  const res = await fetch(`/api/generate/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const aspectStyle: Record<string, string> = {
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "3:2": "aspect-[3/2]",
  "2:3": "aspect-[2/3]",
  "16:9": "aspect-[16/9]",
};

const loadingMessages = [
  "Getting the light right…",
  "Posing everyone…",
  "Steadying the camera…",
  "A little more color…",
  "Almost there…",
];
const CHECKOUT_UNLOCK_TIMEOUT_MS = 30_000;

export default function GenerationBoard({
  generationId,
  aspectRatio,
  initialState,
}: {
  generationId: string;
  aspectRatio: AspectRatio;
  initialState: State;
}) {
  const [state, setState] = useState(initialState);
  const [unlocking, startUnlock] = useTransition();
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [finishingCheckoutUnlock, setFinishingCheckoutUnlock] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [celebratedAt, setCelebratedAt] = useState<number | null>(null);
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);
  const prevCount = useRef(initialState?.images.length ?? 0);
  const stateRef = useRef(state);

  const openRegenerate = useCallback(
    (imageId: string) => router.push(`/studio/refine/${imageId}`),
    [router],
  );
  const openLightbox = useCallback((imageId: string) => setLightboxImageId(imageId), []);
  const closeLightbox = useCallback(() => setLightboxImageId(null), []);

  // Narrow deps: full `state` would tear down the interval on every poll. Only
  // status and image count drive whether we should still be polling.
  const status = state?.generation.status;
  const imagesLength = state?.images.length ?? 0;
  const unlockReturn = searchParams.get("unlock");
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!status) return;
    if (status === "done" && imagesLength >= 4) {
      if (prevCount.current < 4) {
        setCelebratedAt(Date.now());
      }
      prevCount.current = imagesLength;
      return;
    }
    if (status === "error") return;

    const interval = setInterval(async () => {
      const next = await fetchGenerationState(generationId);
      setState(next);
      if (next?.generation.status === "done" || next?.generation.status === "error") {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [generationId, status, imagesLength]);

  useEffect(() => {
    if (!unlockReturn || !stateRef.current?.isPreview) {
      setFinishingCheckoutUnlock(false);
      return;
    }

    setFinishingCheckoutUnlock(true);
    setUnlockError(null);

    const checkUnlock = async () => {
      const next = await fetchGenerationState(generationId);
      setState(next);
      if (!next?.isPreview) {
        setFinishingCheckoutUnlock(false);
        window.clearInterval(interval);
        window.clearTimeout(timeout);
        router.replace(`/studio/generate/${generationId}`, { scroll: false });
      }
    };

    const interval = window.setInterval(() => {
      void checkUnlock();
    }, 1500);
    const timeout = window.setTimeout(() => {
      setFinishingCheckoutUnlock(false);
      setUnlockError(
        "We couldn't confirm the unlock yet. Try unlock manually; your new credit should be available.",
      );
      window.clearInterval(interval);
    }, CHECKOUT_UNLOCK_TIMEOUT_MS);

    void checkUnlock();

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [generationId, router, unlockReturn]);

  // Rotating loading message
  const [messageIdx, setMessageIdx] = useState(0);
  useEffect(() => {
    const done = state?.generation.status === "done";
    if (done) return;
    const t = setInterval(() => setMessageIdx((i) => (i + 1) % loadingMessages.length), 2600);
    return () => clearInterval(t);
  }, [state?.generation.status]);

  if (!state) return null;

  const { generation, images } = state;
  const isPreview = state.isPreview;
  const aspectCls = aspectStyle[aspectRatio] ?? "aspect-[3/2]";
  const done = generation.status === "done";
  const err = generation.status === "error";

  const slots = Array.from({ length: 4 }, (_, i) => images[i] ?? null);

  return (
    <div className="mt-10">
      {isPreview && (
        <div className="mb-8 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-butter)] bg-[color:var(--color-bg-tinted-butter)] px-5 py-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="chip chip-butter">Free preview</span>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              {finishingCheckoutUnlock
                ? "Finishing your unlock. The watermark will disappear here in a moment."
                : "These images are watermarked. Buy credits to unlock this photoshoot, or choose a larger pack and keep the remaining credits."}
            </p>
            {unlockError && (
              <p className="mt-2 text-sm font-semibold text-[color:var(--color-coral-deep)]">
                {unlockError}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/?unlockGenerationId=${encodeURIComponent(generationId)}#pricing`}
              className="btn btn-coral btn-sm"
            >
              Buy credits to unlock
            </Link>
            <button
              type="button"
              onClick={() => {
                setUnlockError(null);
                startUnlock(async () => {
                  const res = await fetch(`/api/generate/${generationId}/unlock`, {
                    method: "POST",
                  });
                  const body = (await res.json().catch(() => ({}))) as {
                    error?: string;
                    needsCredits?: boolean;
                  };
                  if (!res.ok) {
                    setUnlockError(body.error ?? "Could not unlock preview.");
                    return;
                  }
                  const next = await fetchGenerationState(generationId);
                  setState(next);
                  router.replace(`/studio/generate/${generationId}`, { scroll: false });
                });
              }}
              disabled={unlocking || finishingCheckoutUnlock}
              className="btn btn-ghost btn-sm"
            >
              {finishingCheckoutUnlock
                ? "Finishing..."
                : unlocking
                  ? "Unlocking..."
                  : "I have credits"}
            </button>
          </div>
        </div>
      )}

      {err && (
        <div className="mb-8 rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-5 text-sm text-[color:var(--color-coral-deep)]">
          <p className="font-semibold">Shoot ended early</p>
          <p className="mt-1">{generation.errorMessage ?? "Unknown error."}</p>
          <div className="mt-3">
            <Link href="/studio/output" className="btn btn-sm btn-coral">
              Try another format
            </Link>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-6 py-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3">
          {!done && !err && (
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-coral)]"
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            {done ? (
              <>
                All four ready. <span className="text-[color:var(--color-ink)]">Tap the heart</span>{" "}
                on the ones you love.
              </>
            ) : err ? (
              "Shoot ended early."
            ) : (
              <>
                <span className="text-[color:var(--color-ink)]">{loadingMessages[messageIdx]}</span>
                <span className="ml-2 text-[color:var(--color-ink-faint)]">
                  {images.length} of 4 ready
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/studio/output" className="btn btn-ghost btn-sm">
            Try another format
          </Link>
          <Link href="/studio/album" className="btn btn-coral btn-sm">
            Album
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {slots.map((img, i) => (
          <div
            key={i}
            className={`group relative ${aspectCls} overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)]`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {img ? (
                <motion.div
                  key={`img-${img.id}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ImageTile
                    imageId={img.id}
                    isFavorite={img.isFavorite}
                    isPreview={isPreview}
                    onRegenerateClick={openRegenerate}
                    onOpenLightbox={openLightbox}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`skel-${i}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DevelopingTile index={i} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confetti overlay on completion */}
            {celebratedAt && i === 0 && <Confetti key={celebratedAt} count={22} />}
          </div>
        ))}
      </div>

      <ImageLightbox imageId={lightboxImageId} isPreview={isPreview} onClose={closeLightbox} />
    </div>
  );
}

const ImageTile = memo(function ImageTile({
  imageId,
  isFavorite,
  isPreview,
  onRegenerateClick,
  onOpenLightbox,
}: {
  imageId: string;
  isFavorite: boolean;
  isPreview: boolean;
  onRegenerateClick: (imageId: string) => void;
  onOpenLightbox: (imageId: string) => void;
}) {
  const [fav, setFav] = useState(isFavorite);
  const [pending, start] = useTransition();

  const flip = () => {
    start(async () => {
      const previous = fav;
      setFav(!previous);
      try {
        const res = await fetch("/api/album/favorite", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imageId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as FavoriteResponse;
        setFav(body.isFavorite);
      } catch {
        setFav(previous);
      }
    });
  };

  return (
    <div className="group relative h-full w-full">
      <button
        type="button"
        onClick={() => onOpenLightbox(imageId)}
        className="block h-full w-full cursor-zoom-in overflow-hidden text-left"
        aria-label="View portrait larger"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/images/${imageId}`}
          alt="Family portrait"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </button>

      <div className="tile-action-overlay pointer-events-none absolute inset-0 z-10 flex items-end justify-start bg-gradient-to-t from-[color:rgba(31,26,36,0.75)] via-transparent to-transparent p-4 transition-opacity">
        <div className="flex max-w-full flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRegenerateClick(imageId)}
            disabled={isPreview}
            title={isPreview ? "Unlock this preview before regenerating" : undefined}
            className="btn btn-sm pointer-events-auto bg-white/90 text-[color:var(--color-ink)] hover:bg-white disabled:opacity-70"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M21 12a9 9 0 0 1-15.2 6.5" />
              <path d="M3 12A9 9 0 0 1 18.2 5.5" />
              <path d="M18 2v4h-4" />
              <path d="M6 22v-4h4" />
            </svg>
            {isPreview ? "Unlock to regenerate" : "Regenerate"}
          </button>
          <ExportMenu
            imageId={imageId}
            previewOnly={isPreview}
            triggerClassName="btn btn-sm pointer-events-auto bg-white/90 text-[color:var(--color-ink)] hover:bg-white"
          />
          <ShareButton
            imageId={imageId}
            className="btn btn-sm pointer-events-auto bg-white/90 text-[color:var(--color-ink)] hover:bg-white"
          />
        </div>
      </div>

      {isPreview && (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-[color:rgba(31,26,36,0.64)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-sm)]">
          Preview
        </span>
      )}

      <motion.button
        type="button"
        onClick={flip}
        disabled={pending}
        className={`absolute right-3 top-3 z-20 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full shadow-[var(--shadow-md)] transition-colors ${
          fav
            ? "bg-[color:var(--color-coral)] text-white"
            : "bg-white/90 text-[color:var(--color-ink)] hover:bg-white"
        }`}
        initial={false}
        animate={{ scale: fav ? 1 : 0.96 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.06 }}
        aria-pressed={fav}
        aria-label={fav ? "Remove from favorites" : "Love this image"}
      >
        <HeartIcon filled={fav} />
      </motion.button>
    </div>
  );
});

function DevelopingTile({ index }: { index: number }) {
  const tilt = useMemo(() => -2 + index * 1.35, [index]);
  return (
    <div className="developing absolute inset-0 h-full w-full">
      <div className="absolute inset-0 warm-noise" />
      <motion.div
        className="absolute inset-[7%] rounded-[calc(var(--radius-xl)-10px)] border border-white/45 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
        style={{ transform: `rotate(${tilt}deg)` }}
        animate={{ opacity: [0.46, 0.72, 0.46] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-x-[12%] top-[12%] h-[58%] rounded-sm bg-white/42" />
        <div className="absolute inset-x-[18%] bottom-[14%] h-2 rounded-full bg-white/38" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <div className="rounded-full border border-white/55 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)] shadow-[var(--shadow-sm)] backdrop-blur-sm">
          Developing - {index + 1}
        </div>
      </div>
    </div>
  );
}

function ImageLightbox({
  imageId,
  isPreview,
  onClose,
}: {
  imageId: string | null;
  isPreview: boolean;
  onClose: () => void;
}) {
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
              {isPreview && (
                <span className="flex h-10 items-center rounded-full bg-[color:rgba(31,26,36,0.64)] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-md)]">
                  Preview
                </span>
              )}
              <ExportMenu
                imageId={imageId}
                previewOnly={isPreview}
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
                <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden>
                  <path
                    d="M2 2L12 12M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeartIcon({ filled, small }: { filled: boolean; small?: boolean }) {
  const size = small ? 14 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s-7.5-4.35-9.5-9.5C1 7.5 4 4 7.5 4c1.9 0 3.6 1 4.5 2.5C12.9 5 14.6 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.65 12 21 12 21z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
