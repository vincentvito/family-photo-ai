"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { uploadRosterPhoto } from "@/lib/upload-client";
import { ROSTER_NAME_MAX_LENGTH } from "@/lib/roster-constants";

type Role = "adult" | "child" | "pet";
type DraftStatus = "idle" | "saving" | "done" | "error";

type PersonDraft = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  role: Role;
  status: DraftStatus;
  error: string | null;
};

const MAX_BULK_PEOPLE = 10;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function fileStem(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, ROSTER_NAME_MAX_LENGTH);
}

function createDraft(file: File): PersonDraft {
  return {
    id: `${file.name}-${file.lastModified}-${file.size}-${crypto.randomUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
    name: fileStem(file.name),
    role: "adult",
    status: "idle",
    error: null,
  };
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item) await worker(item);
    }
  });
  await Promise.all(runners);
}

export default function BulkAddPeopleDialog({
  onChanged,
  onNotice,
}: {
  onChanged?: () => void;
  onNotice?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<PersonDraft[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const draftsRef = useRef<PersonDraft[]>([]);

  const remainingSlots = MAX_BULK_PEOPLE - drafts.length;
  const completedCount = drafts.filter((draft) => draft.status === "done").length;
  const hasRowsToSave = drafts.some((draft) => draft.status !== "done");
  const canSave = drafts.length > 0 && hasRowsToSave && !pending;

  const invalidMessage = useMemo(() => {
    const editableDrafts = drafts.filter((draft) => draft.status !== "done");
    if (editableDrafts.some((draft) => !draft.name.trim())) return "Every person needs a name.";
    if (editableDrafts.some((draft) => draft.name.trim().length > ROSTER_NAME_MAX_LENGTH)) {
      return `Names must be ${ROSTER_NAME_MAX_LENGTH} characters or fewer.`;
    }
    return null;
  }, [drafts]);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    return () => {
      draftsRef.current.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
    };
  }, []);

  const addFiles = (fileList: FileList | File[]) => {
    const selected = Array.from(fileList);
    const imageFiles = selected.filter((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    const nextFiles = imageFiles.slice(0, remainingSlots);

    if (selected.length > imageFiles.length) {
      setError("Some files were skipped because they were not supported image types.");
    } else if (selected.length > nextFiles.length) {
      setError(`Only ${MAX_BULK_PEOPLE} people can be added at a time.`);
    } else {
      setError(null);
    }

    if (nextFiles.length === 0) return;
    setDrafts((current) => [...current, ...nextFiles.map(createDraft)]);
  };

  const updateDraft = (
    id: string,
    patch: Partial<Pick<PersonDraft, "name" | "role">>,
  ) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id ? { ...draft, ...patch, error: null, status: "idle" } : draft,
      ),
    );
  };

  const removeDraft = (id: string) => {
    setDrafts((current) => {
      const draft = current.find((item) => item.id === id);
      if (draft) URL.revokeObjectURL(draft.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const resetAndClose = () => {
    drafts.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
    setDrafts([]);
    setError(null);
    setOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => {
    if (pending) return;
    resetAndClose();
  };

  const saveAll = async () => {
    setError(null);
    if (invalidMessage) {
      setError(invalidMessage);
      return;
    }

    const toSave = drafts.filter((draft) => draft.status !== "done");
    setPending(true);
    let saved = 0;
    let failed = 0;

    // Keep bulk saves serialized so a brand-new guest owner cookie is established
    // before the next create/sign/finalize upload chain starts.
    await runWithConcurrency(toSave, 1, async (draft) => {
      setDrafts((current) =>
        current.map((item) =>
          item.id === draft.id ? { ...item, status: "saving", error: null } : item,
        ),
      );

      try {
        const displayName = draft.name.trim();
        const res = await fetch("/api/roster/people", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: displayName,
            role: draft.role,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }

        const { person } = (await res.json()) as { person: { id: string } };
        await uploadRosterPhoto(person.id, draft.file);
        saved += 1;
        setDrafts((current) =>
          current.map((item) =>
            item.id === draft.id ? { ...item, status: "done", error: null } : item,
          ),
        );
      } catch (saveError) {
        failed += 1;
        setDrafts((current) =>
          current.map((item) =>
            item.id === draft.id
              ? {
                  ...item,
                  status: "error",
                  error: saveError instanceof Error ? saveError.message : "Could not add person.",
                }
              : item,
          ),
        );
      }
    });

    setPending(false);
    if (saved > 0) onChanged?.();

    if (failed === 0) {
      onNotice?.(
        `Added ${saved} ${saved === 1 ? "person" : "people"} to the roster with reference photos.`,
      );
      resetAndClose();
      return;
    }

    onNotice?.(
      saved > 0
        ? `Added ${saved} ${saved === 1 ? "person" : "people"}. ${failed} need a retry.`
        : `${failed} ${failed === 1 ? "person needs" : "people need"} a retry.`,
    );
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Add multiple
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="absolute inset-0 bg-[color:rgba(31,26,36,0.45)] backdrop-blur-[2px]"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-xl)]"
              initial={{ y: 16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="border-b border-[color:var(--color-line)] px-5 py-5 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="chip chip-coral">
                      <span className="dot dot-coral" />
                      Bulk roster
                    </span>
                    <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Add up to 10 people</h2>
                  </div>
                  <button
                    onClick={close}
                    disabled={pending}
                    aria-label="Close"
                    className="spring-press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)] disabled:opacity-50"
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
              </div>

              <div className="overflow-auto px-5 py-5 sm:px-7">
                <label
                  className={`spring-press flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-5 py-6 text-center transition-all ${
                    remainingSlots > 0 && !pending
                      ? "hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-bg-tinted-coral)]"
                      : "cursor-not-allowed opacity-55"
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (remainingSlots > 0 && !pending) addFiles(event.dataTransfer.files);
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    multiple
                    disabled={remainingSlots === 0 || pending}
                    className="hidden"
                    onChange={(event) => {
                      if (event.target.files) addFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-bg-tinted-butter)] text-[color:var(--color-coral-deep)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span className="font-semibold text-[color:var(--color-ink)]">
                    Choose or drop reference photos
                  </span>
                  <span className="text-sm text-[color:var(--color-ink-muted)]">
                    {remainingSlots > 0
                      ? `${remainingSlots} ${remainingSlots === 1 ? "slot" : "slots"} left in this batch`
                      : "Batch limit reached"}
                  </span>
                </label>

                {drafts.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {drafts.map((draft, index) => (
                      <div
                        key={draft.id}
                        className="grid gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3 shadow-[var(--shadow-sm)] sm:grid-cols-[88px_minmax(0,1fr)_130px_auto]"
                      >
                        <div className="relative h-24 overflow-hidden rounded-[var(--radius-sm)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-tinted-butter)] sm:h-[88px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={draft.previewUrl}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <label className="block">
                          <span className="small-caps text-[color:var(--color-ink-muted)]">
                            Name
                          </span>
                          <input
                            value={draft.name}
                            maxLength={ROSTER_NAME_MAX_LENGTH}
                            disabled={pending || draft.status === "done"}
                            onChange={(event) =>
                              updateDraft(draft.id, { name: event.target.value })
                            }
                            placeholder={`Person ${index + 1}`}
                            className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-3 py-2 outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-70"
                          />
                        </label>
                        <label className="block">
                          <span className="small-caps text-[color:var(--color-ink-muted)]">
                            Role
                          </span>
                          <select
                            value={draft.role}
                            disabled={pending || draft.status === "done"}
                            onChange={(event) =>
                              updateDraft(draft.id, { role: event.target.value as Role })
                            }
                            className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-3 py-2 outline-none transition-all focus:border-[color:var(--color-coral)] disabled:opacity-70"
                          >
                            <option value="adult">adult</option>
                            <option value="child">child</option>
                            <option value="pet">pet</option>
                          </select>
                        </label>
                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <StatusPill status={draft.status} />
                          {draft.status !== "done" && (
                            <button
                              type="button"
                              onClick={() => removeDraft(draft.id)}
                              disabled={pending}
                              className="text-xs font-semibold text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-coral-deep)] hover:underline disabled:opacity-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {draft.error && (
                          <p className="text-sm text-[color:var(--color-coral-deep)] sm:col-span-4">
                            {draft.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(error || invalidMessage) && (
                  <p className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-coral)] px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
                    {error || invalidMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-[color:var(--color-line)] px-5 pb-12 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:pb-4">
                <p className="text-sm text-[color:var(--color-ink-muted)]">
                  {completedCount > 0
                    ? `${completedCount}/${drafts.length} saved`
                    : "Review names before adding them to the roster."}
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    disabled={pending}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveAll}
                    disabled={!canSave}
                    className="btn btn-coral"
                  >
                    {pending ? "Adding..." : "Add people"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatusPill({ status }: { status: DraftStatus }) {
  if (status === "saving") {
    return <span className="chip chip-butter">saving</span>;
  }
  if (status === "done") {
    return <span className="chip chip-sage">done</span>;
  }
  if (status === "error") {
    return <span className="chip chip-coral">retry</span>;
  }
  return <span className="chip chip-ghost">ready</span>;
}
