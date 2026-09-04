"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type ExportMenuProps = {
  imageId: string;
  previewOnly?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "button" | "icon";
};

type ExportOption = {
  id: string;
  label: string;
  sub: string;
  query: string;
  basePath: string;
  method: "GET" | "POST";
  fileName: (imageId: string) => string;
};

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "original",
    label: "Original file",
    sub: "Best for phones, sharing, and quick saves",
    query: "",
    basePath: "/api/images",
    method: "GET",
    fileName: (imageId) => `family-photo-${imageId}.jpg`,
  },
  {
    id: "8x10",
    label: "8x10 print",
    sub: "Upscaled to 2400 x 3000 px",
    query: "?target=8x10",
    basePath: "/api/upscale",
    method: "POST",
    fileName: () => "portrait-8x10.jpg",
  },
  {
    id: "16x20",
    label: "16x20 print",
    sub: "Upscaled to 4800 x 6000 px",
    query: "?target=16x20",
    basePath: "/api/upscale",
    method: "POST",
    fileName: () => "portrait-16x20.jpg",
  },
];

export default function ExportMenu({
  imageId,
  previewOnly = false,
  triggerLabel = "Export",
  triggerClassName = "btn btn-sm btn-ghost",
  triggerVariant = "button",
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeExport, setActiveExport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isIcon = triggerVariant === "icon";
  const exportOptions = previewOnly
    ? EXPORT_OPTIONS.filter((option) => option.id === "original")
    : EXPORT_OPTIONS;

  const downloadFile = useCallback(
    async (option: ExportOption) => {
      if (activeExport) return;
      setActiveExport(option.id);
      setError(null);
      try {
        const res = await fetch(`${option.basePath}/${imageId}${option.query}`, {
          method: option.method,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Export failed (${res.status})`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = option.fileName(imageId);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Export failed.");
      } finally {
        setActiveExport(null);
      }
    },
    [activeExport, imageId],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, []);
  const openMenu = useCallback(() => {
    setOpen(true);
    setError(null);
  }, []);

  const overlay =
    typeof document === "undefined"
      ? null
      : createPortal(
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
                aria-label="Export portrait"
              >
                <motion.div
                  className="absolute inset-0 bg-[color:rgba(31,26,36,0.45)] backdrop-blur-[2px]"
                  onClick={close}
                />
                <motion.div
                  className="relative w-full max-w-md rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] p-7 shadow-[var(--shadow-xl)]"
                  initial={{ y: 16, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 10, opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="chip chip-coral">
                      <span className="dot dot-coral" />
                      Export
                    </span>
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close export menu"
                      className="spring-press inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)]"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Pick a file.</h2>
                  {previewOnly && (
                    <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
                      Preview downloads use the watermarked original file. Unlock this photoshoot
                      for print sizes.
                    </p>
                  )}

                  <ul className="mt-6 space-y-2.5">
                    {exportOptions.map((option) => (
                      <ExportRow
                        key={option.id}
                        option={option}
                        pending={activeExport === option.id}
                        disabled={activeExport !== null}
                        onDownload={() => void downloadFile(option)}
                      />
                    ))}
                  </ul>
                  {error && (
                    <p className="mt-4 text-sm text-[color:var(--color-coral-deep)]">{error}</p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        );

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openMenu();
        }}
        className={triggerClassName}
        aria-label={isIcon ? "Export portrait" : undefined}
      >
        <ExportIcon className={isIcon ? "h-4 w-4" : "h-3.5 w-3.5"} />
        {!isIcon && triggerLabel}
      </button>
      {overlay}
    </>
  );
}

function ExportRow({
  option,
  pending,
  disabled,
  onDownload,
}: {
  option: ExportOption;
  pending: boolean;
  disabled: boolean;
  onDownload: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className="spring-press flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3.5 text-left transition-all hover:border-[color:var(--color-coral)] hover:bg-[color:var(--color-bg-tinted-coral)] hover:shadow-[var(--shadow-sm)] disabled:cursor-wait disabled:opacity-65"
      >
        <div className="min-w-0">
          <p className="serif text-lg leading-tight">{option.label}</p>
          <p className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">{option.sub}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[color:var(--color-coral-deep)]">
          {pending ? (
            <>
              Preparing
              <SpinnerIcon />
            </>
          ) : (
            <>
              Save
              <ArrowIcon />
            </>
          )}
        </span>
      </button>
    </li>
  );
}

function ExportIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 animate-spin" aria-hidden>
      <path
        d="M12 3a9 9 0 1 1-8.49 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
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
