"use client";

import { motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { CopyButton } from "./copy-button";
import type { LinkRecord } from "@/lib/types";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function destinationLabel(longUrl: string): string {
  try {
    const u = new URL(longUrl);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return longUrl;
  }
}

interface LedgerRowProps {
  link: LinkRecord;
  onRemove: (code: string) => void;
}

export function LedgerRow({ link, onRemove }: LedgerRowProps) {
  const shortUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${link.code}` : `/${link.code}`;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-2 gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_2fr_auto_auto_auto] sm:items-center sm:gap-3"
    >
      <a
        href={`/${link.code}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 font-mono text-ink hover:text-signal"
      >
        /{link.code}
        <ExternalLink className="h-3 w-3 text-muted" aria-hidden />
      </a>

      <span
        className="col-span-2 truncate font-mono text-xs text-muted sm:col-span-1"
        title={link.longUrl}
      >
        {destinationLabel(link.longUrl)}
      </span>

      <span className="font-mono text-xs text-pulse sm:text-right">
        {link.clicks} {link.clicks === 1 ? "click" : "clicks"}
      </span>

      <span className="font-mono text-xs text-muted sm:text-right">{timeAgo(link.createdAt)}</span>

      <div className="flex items-center justify-end gap-1.5">
        <CopyButton value={shortUrl} />
        <button
          type="button"
          onClick={() => onRemove(link.code)}
          aria-label="Remove from this list"
          className="rounded-lg p-1.5 text-muted hover:bg-bg hover:text-danger"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </motion.li>
  );
}
