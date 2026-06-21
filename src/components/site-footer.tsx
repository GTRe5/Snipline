export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6">
      <div className="flex flex-col items-center gap-1 border-t border-border pt-6 text-center font-mono text-[11px] text-muted sm:flex-row sm:justify-between sm:text-left">
        <span>
          Created by <span className="font-semibold text-credit">GTRe5</span>
        </span>
        <span>deployed on vercel</span>
      </div>
    </footer>
  );
}