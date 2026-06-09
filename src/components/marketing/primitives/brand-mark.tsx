import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  /** Hide the wordmark text and show only the logo glyph. */
  iconOnly?: boolean;
}

/** Gradient logo glyph + wordmark, shared by the nav and footer. */
export function BrandMark({ className, iconOnly = false }: BrandMarkProps) {
  const { t } = useTranslation('marketing');
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm"
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
          <path
            d="M16 5c5 3.5 8 4 8 4v6c0 5.5-4 8-8 9-4-1-8-3.5-8-9V9s3-.5 8-4z"
            fill="currentColor"
            opacity="0.95"
          />
          <path d="M14 11h4v3h3v4h-3v3h-4v-3h-3v-4h3z" className="fill-primary" />
        </svg>
      </span>
      {!iconOnly && (
        <span className="text-base font-bold tracking-tight text-foreground">{t('brand.short')}</span>
      )}
    </span>
  );
}
