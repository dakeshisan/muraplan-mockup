import { AlertTriangle, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

/**
 * Тонкая полоска состояния источника данных: какой источник, когда
 * последний синк, кнопка повтора. Не красный экран — просто честная
 * плашка над реестром/дашбордом.
 */
export function SourceStatus({
  source,
  syncedAt,
  stale,
  onRetry,
}: {
  source: string;
  syncedAt: string;
  stale?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-md border px-3 py-1.5 text-[11px] ${
        stale
          ? "border-accent/40 bg-accent/10 text-accent-foreground"
          : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      {stale ? (
        <AlertTriangle className="h-3.5 w-3.5" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      )}
      <span className="font-semibold text-foreground">Источник · {source}</span>
      <span aria-hidden>·</span>
      <span>синк {syncedAt}</span>
      {stale && <span className="font-semibold">данные могут быть неактуальны</span>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-foreground hover:border-primary"
        >
          <RefreshCw className="h-3 w-3" />
          Повторить
        </button>
      )}
    </div>
  );
}

/**
 * «Победа» — пустое состояние в мажорной тональности.
 */
export function EmptyVictory({
  title,
  next,
  hint,
  action,
}: {
  title: string;
  next?: string;
  hint?: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success/15 text-success">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <p className="text-sm font-extrabold text-foreground">{title}</p>
      {next && (
        <p className="text-[12px] text-muted-foreground">
          Следующее: <span className="font-semibold text-foreground">{next}</span>
        </p>
      )}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
      {action && (
        <Link
          to={action.to}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-bold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

/**
 * Skeleton-строки под форму реального контента очередей/реестров.
 */
export function QueueSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/60" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-6 w-20 shrink-0 animate-pulse rounded-lg bg-muted" />
        </li>
      ))}
    </ul>
  );
}
