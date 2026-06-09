import { useTranslation } from 'react-i18next';
import { MapPin, LayoutGrid, UsersRound, BrainCircuit, Languages, HeartPulse, type LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './primitives/animated-counter';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [MapPin, LayoutGrid, UsersRound, BrainCircuit, Languages, HeartPulse];

interface Stat {
  value: number;
  suffix?: string;
  label: string;
  description: string;
}

export function StatsSection() {
  const { t } = useTranslation('marketing');
  const items = t('stats.items', { returnObjects: true }) as Stat[];

  return (
    <section id="stats" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground sm:p-12">
          {/* Decorative rings */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -end-16 -top-16 h-72 w-72 rounded-full border border-white/40" />
            <div className="absolute -end-4 -top-4 h-72 w-72 rounded-full border border-white/30" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {t('stats.eyebrow')}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t('stats.title')}</h2>
            <p className="mt-3 text-pretty text-sm text-primary-foreground/80 sm:text-base">
              {t('stats.subtitle')}
            </p>
          </div>

          <dl className="relative mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {items.map((s, i) => {
              const Icon = ICONS[i] ?? MapPin;
              return (
                <Reveal key={s.label} delay={(i % 3) * 0.08} className="text-center">
                  <Icon aria-hidden="true" className="mx-auto h-6 w-6 text-white/70" />
                  <dd className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </dd>
                  <dt className="mt-2 text-sm font-semibold">{s.label}</dt>
                  <dd className="mt-1 text-xs text-primary-foreground/70">{s.description}</dd>
                </Reveal>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
