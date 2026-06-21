"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Link2, Loader2 } from "lucide-react";
import { LinkResult } from "./link-result";
import type { LinkRecord } from "@/lib/types";

interface ShortenerCardProps {
  onCreated: (link: LinkRecord) => void;
}

type ShortenResult = LinkRecord & { shortUrl: string };

export function ShortenerCard({ onCreated }: ShortenerCardProps) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a link first - that's the part we shorten.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          alias: showAlias && alias.trim() ? alias.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Couldn't create that link - try again in a moment.");
        return;
      }

      setResult(data);
      onCreated(data);
      setUrl("");
      setAlias("");
      setShowAlias(false);
    } catch {
      setError("Lost the connection - check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface/80 p-2 backdrop-blur-sm sm:p-2.5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-xl bg-bg/60 px-3">
            <Link2 className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <input
              type="text"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="paste a long url - https://example.com/your/very/long/path"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent font-mono text-[13px] text-ink outline-none placeholder:text-muted/70 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-signal px-5 font-display text-sm font-semibold text-signal-foreground transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <>
                snip
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </>
            )}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => setShowAlias((v) => !v)}
            className="text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            {showAlias ? "− remove custom alias" : "+ custom alias"}
          </button>

          <AnimatePresence>
            {showAlias && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 overflow-hidden rounded-lg border border-border bg-bg/60 px-2 py-1"
              >
                <span className="font-mono text-xs text-muted">/</span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value.replace(/\s/g, ""))}
                  placeholder="my-link"
                  maxLength={24}
                  className="w-28 bg-transparent font-mono text-xs text-ink outline-none placeholder:text-muted/60"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      <div className="mt-3 min-h-[1.25rem] px-1">
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key={error}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="text-xs font-medium text-danger"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{result && <LinkResult key={result.code} result={result} />}</AnimatePresence>
    </div>
  );
}
