"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Person } from "@/../db/schema";
import { uploadRosterPhoto } from "@/lib/upload-client";

type Role = "adult" | "child" | "pet";

export default function EditPersonDialog({
  person,
  open,
  onClose,
  onChanged,
}: {
  person: Person;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [name, setName] = useState(person.name);
  const [role, setRole] = useState<Role>(person.role as Role);
  const [notes, setNotes] = useState(person.notes ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Reset state whenever the dialog opens for a (possibly different) person
  useEffect(() => {
    if (!open) return;
    setName(person.name);
    setRole(person.role as Role);
    setNotes(person.notes ?? "");
    setPhotoFile(null);
    setPhotoPreview(null);
    setError(null);
  }, [open, person]);

  const pickFile = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    setError(null);
    if (!name.trim()) {
      setError("Please add a name.");
      return;
    }
    start(async () => {
      try {
        const patch = await fetch(`/api/roster/people/${person.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            role,
            notes: notes.trim() || null,
          }),
        });
        if (!patch.ok) {
          const body = await patch.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${patch.status}`);
        }

        if (photoFile) {
          await uploadRosterPhoto(person.id, photoFile);
        }

        onChanged?.();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  // Client-only — only run after hydration so we can read document.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-[color:rgba(31,26,36,0.45)] backdrop-blur-[2px]"
            onClick={pending ? undefined : onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-md rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] p-8 shadow-[var(--shadow-xl)]"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="flex items-center justify-between">
              <span className="chip chip-coral">
                <span className="dot dot-coral" />
                Edit roster entry
              </span>
              <button
                onClick={onClose}
                disabled={pending}
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
            <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Edit {person.name}</h2>

            <div className="mt-7 space-y-6">
              <div>
                <label className="small-caps text-[color:var(--color-ink-muted)]">Name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="serif mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-2xl outline-none transition-all focus:border-[color:var(--color-coral)] focus:bg-[color:var(--color-bg-elevated)] focus:shadow-[var(--shadow-ring-coral)]"
                />
              </div>

              <div>
                <label className="small-caps text-[color:var(--color-ink-muted)]">
                  Who are they?
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["adult", "child", "pet"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`spring-press rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                        role === r
                          ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] shadow-[var(--shadow-sm)]"
                          : "bg-[color:var(--color-bg)] text-[color:var(--color-ink-muted)] border border-[color:var(--color-line-strong)] hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="small-caps text-[color:var(--color-ink-muted)]">
                  Optional note{" "}
                  <span className="opacity-60 normal-case tracking-normal text-[0.7rem]">
                    (age, hair, breed…)
                  </span>
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-2.5 outline-none transition-all focus:border-[color:var(--color-coral)] focus:bg-[color:var(--color-bg-elevated)] focus:shadow-[var(--shadow-ring-coral)]"
                />
              </div>

              <div>
                <label className="small-caps text-[color:var(--color-ink-muted)]">
                  Reference photo{" "}
                  <span className="opacity-60 normal-case tracking-normal text-[0.7rem]">
                    (optional — only if replacing)
                  </span>
                </label>
                <div className="mt-3 flex items-center gap-3">
                  {photoPreview ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="New reference preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-line-strong)] text-[color:var(--color-ink-faint)]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-start gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={pending}
                      className="btn btn-ghost btn-sm"
                    >
                      {photoFile ? "Pick a different photo" : "Choose new photo"}
                    </button>
                    {photoFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="text-xs font-semibold text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-coral-deep)] hover:underline"
                      >
                        Cancel new photo
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) pickFile(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-[color:var(--color-coral-deep)]">{error}</p>}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={pending}
                className="btn btn-ghost btn-sm"
                type="button"
              >
                Cancel
              </button>
              <button onClick={submit} disabled={pending} className="btn btn-coral" type="button">
                {pending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
