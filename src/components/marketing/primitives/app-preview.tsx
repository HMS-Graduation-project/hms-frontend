import { cn } from '@/lib/utils';

export type PreviewVariant = 'dashboard' | 'triage' | 'ai' | 'reporting';

interface AppPreviewProps {
  variant?: PreviewVariant;
  className?: string;
}

/**
 * Lightweight, theme-aware faux product screenshot built entirely from divs
 * (no images). Used as the hero visual and the product-tour mockups so the
 * marketing site looks like real software without shipping heavy assets.
 */
export function AppPreview({ variant = 'dashboard', className }: AppPreviewProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5',
        className,
      )}
      aria-hidden="true"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ms-3 hidden h-5 flex-1 rounded-md bg-background/60 sm:block" />
      </div>

      <div className="flex">
        {/* Mini sidebar */}
        <div className="hidden w-12 shrink-0 flex-col items-center gap-3 border-e border-border bg-muted/20 py-4 sm:flex">
          <span className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent" />
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={cn('h-5 w-5 rounded-md', i === 1 ? 'bg-primary/30' : 'bg-muted')} />
          ))}
        </div>

        <div className="min-w-0 flex-1 p-4">{renderBody(variant)}</div>
      </div>
    </div>
  );
}

function renderBody(variant: PreviewVariant) {
  switch (variant) {
    case 'triage':
      return <TriageBody />;
    case 'ai':
      return <AiBody />;
    case 'reporting':
      return <ReportingBody />;
    default:
      return <DashboardBody />;
  }
}

function Bar({ h, color = 'bg-primary' }: { h: number; color?: string }) {
  return <span className={cn('w-full rounded-sm', color)} style={{ height: `${h}%` }} />;
}

function DashboardBody() {
  const tiles = [
    { v: '1,060', c: 'text-primary' },
    { v: '263', c: 'text-secondary' },
    { v: '440', c: 'text-accent' },
    { v: '778', c: 'text-foreground' },
  ];
  const bars = [40, 65, 50, 80, 60, 95, 72];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="h-3 w-24 rounded bg-foreground/80" />
        <span className="h-6 w-16 rounded-md bg-primary/20" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((t, i) => (
          <div key={i} className="rounded-lg border border-border bg-background p-3">
            <span className={cn('block text-base font-bold sm:text-lg', t.c)}>{t.v}</span>
            <span className="mt-1 block h-1.5 w-10 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-background p-3">
        <span className="mb-2 block h-2 w-20 rounded bg-muted" />
        <div className="flex h-24 items-end gap-1.5">
          {bars.map((h, i) => (
            <Bar key={i} h={h} color={i === 5 ? 'bg-accent' : 'bg-primary/70'} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TriageBody() {
  const rows = [
    'border-l-destructive bg-destructive/5',
    'border-l-warning bg-warning/5',
    'border-l-warning bg-warning/5',
    'border-l-info bg-info/5',
    'border-l-success bg-success/5',
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="h-3 w-28 rounded bg-foreground/80" />
        <span className="h-6 w-20 rounded-md bg-destructive/20" />
      </div>
      <div className="space-y-2">
        {rows.map((c, i) => (
          <div key={i} className={cn('flex items-center gap-3 rounded-md border border-border border-l-4 p-2.5 rtl:border-l-0 rtl:border-r-4', c)}>
            <span className="h-7 w-7 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <span className="block h-2 w-2/3 rounded bg-foreground/30" />
              <span className="block h-2 w-1/3 rounded bg-muted" />
            </div>
            <span className="h-5 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AiBody() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-950">
        {/* faux ribcage lines */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 h-px w-3/4 -translate-x-1/2 rounded-full bg-white/40"
              style={{ top: `${20 + i * 11}%`, transform: `translateX(-50%) rotate(${i % 2 ? 6 : -6}deg)` }}
            />
          ))}
        </div>
        {/* heatmap blob */}
        <span className="absolute left-[58%] top-[46%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-500/70 to-amber-400/40 blur-md" />
      </div>
      <div className="space-y-3">
        <span className="inline-block h-6 w-24 rounded-full bg-destructive/15" />
        <span className="block h-3 w-3/4 rounded bg-foreground/70" />
        <div>
          <span className="mb-1 block h-2 w-16 rounded bg-muted" />
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <span className="block h-full w-[88%] rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>
        </div>
        <span className="block h-2 w-full rounded bg-muted" />
        <span className="block h-2 w-5/6 rounded bg-muted" />
        <span className="mt-2 inline-block h-7 w-24 rounded-md bg-primary/20" />
      </div>
    </div>
  );
}

function ReportingBody() {
  const pts = [30, 45, 38, 60, 52, 72, 68, 85];
  const max = 100;
  const w = 220;
  const h = 90;
  const step = w / (pts.length - 1);
  const line = pts.map((p, i) => `${i * step},${h - (p / max) * h}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="h-3 w-28 rounded bg-foreground/80" />
        <span className="h-6 w-16 rounded-md bg-secondary/20" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <span className="block text-lg font-bold text-primary">96%</span>
          <span className="mt-1 block h-1.5 w-12 rounded bg-muted" />
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <span className="block text-lg font-bold text-accent">22</span>
          <span className="mt-1 block h-1.5 w-12 rounded bg-muted" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-background p-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
          <defs>
            <linearGradient id="rep-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#rep-area)" />
          <polyline points={line} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
