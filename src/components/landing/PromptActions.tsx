"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = { title: string; prompt: string; createHref: string };

export default function PromptActions({ title, prompt, createHref }: Props) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");

  useEffect(() => {
    if (status !== "copied") return;
    const timeout = window.setTimeout(() => setStatus("idle"), 3000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function copyPrompt() {
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={copyPrompt}
          disabled={status === "copying"}
          aria-label={`Copy prompt: ${title}`}
        >
          {status === "copied" ? "Copied!" : status === "copying" ? "Copying…" : "Copy prompt"}
        </button>
        <Link href={createHref} className="btn btn-coral" aria-label={`Create this look: ${title}`}>
          Create this look
        </Link>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 text-sm text-[color:var(--color-ink-muted)]"
      >
        {status === "copied"
          ? "Prompt copied."
          : status === "error"
            ? "Copy isn't available in this browser. Select the prompt above and copy it manually."
            : "Your prompt will be filled in. Add photos to make it yours."}
      </p>
    </div>
  );
}
