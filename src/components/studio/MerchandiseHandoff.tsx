"use client";

import { useCallback, useState } from "react";
import { trackMerchEvent } from "@/lib/analytics/client";

type Status = "idle" | "preparing" | "ready" | "error";

export default function MerchandiseHandoff({
  imageId,
  storeUrl,
  onBack,
}: {
  imageId: string;
  storeUrl: string;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const prepareDownload = useCallback(async () => {
    if (status === "preparing") return;
    setStatus("preparing");
    setError(null);

    try {
      const response = await fetch(`/api/export/merch/${imageId}`, { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Download failed (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "familyshoot-merch-ready.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setStatus("ready");
      trackMerchEvent("merch_asset_downloaded");
    } catch (downloadError) {
      setStatus("error");
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "We could not prepare this portrait.",
      );
    }
  }, [imageId, status]);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="spring-press -ml-1 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
      >
        <BackIcon />
        Back to files
      </button>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--color-coral-deep)]">
        Printify-powered shop
      </p>
      <h2 className="serif mt-2 text-3xl tracking-[-0.02em]">Put this portrait on something.</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[color:var(--color-ink-muted)]">
        Save one shop-ready file here. Then upload it at our shop to make shirts, sweaters, cards,
        and gifts.
      </p>

      <ol className="mt-6 space-y-5">
        <li className="grid grid-cols-[2rem_1fr] gap-3">
          <StepNumber active={status !== "ready"}>1</StepNumber>
          <div>
            <h3 className="serif text-lg">Save your portrait</h3>
            <p className="mt-1 text-xs leading-5 text-[color:var(--color-ink-muted)]">
              We will prepare a high-quality JPEG. The shape of your portrait will stay the same.
            </p>
            <button
              type="button"
              onClick={() => void prepareDownload()}
              disabled={status === "preparing"}
              className="btn btn-sm btn-coral mt-3 disabled:cursor-wait disabled:opacity-65"
            >
              {status === "preparing"
                ? "Preparing file..."
                : status === "ready"
                  ? "Download again"
                  : status === "error"
                    ? "Try again"
                    : "Prepare and download"}
            </button>
            {error ? (
              <p
                className="mt-2 text-xs leading-5 text-[color:var(--color-coral-deep)]"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>
        </li>

        <li className="grid grid-cols-[2rem_1fr] gap-3">
          <StepNumber active={status === "ready"}>2</StepNumber>
          <div className={status === "ready" ? "" : "opacity-45"}>
            <h3 className="serif text-lg">Open the shop</h3>
            <p className="mt-1 text-xs leading-5 text-[color:var(--color-ink-muted)]">
              Upload the file you saved. Printify handles payment, printing, delivery, and order
              support. Shop prices are in USD.
            </p>
            {status === "ready" ? (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackMerchEvent("merch_store_opened")}
                className="btn btn-sm btn-ink mt-3"
              >
                Shop products
                <ExternalIcon />
              </a>
            ) : (
              <span className="mt-3 inline-flex text-xs font-semibold text-[color:var(--color-ink-muted)]">
                Download the file first
              </span>
            )}
          </div>
        </li>
      </ol>
    </div>
  );
}

function StepNumber({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
        active
          ? "bg-[color:var(--color-coral)] text-[color:var(--color-ink)]"
          : "bg-[color:var(--color-line)] text-[color:var(--color-ink-muted)]"
      }`}
      aria-hidden
    >
      {children}
    </span>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M10.5 3 5.5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M6 3h7v7M13 3 7 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5V13H3V4h3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
