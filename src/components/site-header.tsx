import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-6">
      <Link href="/" className="font-display text-base font-semibold tracking-tight text-ink">
        snip<span className="text-signal">line</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
