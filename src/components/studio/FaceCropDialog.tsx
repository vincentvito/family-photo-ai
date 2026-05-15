"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const OUTPUT_WIDTH = 1024;
const OUTPUT_HEIGHT = 1280;
const CROP_ASPECT_RATIO = OUTPUT_WIDTH / OUTPUT_HEIGHT;
const MIN_ZOOM = 0.82;
const MAX_ZOOM = 3;
const CROP_GRID_CELLS = Array.from({ length: 9 }, (_, index) => index);

type Point = { x: number; y: number };
type NaturalSize = { width: number; height: number };
type StageSize = { width: number; height: number };

export default function FaceCropDialog({
  file,
  open,
  busy = false,
  onCancel,
  onUseOriginal,
  onCrop,
}: {
  file: File;
  open: boolean;
  busy?: boolean;
  onCancel: () => void;
  onUseOriginal: (file: File) => void;
  onCrop: (file: File) => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ pointerId: number; start: Point; pan: Point } | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<NaturalSize | null>(null);
  const [stageSize, setStageSize] = useState<StageSize>({ width: 320, height: 400 });
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.08);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    try {
      url = URL.createObjectURL(file);
    } catch {
      url = null;
    }

    // Blob URL allocation is an external browser resource; keep its lifecycle in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSourceUrl(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    // Reset crop state when a newly selected file enters the same mounted crop dialog.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageSize(null);
    setPan({ x: 0, y: 0 });
    setZoom(1.08);
    setError(null);
  }, [file]);

  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    if (!stage) return;

    const syncSize = () => {
      const width = Math.max(240, Math.round(stage.getBoundingClientRect().width));
      const height = Math.round(width / CROP_ASPECT_RATIO);
      setStageSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );
    };
    syncSize();

    const observer = new ResizeObserver(syncSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [open]);

  const metrics = useMemo(() => {
    if (!imageSize) return null;
    const baseScale = Math.max(
      stageSize.width / imageSize.width,
      stageSize.height / imageSize.height,
    );
    const scale = baseScale * zoom;
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;
    const baseX = (stageSize.width - width) / 2;
    const baseY = (stageSize.height - height) / 2;
    return { scale, width, height, baseX, baseY };
  }, [imageSize, stageSize, zoom]);

  const clampPan = useCallback(
    (next: Point) => {
      if (!metrics) return next;
      const minX =
        metrics.width >= stageSize.width ? stageSize.width - metrics.width - metrics.baseX : 0;
      const maxX = metrics.width >= stageSize.width ? -metrics.baseX : 0;
      const minY =
        metrics.height >= stageSize.height ? stageSize.height - metrics.height - metrics.baseY : 0;
      const maxY = metrics.height >= stageSize.height ? -metrics.baseY : 0;
      return {
        x: Math.min(maxX, Math.max(minX, next.x)),
        y: Math.min(maxY, Math.max(minY, next.y)),
      };
    },
    [metrics, stageSize],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel, open]);

  if (typeof document === "undefined") return null;

  const boundedPan = metrics ? clampPan(pan) : pan;
  const imageX = metrics ? metrics.baseX + boundedPan.x : 0;
  const imageY = metrics ? metrics.baseY + boundedPan.y : 0;

  const finishCrop = () => {
    if (!file || !imageSize || !metrics || !imageRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Could not prepare the crop.");
      return;
    }

    const visibleStageX = Math.max(0, imageX);
    const visibleStageY = Math.max(0, imageY);
    const sourceX = Math.max(0, -imageX / metrics.scale);
    const sourceY = Math.max(0, -imageY / metrics.scale);
    const sourceWidth = Math.min(
      (stageSize.width - visibleStageX) / metrics.scale,
      imageSize.width - sourceX,
    );
    const sourceHeight = Math.min(
      (stageSize.height - visibleStageY) / metrics.scale,
      imageSize.height - sourceY,
    );
    const outputScaleX = OUTPUT_WIDTH / stageSize.width;
    const outputScaleY = OUTPUT_HEIGHT / stageSize.height;

    ctx.fillStyle = "#fbf8f3";
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    ctx.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      visibleStageX * outputScaleX,
      visibleStageY * outputScaleY,
      sourceWidth * metrics.scale * outputScaleX,
      sourceHeight * metrics.scale * outputScaleY,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not prepare the crop.");
          return;
        }
        const croppedName = file.name.replace(/\.[^.]+$/, "") || "reference-photo";
        onCrop(new File([blob], `${croppedName}-reference-crop.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  };

  const body = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="face-crop-title"
        >
          <motion.div
            className="absolute inset-0 bg-[color:rgba(31,26,36,0.58)] backdrop-blur-[3px]"
            onClick={busy ? undefined : onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative my-auto grid max-h-none w-full max-w-4xl overflow-visible rounded-t-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-xl)] sm:max-h-[92vh] sm:rounded-[var(--radius-xl)] md:grid-cols-[minmax(0,1fr)_20rem] md:overflow-hidden"
            initial={{ y: 22, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="min-h-0 bg-[color:var(--color-bg-dark)] p-3 pb-3 sm:p-6 md:overflow-auto">
              <div
                ref={stageRef}
                className="relative mx-auto aspect-[4/5] w-full max-w-[min(32svh,18rem)] touch-none overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-line-dark)] sm:max-w-[min(58vh,32rem)]"
                onPointerDown={(event) => {
                  if (!metrics || busy) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  dragRef.current = {
                    pointerId: event.pointerId,
                    start: { x: event.clientX, y: event.clientY },
                    pan: boundedPan,
                  };
                }}
                onPointerMove={(event) => {
                  const drag = dragRef.current;
                  if (!drag || drag.pointerId !== event.pointerId) return;
                  setPan(
                    clampPan({
                      x: drag.pan.x + event.clientX - drag.start.x,
                      y: drag.pan.y + event.clientY - drag.start.y,
                    }),
                  );
                }}
                onPointerUp={(event) => {
                  if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
                }}
                onPointerCancel={() => {
                  dragRef.current = null;
                }}
              >
                {sourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={imageRef}
                    src={sourceUrl}
                    alt="Selected reference"
                    draggable={false}
                    onLoad={(event) => {
                      const img = event.currentTarget;
                      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
                      setError(null);
                    }}
                    onError={() =>
                      setError(
                        "This image cannot be previewed here. You can still upload it as-is.",
                      )
                    }
                    className="absolute left-0 top-0 max-w-none select-none"
                    style={
                      metrics
                        ? {
                            width: metrics.width,
                            height: metrics.height,
                            transform: `translate3d(${imageX}px, ${imageY}px, 0)`,
                          }
                        : undefined
                    }
                  />
                )}
                <div className="pointer-events-none absolute inset-0 border-[3px] border-white/95 shadow-[inset_0_0_0_999px_rgba(31,26,36,0.2)]" />
                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {CROP_GRID_CELLS.map((index) => (
                    <span key={index} className="border border-white/22" />
                  ))}
                </div>
              </div>
              <p className="mx-auto mt-3 max-w-[26rem] text-center text-[0.72rem] font-medium leading-snug text-white/72 sm:max-w-[32rem] sm:text-xs">
                Drag to center the person. Leave shoulders visible when you can.
              </p>
            </div>

            <div className="flex min-h-0 flex-col p-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 md:overflow-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="chip chip-coral">
                    <span className="dot dot-coral" />
                    Reference check
                  </span>
                  <h2
                    id="face-crop-title"
                    className="serif mt-2 text-[1.7rem] leading-none sm:mt-3 sm:text-3xl"
                  >
                    Adjust photo
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  aria-label="Close crop tool"
                  className="spring-press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)] hover:text-[color:var(--color-ink)] disabled:opacity-50"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mt-4 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3 sm:mt-7 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="face-crop-zoom"
                    className="text-sm font-semibold text-[color:var(--color-ink)] sm:small-caps sm:text-[color:var(--color-ink-muted)]"
                  >
                    Zoom
                  </label>
                  <span className="text-xs font-medium text-[color:var(--color-ink-muted)]">
                    Pinch or drag photo
                  </span>
                </div>
                <input
                  id="face-crop-zoom"
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.01}
                  value={zoom}
                  disabled={!metrics || busy}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="mt-2 w-full accent-[color:var(--color-coral)] sm:mt-3"
                />
              </div>

              {error && (
                <p className="mt-5 rounded-[var(--radius-md)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-3 text-sm text-[color:var(--color-coral-deep)]">
                  {error}
                </p>
              )}
              {!sourceUrl && (
                <p className="mt-5 rounded-[var(--radius-md)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-3 text-sm text-[color:var(--color-coral-deep)]">
                  This image cannot be previewed here. You can still upload it as-is.
                </p>
              )}

              <div className="sticky bottom-0 z-10 mt-4 bg-[color:var(--color-bg-elevated)] pt-2 pb-[env(safe-area-inset-bottom)] sm:mt-auto sm:pt-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={finishCrop}
                    disabled={!metrics || busy}
                    className="btn btn-ghost btn-sm"
                  >
                    {busy ? "Processing..." : "Use crop"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUseOriginal(file)}
                    disabled={busy}
                    className="btn btn-ghost btn-sm"
                  >
                    Use full photo
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="mt-2 w-full rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)] disabled:opacity-50"
                >
                  Choose again
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(body, document.body);
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
