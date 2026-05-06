"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type Tone = "neutral" | "danger" | "coral";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  pending?: boolean;
  confirmDisabled?: boolean;
  /** Optional content rendered between the description and the action row. */
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

const confirmClassByTone: Record<Tone, string> = {
  neutral: "btn btn-coral",
  coral: "btn btn-coral",
  danger:
    "spring-press inline-flex items-center justify-center rounded-full bg-[color:var(--color-coral-deep)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition-all hover:brightness-110 disabled:opacity-60",
};

const chipClassByTone: Record<Tone, string> = {
  neutral: "chip chip-butter",
  coral: "chip chip-coral",
  danger: "chip chip-coral",
};

const dotClassByTone: Record<Tone, string> = {
  neutral: "dot dot-butter",
  coral: "dot dot-coral",
  danger: "dot dot-coral",
};

const chipLabelByTone: Record<Tone, string> = {
  neutral: "Confirm",
  coral: "Confirm",
  danger: "Heads up",
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "neutral",
  pending = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && !confirmDisabled && !pending) onConfirm();
    };
    window.addEventListener("keydown", onKey);
    confirmRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm, confirmDisabled, pending]);

  // Client-only — the component is "use client" so this branch only runs after
  // hydration; on the server we render nothing to avoid touching document.
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
          aria-labelledby="confirm-dialog-title"
        >
          <motion.div
            className="absolute inset-0 bg-[color:rgba(31,26,36,0.45)] backdrop-blur-[2px]"
            onClick={pending ? undefined : onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative max-h-[min(90vh,820px)] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] p-8 shadow-[var(--shadow-xl)]"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <span className={chipClassByTone[tone]}>
              <span className={dotClassByTone[tone]} />
              {chipLabelByTone[tone]}
            </span>
            <h2
              id="confirm-dialog-title"
              className="serif mt-3 text-3xl leading-[1.1] tracking-[-0.02em]"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-3 text-[color:var(--color-ink-muted)]">{description}</p>
            )}

            {children && <div className="mt-5">{children}</div>}

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={pending}
                className="btn btn-ghost btn-sm"
                type="button"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={pending || confirmDisabled}
                className={confirmClassByTone[tone]}
                type="button"
              >
                {pending ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
