"use client";

import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import { CopyButton } from "./copy-button";
import type { LinkRecord } from "@/lib/types";

interface LinkResultProps {
  result: LinkRecord & { shortUrl: string };
}

export function LinkResult({ result }: LinkResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mt-4 overflow-hidden rounded-2xl border border-pulse/30 bg-pulse-soft p-4"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-pulse">
        <motion.span
          initial={{ rotate: -25, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 16 }}
        >
          <Scissors className="h-3.5 w-3.5" aria-hidden />
        </motion.span>
        snipped
      </div>

      <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between">
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate font-mono text-base font-semibold text-ink hover:text-signal sm:text-lg"
        >
          {result.shortUrl.replace(/^https?:\/\//, "")}
        </a>
        <CopyButton value={result.shortUrl} />
      </div>

      <p className="mt-1 truncate font-mono text-xs text-muted" title={result.longUrl}>
        ⤷ {result.longUrl}
      </p>
    </motion.div>
  );
}
