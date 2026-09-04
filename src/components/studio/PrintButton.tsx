"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import MerchandiseHandoff from "@/components/studio/MerchandiseHandoff";
import { trackMerchEvent } from "@/lib/analytics/client";
import { trapDialogFocus } from "@/lib/dialog-focus";
import { canShowMerchandise, getPublicMerchStoreConfig } from "@/lib/merch-store";

type PrintButtonProps = {
  imageId: string;
  previewOnly?: boolean;
  triggerClassName?: string;
  triggerVariant?: "button" | "icon";
};

export default function PrintButton({
  imageId,
  previewOnly = false,
  triggerClassName = "btn btn-sm btn-ghost",
  triggerVariant = "button",
}: PrintButtonProps) {
  const [open, setOpen] = useState(false);
  const isIcon = triggerVariant === "icon";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const merchStore = getPublicMerchStoreConfig();

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      const dialog = dialogRef.current;
      if (!dialog) return;
      trapDialogFocus(event, dialog);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      (previousFocus ?? trigger)?.focus();
    };
  }, [close, open]);

  if (!canShowMerchandise(previewOnly, merchStore) || !merchStore.enabled) return null;

  const overlay =
    typeof document === "undefined"
      ? null
      : createPortal(
          <AnimatePresence>
            {open ? (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                role="dialog"
                aria-modal="true"
                aria-label="Print portrait on a product"
              >
                <motion.div
                  className="absolute inset-0 bg-[color:rgba(31,26,36,0.45)] backdrop-blur-[2px]"
                  onClick={close}
                />
                <motion.div
                  ref={dialogRef}
                  tabIndex={-1}
                  className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-xl)] sm:max-h-[calc(100dvh-3rem)] sm:p-7"
                  initial={{ y: 16, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 10, opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="chip chip-coral">
                      <span className="dot dot-coral" />
                      Print
                    </span>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={close}
                      aria-label="Close print menu"
                      className="spring-press inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)]"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="mt-2">
                    <MerchandiseHandoff
                      imageId={imageId}
                      storeUrl={merchStore.storeUrl}
                      autoPrepare
                    />
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          trackMerchEvent("merch_handoff_opened");
          setOpen(true);
        }}
        className={triggerClassName}
        aria-label={isIcon ? "Print portrait" : undefined}
      >
        <PrintIcon />
        {isIcon ? null : "Print"}
      </button>
      {overlay}
    </>
  );
}

function PrintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
      <path d="M18 12h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M2 2L12 12M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
