import { useTranslation } from 'react-i18next';
import {
  Fingerprint,
  ArrowLeftRight,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Languages,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [Fingerprint, ArrowLeftRight, BrainCircuit, BarChart3, ShieldCheck, Languages];

interface Benefit {
  title: string;
  description: string;
}

export function BenefitsSection() {
  const { t } = useTranslation('marketing');
  const items = t('benefits.items', { returnObjects: true }) as Benefit[];

  return (
    <section id="benefits" className="scroll-mt-20 bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('benefits.eyebrow')}
          title={t('benefits.title')}
          subtitle={t('benefits.subtitle')}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b, i) => {
            const Icon = ICONS[i] ?? Fingerprint;
            return (
              <Reveal key={b.title} delay={(i % 3) * 0.08}>
                <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
