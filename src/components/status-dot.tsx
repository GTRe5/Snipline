export function StatusDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-pulse" />
    </span>
  );
}
