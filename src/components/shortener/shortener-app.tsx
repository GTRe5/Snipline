"use client";

import { useLinkHistory } from "@/hooks/use-link-history";
import { LinkLedger } from "./link-ledger";
import { ShortenerCard } from "./shortener-card";

export function ShortenerApp() {
  const { links, addLink, removeLink } = useLinkHistory();

  return (
    <div className="flex flex-col gap-10">
      <ShortenerCard onCreated={addLink} />
      <LinkLedger links={links} onRemove={removeLink} />
    </div>
  );
}
