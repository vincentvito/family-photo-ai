"use client";

import { useState, useTransition } from "react";
import {
  GENERATION_MODEL_IDS,
  MODEL_CATALOG,
  type GenerationModelId,
} from "@/lib/replicate/models";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DefaultModelPicker({ initial }: { initial: GenerationModelId }) {
  const [selected, setSelected] = useState<GenerationModelId>(initial);
  const [pendingModel, setPendingModel] = useState<GenerationModelId | null>(null);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestChange = (modelId: GenerationModelId) => {
    if (pending || modelId === selected) return;
    setPendingModel(modelId);
  };

  const confirmChange = () => {
    if (!pendingModel || pending) return;
    const modelId = pendingModel;
    const previous = selected;
    setSelected(modelId);
    setError(null);
    start(async () => {
      try {
        const res = await fetch("/api/admin/default-model", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ modelId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        setSavedAt(Date.now());
        setPendingModel(null);
      } catch (e) {
        setSelected(previous);
        setError(e instanceof Error ? e.message : "Couldn't save.");
      }
    });
  };

  const targetModel = pendingModel ? MODEL_CATALOG[pendingModel] : null;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {GENERATION_MODEL_IDS.map((id) => {
          const m = MODEL_CATALOG[id];
          const active = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => requestChange(id)}
              disabled={pending}
              className={`spring-press rounded-[var(--radius-lg)] border p-5 text-left transition-all ${
                active
                  ? "border-[color:var(--color-coral)] bg-[color:var(--color-bg-tinted-coral)] shadow-[var(--shadow-ring-coral)]"
                  : "border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] hover:border-[color:var(--color-ink-muted)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="serif text-lg leading-tight tracking-[-0.01em]">{m.label}</div>
                  <div className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
                    {m.tierLabel} · supports {m.supportedAspectRatios.join(", ")}
                  </div>
                </div>
                <span className={`chip ${active ? "chip-coral" : "chip-ghost"} whitespace-nowrap`}>
                  {m.priceLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[color:var(--color-ink-muted)]">
        {pending && "Saving…"}
        {!pending && savedAt && "Saved."}
        {!pending && !savedAt && "Updates apply to all new generations."}
        {error && <span className="ml-2 text-[color:var(--color-coral-deep)]">{error}</span>}
      </p>
      <ConfirmDialog
        open={!!targetModel}
        title={targetModel ? `Use ${targetModel.label} by default?` : "Change default model?"}
        description={
          targetModel
            ? `This changes the app-wide default for all new generations. Existing shoots will keep their current model. ${targetModel.label} runs at ${targetModel.tierLabel} and costs ${targetModel.priceLabel}.`
            : undefined
        }
        confirmLabel="Change default"
        cancelLabel="Keep current"
        tone="coral"
        pending={pending}
        onConfirm={confirmChange}
        onCancel={() => {
          if (!pending) setPendingModel(null);
        }}
      />
    </>
  );
}
