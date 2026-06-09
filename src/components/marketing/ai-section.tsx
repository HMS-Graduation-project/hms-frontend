import { useTranslation } from 'react-i18next';
import { ScanLine, ListChecks, ShieldAlert, AlertTriangle, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';
import { AppPreview } from './primitives/app-preview';

const ICONS: LucideIcon[] = [ScanLine, ListChecks, ShieldAlert];

interface AiItem {
  tag: string;
  title: string;
  description: string;
}

export function AiSection() {
  const { t } = useTranslation('marketing');
  const items = t('ai.items', { returnObjects: true }) as AiItem[];

  return (
    <section id="ai" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t('ai.eyebrow')} title={t('ai.title')} subtitle={t('ai.subtitle')} />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <Reveal from="right">
            <AppPreview variant="ai" />
          </Reveal>

          <ul className="space-y-4">
            {items.map((item, i) => {
              const Icon = ICONS[i] ?? ScanLine;
              return (
                <Reveal as="li" key={item.title} delay={i * 0.08}>
                  <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>

        <Reveal>
          <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm leading-relaxed text-foreground">{t('ai.disclaimer')}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
