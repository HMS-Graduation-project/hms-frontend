import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { TriageLevel } from '@/hooks/use-emergency';

export const triageRowClassMap: Record<TriageLevel, string> = {
  RED: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
  ORANGE:
    'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30',
  YELLOW:
    'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
  GREEN:
    'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
  BLUE: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
};

const triagePillClassMap: Record<TriageLevel, string> = {
  RED: 'bg-red-600 text-white ring-red-700',
  ORANGE: 'bg-orange-500 text-white ring-orange-600',
  YELLOW: 'bg-yellow-400 text-yellow-950 ring-yellow-500',
  GREEN: 'bg-green-600 text-white ring-green-700',
  BLUE: 'bg-blue-600 text-white ring-blue-700',
};

interface TriageBadgeProps {
  level: TriageLevel | null;
  className?: string;
}

export function TriageBadge({ level, className }: TriageBadgeProps) {
  const { t } = useTranslation('emergency');

  if (!level) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border border-dashed border-muted-foreground/40 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground',
          className,
        )}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ring-1',
        triagePillClassMap[level],
        className,
      )}
    >
      {t(`triage.${level}`)}
    </span>
  );
}
