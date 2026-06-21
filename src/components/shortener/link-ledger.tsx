"use client";

import { AnimatePresence } from "framer-motion";
import { Inbox } from "lucide-react";
import type { LinkRecord } from "@/lib/types";
import { LedgerRow } from "./ledger-row";

interface LinkLedgerProps {
  links: LinkRecord[];
  onRemove: (code: string) => void;
}

export function LinkLedger({ links, onRemove }: LinkLedgerProps) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          recent links
        </h2>
        {links.length > 0 && (
          <span className="font-mono text-xs text-muted">
            {links.length} logged on this device
          </span>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface/60">
        {links.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Inbox className="h-5 w-5 text-muted" aria-hidden />
            <p className="text-sm text-muted">No links yet. Paste one above to start your manifest.</p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_2fr_auto_auto_auto] gap-3 border-b border-border px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-muted sm:grid">
              <span>code</span>
              <span>destination</span>
              <span className="text-right">clicks</span>
              <span className="text-right">created</span>
              <span />
            </div>
            <ul className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {links.map((link) => (
                  <LedgerRow key={link.code} link={link} onRemove={onRemove} />
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
