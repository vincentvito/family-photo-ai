"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FaceCropDialog from "./FaceCropDialog";
import ReferencePhotoGuide from "./ReferencePhotoGuide";
import { uploadRosterPhoto } from "@/lib/upload-client";

type Role = "adult" | "child" | "pet";

export default function AddPersonDialog({
  onChanged,
  onNotice,
}: {
  onChanged?: () => void;
  onNotice?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("adult");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const resetForm = () => {
    setName("");
    setRole("adult");
    setPhotoFile(null);
    setCropFile(null);
    setPhotoPreview(null);
    setPhotoPreviewError(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => {
    if (pending) return;
    resetForm();
    setError(null);
    setOpen(false);
  };

  const pickFile = (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoPreviewError(false);
  };

  const queueCrop = (file: File) => {
    setCropFile(file);
  };

  const submit = () => {
    setError(null);
    if (!name.trim()) {
      setError("Please add a name.");
      return;
    }
    start(async () => {
      try {
        const displayName = name.trim();
        const res = await fetch("/api/roster/people", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: displayName, role }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }

        const { person } = (await res.json()) as { person: { id: string } };
        if (photoFile) {
          try {
            await uploadRosterPhoto(person.id, photoFile);
          } catch (uploadError) {
            onNotice?.(
              uploadError instanceof Error
                ? `Added ${displayName}, but the photo upload failed: ${uploadError.message}`
                : `Added ${displayName}, but the photo upload failed.`,
            );
          }
        }

        resetForm();
        setOpen(false);
        onChanged?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-coral">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add a person
      </button>

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
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative max-h-[92dvh] w-full max-w-lg overflow-auto rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] p-8 shadow-[var(--shadow-xl)]"
              initial={{ y: 16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-center justify-between">
                <span className="chip chip-coral">
                  <span className="dot dot-coral" />
                  Add to roster
                </span>
                <button
                  onClick={close}
                  disabled={pending}
                  aria-label="Close"
                  className="spring-press inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)] disabled:opacity-50"
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
              <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Who are we adding?</h2>

              <div className="mt-7 space-y-6">
                <div>
                  <label className="small-caps text-[color:var(--color-ink-muted)]">Name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="e.g. Elena"
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
                    Reference photo{" "}
                    <span className="opacity-60 normal-case tracking-normal text-[0.7rem]">
                      (optional)
                    </span>
                  </label>
                  <div className="mt-3">
                    <ReferencePhotoGuide compact />
                  </div>
                  <div className="mt-3">
                    {photoFile ? (
                      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3">
                        {photoPreview && !photoPreviewError ? (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-tinted-butter)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photoPreview}
                              alt="Reference preview"
                              className="h-full w-full object-contain"
                              onError={() => setPhotoPreviewError(true)}
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-tinted-butter)] px-2 text-center text-[color:var(--color-ink-muted)]">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5 shrink-0"
                              aria-hidden
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
                              <path d="M14 2v6h6" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[color:var(--color-ink)]">
                            {photoFile.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">
                            Photo selected
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              disabled={pending}
                              className="text-xs font-semibold text-[color:var(--color-coral-deep)] hover:underline disabled:opacity-50"
                            >
                              Change photo
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoFile(null);
                                setPhotoPreview(null);
                                setPhotoPreviewError(false);
                                if (fileRef.current) fileRef.current.value = "";
                              }}
                              disabled={pending}
                              className="text-xs font-semibold text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-coral-deep)] hover:underline disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={pending}
                        className="spring-press flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-4 text-sm font-semibold text-[color:var(--color-ink-muted)] transition-all hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)] disabled:opacity-50"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                          aria-hidden
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Choose photo
                      </button>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) queueCrop(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-[color:var(--color-coral-deep)]">{error}</p>}
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={close} disabled={pending} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button onClick={submit} disabled={pending} className="btn btn-coral">
                  {pending ? "Adding..." : "Add to roster"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {cropFile && (
        <FaceCropDialog
          key={`${cropFile.name}-${cropFile.lastModified}-${cropFile.size}`}
          file={cropFile}
          open
          busy={pending}
          onCancel={() => setCropFile(null)}
          onUseOriginal={(file) => {
            pickFile(file);
            setCropFile(null);
          }}
          onCrop={(file) => {
            pickFile(file);
            setCropFile(null);
          }}
        />
      )}
    </>
  );
}
