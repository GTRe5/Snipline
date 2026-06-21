import clsx from "clsx";

interface SideRailProps {
  side: "left" | "right";
  label: string;
  tone?: "muted" | "credit";
}

/**
 * Purely decorative chrome for the empty gutters on wide viewports - a thin
 * guide line and a small vertical label, in the same blueprint/manifest
 * spirit as the dot-grid background and ledger table. Hidden below `lg` so
 * it never competes with content on narrower screens.
 */
export function SideRail({ side, label, tone = "muted" }: SideRailProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        "pointer-events-none fixed top-1/2 z-0 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex",
        side === "left" ? "left-6" : "right-6"
      )}
    >
      <span className="h-12 w-px bg-border" />
      <span
        className={clsx(
          "font-mono text-[10px] uppercase tracking-[0.35em]",
          tone === "credit" ? "text-credit/70" : "text-muted/60"
        )}
        style={{ writingMode: "vertical-rl" }}
      >
        {label}
      </span>
      <span className="h-12 w-px bg-border" />
    </div>
  );
}