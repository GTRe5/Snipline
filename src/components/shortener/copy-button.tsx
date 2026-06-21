"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the link text
      // itself is still selectable, so this just fails quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
        copied
          ? "border-pulse/40 bg-pulse-soft text-pulse"
          : "border-border bg-surface text-muted hover:text-ink"
      )}
    >
      {copied ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
      {copied ? "copied" : "copy"}
    </button>
  );
}
