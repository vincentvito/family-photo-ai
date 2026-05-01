"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Person, Photo } from "@/../db/schema";
import { removePerson, removePhoto } from "@/actions/roster";

const palette = [
  { chip: "chip-coral", dot: "dot-coral" },
  { chip: "chip-sage", dot: "dot-sage" },
  { chip: "chip-butter", dot: "dot-butter" },
  { chip: "chip-plum", dot: "dot-plum" },
] as const;

// Stable color per person, derived from id
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default function PersonCard({ person, photos }: { person: Person; photos: Photo[] }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const color = colorFor(person.id);

  const handleFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("personId", person.id);
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Upload failed (${res.status})`);
        }
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.article
      className="card overflow-hidden"
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 320, damping: 22 } }}
    >
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`dot ${color.dot}`} aria-hidden />
            <p className="serif text-2xl leading-none tracking-[-0.02em] truncate">{person.name}</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`chip ${color.chip}`}>{person.role}</span>
            {person.notes && <span className="chip chip-ghost">{person.notes}</span>}
          </div>
        </div>
        <button
          onClick={() => {
            if (!confirm(`Remove ${person.name} from the roster?`)) return;
            start(async () => {
              await removePerson(person.id);
              router.refresh();
            });
          }}
          disabled={pending}
          className="spring-press inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-ink-faint)] transition-colors hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)]"
          aria-label={`Remove ${person.name}`}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5 px-5 pt-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--color-line)]"
          >
            <Image
              src={`/api/images/${photo.id}?thumb=240`}
              alt={`${person.name} reference`}
              fill
              sizes="120px"
              className="object-cover"
              unoptimized
            />
            <button
              onClick={() =>
                start(async () => {
                  await removePhoto(photo.id);
                  router.refresh();
                })
              }
              className="absolute inset-0 flex items-center justify-center bg-[color:rgba(31,26,36,0.65)] opacity-0 backdrop-blur-[2px] transition-opacity hover:opacity-100"
              aria-label="Remove photo"
            >
              <span className="chip chip-ghost !bg-white/85 !text-[color:var(--color-ink)]">
                Remove
              </span>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="spring-press flex aspect-square items-center justify-center rounded-[var(--radius-sm)] border-2 border-dashed border-[color:var(--color-line-strong)] text-[color:var(--color-ink-muted)] transition-all hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)] disabled:opacity-50"
          aria-label="Add photo"
        >
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
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <div className="px-5 pb-5 pt-4">
        {uploading && (
          <p className="flex items-center gap-2 text-xs text-[color:var(--color-ink-muted)]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-coral)]" />
            Processing…
          </p>
        )}
        {error && <p className="text-xs text-[color:var(--color-coral-deep)]">{error}</p>}
        {!uploading && !error && photos.length === 0 && (
          <p className="text-xs text-[color:var(--color-ink-muted)]">
            Add 2–5 clear reference photos.
          </p>
        )}
        {!uploading && !error && photos.length > 0 && photos.length < 2 && (
          <p className="text-xs text-[color:var(--color-ink-muted)]">
            A few more angles will help — aim for 2–5.
          </p>
        )}
      </div>
    </motion.article>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M2 2L12 12M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
