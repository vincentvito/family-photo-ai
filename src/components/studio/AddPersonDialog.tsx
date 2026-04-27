"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addPerson } from "@/actions/roster";

export default function AddPersonDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"adult" | "child" | "pet">("adult");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!name.trim()) {
      setError("Please add a name.");
      return;
    }
    start(async () => {
      try {
        await addPerson({ name, role, notes: notes || null });
        setName("");
        setNotes("");
        setRole("adult");
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-coral">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
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
              onClick={() => setOpen(false)}
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
                  Add to roster
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="spring-press inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)]"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
                  <label className="small-caps text-[color:var(--color-ink-muted)]">Who are they?</label>
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
                    Optional note <span className="opacity-60 normal-case tracking-normal text-[0.7rem]">(age, hair, breed…)</span>
                  </label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 4 years old, curly hair"
                    className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-2.5 outline-none transition-all focus:border-[color:var(--color-coral)] focus:bg-[color:var(--color-bg-elevated)] focus:shadow-[var(--shadow-ring-coral)]"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[color:var(--color-coral-deep)]">{error}</p>
                )}
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button onClick={submit} disabled={pending} className="btn btn-coral">
                  {pending ? "Adding…" : "Add to roster"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
