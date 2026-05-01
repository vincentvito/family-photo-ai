"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toggleFavorite } from "@/actions/album";

type Item = {
  image: {
    id: string;
    aspectRatio: string;
    refineInstruction: string | null;
  };
  added: number;
  generation: { themeId: string };
};

const chipPalette = ["coral", "sage", "butter", "plum"] as const;
function chipFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return chipPalette[h % chipPalette.length];
}

export default function AlbumGrid({ items }: { items: Item[] }) {
  return (
    <div className="masonry-3">
      {items.map((item) => (
        <AlbumTile key={item.image.id} item={item} />
      ))}
    </div>
  );
}

function AlbumTile({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const [removing, start] = useTransition();
  const router = useRouter();
  const chip = chipFor(item.generation.themeId);

  const remove = () => {
    if (!confirm("Remove from album?")) return;
    start(async () => {
      await toggleFavorite(item.image.id);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <motion.figure
        className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)]"
        whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      >
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/images/${item.image.id}`}
            alt="Family portrait"
            className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
          <span className={`chip chip-${chip}`}>
            <span className={`dot dot-${chip}`} />
            {labelFor(item.generation.themeId)}
          </span>
          <button
            onClick={() => setOpen(true)}
            className="spring-press flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)]"
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
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export
          </button>
        </figcaption>
      </motion.figure>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="absolute inset-0 bg-[color:rgba(31,26,36,0.45)] backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-md rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] p-7 shadow-[var(--shadow-xl)]"
              initial={{ y: 16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-center justify-between">
                <span className="chip chip-coral">
                  <span className="dot dot-coral" />
                  Export
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="spring-press inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)]"
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
              <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Pick a size.</h2>

              <ul className="mt-6 space-y-2.5">
                <ExportRow
                  imageId={item.image.id}
                  label="Web resolution"
                  sub="For sharing, screens, and phones"
                  query=""
                  basePath="/api/images"
                />
                <ExportRow
                  imageId={item.image.id}
                  label="8×10 print"
                  sub="2400 × 3000 px · 300 dpi"
                  query="?target=8x10"
                  basePath="/api/upscale"
                />
                <ExportRow
                  imageId={item.image.id}
                  label="16×20 print"
                  sub="4800 × 6000 px · 300 dpi"
                  query="?target=16x20"
                  basePath="/api/upscale"
                />
              </ul>

              <div className="mt-6 flex items-center justify-between gap-3 pt-5 border-t border-[color:var(--color-line)]">
                <button
                  onClick={remove}
                  disabled={removing}
                  className="text-sm text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-coral-deep)]"
                >
                  {removing ? "Removing…" : "Remove from album"}
                </button>
                <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ExportRow({
  imageId,
  label,
  sub,
  query,
  basePath,
}: {
  imageId: string;
  label: string;
  sub: string;
  query: string;
  basePath: string;
}) {
  return (
    <li>
      <a
        href={`${basePath}/${imageId}${query}`}
        download
        className="spring-press flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3.5 transition-all hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-bg-tinted-coral)] hover:shadow-[var(--shadow-sm)]"
      >
        <div className="min-w-0">
          <p className="serif text-lg leading-tight">{label}</p>
          <p className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">{sub}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-[color:var(--color-coral-deep)]">
          Download
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </a>
    </li>
  );
}

function labelFor(themeId: string) {
  return themeId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
