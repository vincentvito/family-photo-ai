import clsx from "clsx";

export function AnalyticsTrendPanel({
  eyebrow,
  value,
  previous,
  comparison,
  children,
}: {
  eyebrow: string;
  value: number;
  previous: number;
  comparison: string;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-5 pt-5 pb-3 shadow-[var(--shadow-sm)] sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="small-caps text-[color:var(--color-ink-muted)]">{eyebrow}</div>
          <div className="mt-2 text-4xl font-semibold tabular-nums tracking-[-0.035em]">
            {value.toLocaleString()}
          </div>
        </div>
        <TrendDelta current={value} previous={previous} label={comparison} />
      </div>
      {children}
    </article>
  );
}

export function AnalyticsMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.68rem] font-semibold tracking-[0.12em] text-[color:var(--color-plum-soft)] uppercase">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-[color:var(--color-bg)]">
        {value}
      </div>
    </div>
  );
}

export function TrendDelta({
  current,
  previous,
  label,
  dark = false,
}: {
  current: number;
  previous: number;
  label: string;
  dark?: boolean;
}) {
  const delta = previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
  const positive = delta !== null && delta >= 0;
  const valueClass =
    delta === null
      ? "text-[color:var(--color-ink-faint)]"
      : dark
        ? positive
          ? "text-[color:var(--color-sage-soft)]"
          : "text-[color:var(--color-coral-soft)]"
        : positive
          ? "text-[color:var(--color-sage-deep)]"
          : "text-[color:var(--color-coral-deep)]";

  return (
    <div className="text-right text-xs">
      <div className={clsx("font-semibold tabular-nums", valueClass)}>
        {delta === null ? "No prior baseline" : `${positive ? "+" : ""}${delta}%`}
      </div>
      <div
        className={clsx(
          "mt-0.5",
          dark ? "text-[color:var(--color-plum-soft)]" : "text-[color:var(--color-ink-faint)]",
        )}
      >
        {label}
      </div>
    </div>
  );
}
