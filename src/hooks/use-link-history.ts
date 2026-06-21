"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LinkRecord } from "@/lib/types";

const STORAGE_KEY = "snipline-history";
const MAX_HISTORY = 25;
const POLL_INTERVAL_MS = 8000;

export function useLinkHistory() {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load any links this browser created previously.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // One-time hydration from localStorage on mount, not a response to a
      // render - there's no way to read browser storage during SSR/render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLinks(JSON.parse(raw));
    } catch {
      // corrupt or inaccessible storage - start fresh
    }
    setIsLoaded(true);
  }, []);

  // Persist on every change, once the initial load has happened.
  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {
      // storage full or unavailable - history just won't survive a refresh
    }
  }, [links, isLoaded]);

  const addLink = useCallback((link: LinkRecord) => {
    setLinks((prev) => [link, ...prev.filter((l) => l.code !== link.code)].slice(0, MAX_HISTORY));
  }, []);

  const removeLink = useCallback((code: string) => {
    setLinks((prev) => prev.filter((l) => l.code !== code));
  }, []);

  // Poll click counts so the ledger reflects redirects that happen
  // elsewhere - another tab, another device, someone else following the link.
  useEffect(() => {
    if (!isLoaded || links.length === 0) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const codes = links.map((l) => l.code);
        const res = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codes }),
        });
        if (!res.ok || cancelled) return;

        const data: { clicks: Record<string, number> } = await res.json();
        if (cancelled) return;

        setLinks((prev) =>
          prev.map((l) => (data.clicks[l.code] !== undefined ? { ...l, clicks: data.clicks[l.code] } : l))
        );
      } catch {
        // network hiccup - the next interval tick will retry
      }
    };

    poll();
    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // Re-arm only when the set of tracked codes changes size, not on every
    // click-count update (which would otherwise restart the interval).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, links.length]);

  return { links, addLink, removeLink, isLoaded };
}
