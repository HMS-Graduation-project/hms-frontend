import { useTranslation } from 'react-i18next';
import { MessageSquareText, Cpu, TrendingUp, Plug, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [MessageSquareText, Cpu, TrendingUp, Plug];

interface FutureItem {
  title: string;
  description: string;
}

export function FutureVisionSection() {
  const { t } = useTranslation('marketing');
  const items = t('future.items', { returnObjects: true }) as FutureItem[];

  return (
    <section id="future" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('future.eyebrow')}
          title={t('future.title')}
          subtitle={t('future.subtitle')}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICONS[i] ?? MessageSquareText;
            return (
              <Reveal key={item.title} delay={(i % 4) * 0.08}>
                <div className="h-full rounded-xl border border-dashed border-border bg-card/50 p-6 transition-colors hover:border-primary/40">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
