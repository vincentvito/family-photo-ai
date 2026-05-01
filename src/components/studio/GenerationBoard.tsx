"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getGenerationState } from "@/actions/generate";
import { toggleFavorite } from "@/actions/album";
import type { AspectRatio } from "@/lib/providers/types";
import Confetti from "@/components/motion/Confetti";

type State = Awaited<ReturnType<typeof getGenerationState>>;

const aspectStyle: Record<AspectRatio, string> = {
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
  const router = useRouter();
  const [celebratedAt, setCelebratedAt] = useState<number | null>(null);
  const prevCount = useRef(initialState?.images.length ?? 0);

  useEffect(() => {
    if (!state) return;
    if (state.generation.status === "done" && state.images.length >= 4) {
      // trigger confetti once when we hit 4
      if (prevCount.current < 4) {
        setCelebratedAt(Date.now());
      }
      prevCount.current = state.images.length;
      return;
    }
    if (state.generation.status === "error") return;

    const interval = setInterval(async () => {
      const next = await getGenerationState(generationId);
      setState(next);
      if (next?.generation.status === "done" || next?.generation.status === "error") {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [generationId, state]);

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
  const aspectCls = aspectStyle[aspectRatio] ?? "aspect-[3/2]";
  const done = generation.status === "done";
  const err = generation.status === "error";

  const slots = Array.from({ length: 4 }, (_, i) => images[i] ?? null);

  return (
    <div className="mt-10">
      {err && (
        <div className="mb-8 rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-5 text-sm text-[color:var(--color-coral-deep)]">
          <p className="font-semibold">Shoot ended early</p>
          <p className="mt-1">{generation.errorMessage ?? "Unknown error."}</p>
          <div className="mt-3">
            <Link href="/studio/theme" className="btn btn-sm btn-coral">
              Try another vibe
            </Link>
          </div>
        </div>
      )}

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
                    onFavoriteToggled={async () => {
                      const next = await getGenerationState(generationId);
                      setState(next);
                      router.refresh();
                    }}
                    onRefineClick={() => router.push(`/studio/refine/${img.id}`)}
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
                  <Skeleton index={i} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confetti overlay on completion */}
            {celebratedAt && i === 0 && (
              <Confetti key={celebratedAt} count={22} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-6 py-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3">
          {!done && !err && (
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-coral)]"
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
          )}
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            {done
              ? <>All four ready. <span className="text-[color:var(--color-ink)]">Tap the heart</span> on the ones you love.</>
              : err
                ? "Shoot ended early."
                : (
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
          <Link href="/studio/theme" className="btn btn-ghost btn-sm">
            Try another vibe
          </Link>
          <Link href="/studio/album" className="btn btn-coral btn-sm">
            Album
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ImageTile({
  imageId,
  isFavorite,
  onFavoriteToggled,
  onRefineClick,
}: {
  imageId: string;
  isFavorite: boolean;
  onFavoriteToggled: () => Promise<void> | void;
  onRefineClick: () => void;
}) {
  const [fav, setFav] = useState(isFavorite);
  const [pending, start] = useTransition();

  const flip = () => {
    start(async () => {
      setFav((f) => !f);
      await toggleFavorite(imageId);
      await onFavoriteToggled();
    });
  };

  return (
    <div className="group relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/images/${imageId}`}
        alt="Family portrait"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />

      {/* Hover controls */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-[color:rgba(31,26,36,0.75)] via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onRefineClick}
          className="btn btn-sm pointer-events-auto bg-white/90 text-[color:var(--color-ink)] hover:bg-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M3 21l3-1 11-11-2-2L4 18l-1 3zM14 7l3 3" />
          </svg>
          Refine
        </button>
        <motion.button
          onClick={flip}
          disabled={pending}
          className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full shadow-[var(--shadow-md)] transition-colors ${
            fav
              ? "bg-[color:var(--color-coral)] text-white"
              : "bg-white/90 text-[color:var(--color-ink)] hover:bg-white"
          }`}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.06 }}
          aria-label={fav ? "Remove from album" : "Add to album"}
        >
          <HeartIcon filled={fav} />
        </motion.button>
      </div>

      {/* Favorite badge (always visible when fav) */}
      {fav && (
        <motion.div
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-coral)] text-white shadow-[var(--shadow-md)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
        >
          <HeartIcon filled small />
        </motion.div>
      )}
    </div>
  );
}

function Skeleton({ index }: { index: number }) {
  const tilt = useMemo(() => -3 + index * 2, [index]);
  return (
    <div className="developing absolute inset-0 flex items-center justify-center">
      <div
        className="relative"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        {/* Tiny polaroid illustration */}
        <div className="polaroid">
          <div className="h-[120px] w-[96px] sm:h-[140px] sm:w-[112px] bg-[color:rgba(255,255,255,0.55)]" />
          <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-semibold tracking-[0.12em] text-[color:var(--color-ink-muted)] uppercase">
            Developing · {index + 1}
          </div>
        </div>
      </div>
    </div>
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
