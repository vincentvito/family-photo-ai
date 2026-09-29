"use client";

import type { GenerationModelId } from "@/lib/replicate/models";

export default function OpenAIModelToggle({
  value,
  onChange,
  disabled = false,
}: {
  value: GenerationModelId;
  onChange: (id: GenerationModelId) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset
      className="mb-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line-strong)] p-4"
      disabled={disabled}
    >
      <legend className="px-2 text-sm font-semibold">OpenAI direct · Medium quality</legend>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["openai-sunburst-medium", "Sunburst · Pro quality"],
            ["openai-flare-medium", "Flare · Fast"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-50 ${value === id ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-bg)]" : "border-[color:var(--color-line-strong)]"}`}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
        A shoot uses one credit only if all four images succeed. If any image fails, your full
        shoot credit is returned and you can keep the successful images.
      </p>
      <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
        Same published rates for both models: US$30 / 1M output tokens. Input costs: US$8 / 1M image
        tokens and US$5 / 1M text tokens. Total cost per image depends on usage; neither model has a
        fixed per-image price. Both use medium quality.
      </p>
      <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
        OpenAI prices:{" "}
        <a
          className="underline"
          href="https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst"
          target="_blank"
          rel="noreferrer"
        >
          Sunburst
        </a>
        {" · "}
        <a
          className="underline"
          href="https://developers.openai.com/api/docs/models/gpt-image-2.5-flare"
          target="_blank"
          rel="noreferrer"
        >
          Flare
        </a>
        {" · Checked 28 Sep 2026. All prices in USD."}
      </p>
    </fieldset>
  );
}
