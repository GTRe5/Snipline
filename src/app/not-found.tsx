import Link from "next/link";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
      <Frown className="h-6 w-6 text-muted" aria-hidden />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        That link doesn&rsquo;t exist.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The short code you followed isn&rsquo;t in the manifest - it may have been
        mistyped, or never created.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-signal px-4 py-2 font-display text-sm font-semibold text-signal-foreground transition hover:brightness-105"
      >
        shorten a new link
      </Link>
    </main>
  );
}
