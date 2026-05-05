"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { getRefineState } from "@/lib/refine-queries";

type State = NonNullable<Awaited<ReturnType<typeof getRefineState>>>;

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

const suggestions = [
  { label: "Everyone looks at camera", chip: "sage" as const },
  { label: "Warmer light", chip: "butter" as const },
  { label: "Softer smile", chip: "coral" as const },
  { label: "Swap the navy jacket for camel", chip: "plum" as const },
  { label: "Less saturation", chip: "sage" as const },
  { label: "Tidy the background", chip: "plum" as const },
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
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fav, setFav] = useState(state.image.isFavorite);
  const router = useRouter();

  const refinesLeft = Math.max(0, state.refinesMax - state.refinesUsed);
  const atCap = refinesLeft === 0;

  const submit = (text?: string) => {
    if (atCap) return;
    const value = (text ?? instruction).trim();
    if (!value) return;
    setError(null);
    start(async () => {
      try {
        const { imageId: newId } = await postRefine({
          imageId: state.image.id,
          instruction: value,
        });
        setInstruction("");
        const next = await fetchRefineState(newId);
        if (next) {
          setState(next);
          setFav(next.image.isFavorite);
          router.replace(`/studio/refine/${newId}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "The edit didn't land.");
      }
    });
  };

  const flipFavorite = () => {
    start(async () => {
      const previous = fav;
      setFav(!previous);
      try {
        const res = await fetch("/api/album/favorite", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imageId: state.image.id }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as { isFavorite: boolean };
        setFav(body.isFavorite);
      } catch {
        setFav(previous);
      }
    });
  };

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
      <div
        className={`relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)] ${aspectClass(
          state.image.aspectRatio,
        )}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/images/${state.image.id}`}
          alt="Current portrait"
          className="h-full w-full object-cover"
        />
        <AnimatePresence>
          {pending && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-[color:rgba(251,248,243,0.82)] backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex gap-1.5 justify-center">
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
                <span className="chip chip-plum">Making the change</span>
                <p className="serif mt-3 text-2xl tracking-[-0.02em] text-[color:var(--color-ink)]">
                  One moment…
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip chip-plum">
              <span className="dot dot-plum" />
              Your edits
            </span>
            <span
              className={`small-caps ${atCap ? "text-[color:var(--color-coral-deep)]" : "text-[color:var(--color-ink-muted)]"}`}
            >
              {state.refinesUsed} of {state.refinesMax} used · {refinesLeft} left
            </span>
          </div>
          <button
            onClick={flipFavorite}
            className={`btn btn-sm ${fav ? "btn-coral" : "btn-ghost"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M12 21s-7.5-4.35-9.5-9.5C1 7.5 4 4 7.5 4c1.9 0 3.6 1 4.5 2.5C12.9 5 14.6 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.65 12 21 12 21z"
                fill={fav ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            {fav ? "Kept in album" : "Keep this one"}
          </button>
        </div>

        <ol className="mt-6 space-y-3">
          {state.timeline.map((step, i) => {
            const isActive = step.imageId === state.image.id;
            return (
              <li
                key={step.imageId}
                className={`flex gap-4 rounded-[var(--radius-lg)] p-3 transition-colors ${
                  isActive
                    ? "bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-plum-soft)] shadow-[var(--shadow-sm)]"
                    : "border border-[color:var(--color-line)]"
                }`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-line)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/images/${step.imageId}?thumb=160`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`chip ${isActive ? "chip-plum" : "chip-ghost"}`}>
                      {i === 0 ? "Original" : `Edit ${i}`}
                    </span>
                    {isActive && (
                      <span className="small-caps text-[color:var(--color-plum)]">current</span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-[color:var(--color-ink)]">
                    {step.instruction ?? "The original frame."}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
          <label className="small-caps text-[color:var(--color-ink-muted)]">
            Tell your art director
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={3}
            disabled={atCap}
            placeholder={
              atCap
                ? "No refines left on this shoot."
                : `e.g. "Have everyone look at the camera"`
            }
            className="serif mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] p-3.5 text-lg leading-relaxed outline-none transition-all focus:border-[color:var(--color-coral)] focus:bg-[color:var(--color-bg-elevated)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-50"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => submit(s.label)}
                disabled={pending || atCap}
                className={`spring-press chip chip-${s.chip} cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-40`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-[color:var(--color-coral-deep)]">{error}</p>}
          {atCap && !error && (
            <p className="mt-3 text-sm text-[color:var(--color-coral-deep)]">
              You&apos;ve used all {state.refinesMax} refines on this shoot.
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <span className="small-caps text-[color:var(--color-ink-faint)]">⌘ + Enter</span>
            <button
              onClick={() => submit()}
              disabled={pending || atCap || !instruction.trim()}
              className="btn btn-coral"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                <path d="M12 2 l2.4 6.6 L21 11 l-6.6 2.4 L12 20 l-2.4 -6.6 L3 11 l6.6 -2.4 z" />
              </svg>
              {pending ? "Refining…" : "Make the change"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
