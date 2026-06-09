import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'start';
  className?: string;
}

/**
 * Consistent section header: small uppercase eyebrow, an H2 title, and an
 * optional lead paragraph. Used by every marketing section.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-start',
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
