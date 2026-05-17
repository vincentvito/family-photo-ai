"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import CreditPackChooser from "@/components/billing/CreditPackChooser";

export default function CreditPurchaseDialog({
  open,
  isProSubscriber = false,
  currentPeriodEnd = null,
  onClose,
}: {
  open: boolean;
  isProSubscriber?: boolean;
  currentPeriodEnd?: string | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
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
          aria-labelledby="credit-purchase-dialog-title"
        >
          <motion.div
            className="absolute inset-0 bg-[color:rgba(31,26,36,0.52)] backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative max-h-[min(92vh,880px)] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-xl)] border border-white/60 bg-[color:var(--color-bg)] p-5 shadow-[var(--shadow-xl)] sm:p-7"
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] bg-white/80 text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-colors hover:bg-white"
              aria-label="Close credit purchase dialog"
            >
              <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden>
                <path
                  d="M2 2L12 12M12 2L2 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="pr-12">
              <span className="chip chip-coral">
                <span className="dot dot-coral" />
                Out of credits
              </span>
              <h2
                id="credit-purchase-dialog-title"
                className="serif mt-3 text-3xl leading-[1.08] tracking-[-0.02em] sm:text-4xl"
              >
                Add shoots to keep creating.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Pick a pack below. Checkout opens securely, then your new shoots are added to this
                account.
              </p>
            </div>

            <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-4 sm:p-5">
              <CreditPackChooser
                title="Choose your next pack."
                description="Each shoot creates 4 downloadable starting images."
                compact
                isProSubscriber={isProSubscriber}
                currentPeriodEnd={currentPeriodEnd}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
