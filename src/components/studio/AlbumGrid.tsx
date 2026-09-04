"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ExportMenu from "@/components/studio/ExportMenu";
import PrintButton from "@/components/studio/PrintButton";
import ShareButton from "@/components/studio/ShareButton";

type Item = {
  image: {
    id: string;
    aspectRatio: string;
    refineInstruction: string | null;
  };
  generation: { themeId: string; freePreview: boolean };
  creditUsageId: string | null;
};

const chipPalette = ["coral", "sage", "butter", "plum"] as const;
function chipFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return chipPalette[h % chipPalette.length];
}

export default function AlbumGrid({ items }: { items: Item[] }) {
  return (
    <div className="masonry-4">
      {items.map((item) => (
        <AlbumTile key={item.image.id} item={item} />
      ))}
    </div>
  );
}

function AlbumTile({ item }: { item: Item }) {
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, start] = useTransition();
  const router = useRouter();
  const chip = chipFor(item.generation.themeId);

  const remove = () => {
    start(async () => {
      await fetch("/api/album/favorite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageId: item.image.id }),
      });
      setRemoveOpen(false);
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
        <figcaption className="flex flex-col gap-2.5 px-4 py-3">
          <span
            className={`chip chip-${chip} max-w-full self-start whitespace-normal leading-tight`}
          >
            <span className={`dot dot-${chip}`} />
            {labelFor(item.generation.themeId)}
          </span>
          <span className="flex w-full items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setRemoveOpen(true)}
              disabled={removing}
              className="spring-press rounded-full px-2.5 py-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)] disabled:opacity-55"
            >
              {removing ? "Removing..." : "Remove"}
            </button>
            <ExportMenu
              imageId={item.image.id}
              previewOnly={item.generation.freePreview && !item.creditUsageId}
              triggerClassName="spring-press flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)]"
            />
            <PrintButton
              imageId={item.image.id}
              previewOnly={item.generation.freePreview && !item.creditUsageId}
              triggerClassName="spring-press flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-bg-tinted-butter)] hover:text-[color:var(--color-ink)]"
            />
            <ShareButton
              imageId={item.image.id}
              className="spring-press flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-bg-tinted-sage)] hover:text-[color:var(--color-sage-deep)] disabled:opacity-60"
            />
          </span>
        </figcaption>
      </motion.figure>

      <ConfirmDialog
        open={removeOpen}
        title="Remove from album?"
        description="This removes the thumbs up and takes the image out of your album. The generated image stays in the shoot."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        tone="danger"
        pending={removing}
        onConfirm={remove}
        onCancel={() => {
          if (!removing) setRemoveOpen(false);
        }}
      />
    </>
  );
}

function labelFor(themeId: string) {
  return themeId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
