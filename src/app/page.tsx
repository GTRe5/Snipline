import { ShortenerApp } from "@/components/shortener/shortener-app";
import { StatusDot } from "@/components/status-dot";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-24 pt-16 sm:pt-24">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-signal">
        <StatusDot /> url shortener
      </p>

      <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
        make it short.
        <br />
        <span className="text-signal">make it count.</span>
      </h1>

      <p className="mt-4 max-w-md text-sm text-muted sm:text-base">
        Paste a long link, get a short one back instantly — copied, tracked,
        and logged below in real time.
      </p>

      <div className="mt-10">
        <ShortenerApp />
      </div>
    </main>
  );
}
