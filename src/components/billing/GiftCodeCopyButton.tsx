"use client";

import { useEffect, useRef, useState } from "react";

export default function GiftCodeCopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  async function copy() {
    if (resetTimerRef.current != null) {
      window.clearTimeout(resetTimerRef.current);
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setFailed(true);
      resetTimerRef.current = window.setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <button type="button" onClick={copy} className="btn btn-ghost btn-sm">
      {failed ? "Copy failed" : copied ? "Copied" : label}
    </button>
  );
}
