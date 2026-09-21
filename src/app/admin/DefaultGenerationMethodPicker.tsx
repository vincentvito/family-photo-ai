"use client";

import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { GenerationMethod } from "@/lib/generation-method";

const labels: Record<GenerationMethod, string> = {
  "current-prompt": "Current prompts",
  "vibe-reference": "Vibe image reference",
};

export default function DefaultGenerationMethodPicker({ initial }: { initial: GenerationMethod }) {
  const [selected, setSelected] = useState(initial);
  const [target, setTarget] = useState<GenerationMethod | null>(null);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(labels) as GenerationMethod[]).map((method) => (
          <button
            key={method}
            type="button"
            disabled={pending}
            onClick={() => method !== selected && setTarget(method)}
            className={`rounded-full border px-4 py-2 text-sm ${method === selected ? "border-[color:var(--color-coral)] bg-[color:var(--color-bg-tinted-coral)]" : "border-[color:var(--color-line-strong)]"}`}
          >
            {labels[method]}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[color:var(--color-ink-muted)]">
        Applies to new built-in portrait shoots. Cards and custom scenes use Current prompts. Model
        choice stays separate. {message}
      </p>
      <ConfirmDialog
        open={target !== null}
        title={`Use ${target ? labels[target] : "this method"} by default?`}
        description="This changes the app-wide method for new built-in portrait shoots. Existing shoots keep their saved method. Cards and custom scenes use Current prompts."
        confirmLabel="Change default"
        cancelLabel="Keep current"
        tone="coral"
        pending={pending}
        onCancel={() => {
          if (!pending) setTarget(null);
        }}
        onConfirm={() => {
          if (!target) return;
          const method = target;
          start(async () => {
            try {
              const response = await fetch("/api/admin/default-generation-method", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ method }),
              });
              if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || "Could not save the default method.");
              }
              setSelected(method);
              setTarget(null);
              setMessage("Saved.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Could not save.");
            }
          });
        }}
      />
    </>
  );
}
