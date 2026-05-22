import type { ReactNode } from "react";

export function ChartTooltipShell({
  title,
  subtitle,
  children
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-md"
      style={{ fontSize: 12 }}
    >
      <p className="font-semibold text-foreground">{title}</p>
      {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      <div className={subtitle || children ? "mt-2 space-y-1" : undefined}>{children}</div>
    </div>
  );
}

export function ChartTooltipRow({
  label,
  value
}: {
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <p className="flex items-center justify-between gap-4 text-muted-foreground">
      <span>{label}</span>
      <span className="font-mono font-semibold text-foreground">{value}</span>
    </p>
  );
}
