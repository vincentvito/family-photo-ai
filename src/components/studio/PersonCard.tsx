"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Person, Photo } from "@/../db/schema";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditPersonDialog from "./EditPersonDialog";

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

export default function PersonCard({
  person,
  photos,
  onChanged,
}: {
  person: Person;
  photos: Photo[];
  onChanged?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const color = colorFor(person.id);

  const [removePersonOpen, setRemovePersonOpen] = useState(false);
  const [photoToRemove, setPhotoToRemove] = useState<Photo | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const photo = photos[0] ?? null;

  const confirmRemovePerson = () => {
    setRemovePersonOpen(false);
    start(async () => {
      const res = await fetch(`/api/roster/people/${person.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Remove failed (${res.status})`);
        return;
      }
      onChanged?.();
    });
  };

  const confirmRemovePhoto = () => {
    if (!photoToRemove) return;
    const photoId = photoToRemove.id;
    setPhotoToRemove(null);
    start(async () => {
      const res = await fetch(`/api/roster/photos/${photoId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Remove failed (${res.status})`);
        return;
      }
      onChanged?.();
    });
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("personId", person.id);
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }
      onChanged?.();
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
      <div className="px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <span className={`dot ${color.dot}`} aria-hidden />
          <p className="serif text-2xl leading-none tracking-[-0.02em] truncate">{person.name}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`chip ${color.chip}`}>{person.role}</span>
          {person.notes && <span className="chip chip-ghost">{person.notes}</span>}
        </div>
      </div>

      <div className="px-5 pt-3">
        {photo ? (
          <div
            key={photo.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--color-line)]"
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
              onClick={() => setPhotoToRemove(photo)}
              className="absolute inset-0 flex items-center justify-center bg-[color:rgba(31,26,36,0.65)] opacity-0 backdrop-blur-[2px] transition-opacity hover:opacity-100"
              aria-label="Remove photo"
            >
              <span className="chip chip-ghost !bg-white/85 !text-[color:var(--color-ink)]">
                Remove
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="spring-press flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 border-dashed border-[color:var(--color-line-strong)] text-[color:var(--color-ink-muted)] transition-all hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)] disabled:opacity-50"
            aria-label="Add reference photo"
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
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">
              Add reference photo
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) void handleFile(selected);
          e.target.value = "";
        }}
      />

      <div className="px-5 pb-5 pt-4">
        {uploading && (
          <p className="flex items-center gap-2 text-xs text-[color:var(--color-ink-muted)]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-coral)]" />
            Processing…
          </p>
        )}
        {error && <p className="text-xs text-[color:var(--color-coral-deep)]">{error}</p>}
        {!uploading && !error && !photo && (
          <p className="text-xs text-[color:var(--color-ink-muted)]">
            Add one clear, well-lit face photo.
          </p>
        )}
        {!uploading && !error && photo && (
          <p className="text-xs text-[color:var(--color-ink-muted)]">
            Reference photo ready.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            disabled={pending || uploading}
            className="btn btn-ghost btn-sm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => setRemovePersonOpen(true)}
            disabled={pending || uploading}
            className="spring-press inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)] disabled:opacity-50"
          >
            <CloseIcon />
            Remove
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={removePersonOpen}
        title={`Remove ${person.name}?`}
        description="This deletes their reference photos from storage and removes them from the roster. Generated portraits keep them for now."
        confirmLabel="Remove"
        tone="danger"
        pending={pending}
        onConfirm={confirmRemovePerson}
        onCancel={() => setRemovePersonOpen(false)}
      />
      <ConfirmDialog
        open={!!photoToRemove}
        title="Remove this photo?"
        description="The reference photo will be deleted from storage. You can upload a new one anytime."
        confirmLabel="Remove"
        tone="danger"
        pending={pending}
        onConfirm={confirmRemovePhoto}
        onCancel={() => setPhotoToRemove(null)}
      />
      <EditPersonDialog
        person={person}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onChanged={onChanged}
      />
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
