import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Siren,
  BedDouble,
  ClipboardList,
  FlaskConical,
  Pill,
  ScrollText,
  Receipt,
  Shuffle,
  UsersRound,
  ScanLine,
  PieChart,
  Smartphone,
  Bell,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [
  CalendarDays,
  Siren,
  BedDouble,
  ClipboardList,
  FlaskConical,
  Pill,
  ScrollText,
  Receipt,
  Shuffle,
  UsersRound,
  ScanLine,
  PieChart,
  Smartphone,
  Bell,
  Lock,
];

interface Module {
  title: string;
  description: string;
}

export function ModulesSection() {
  const { t } = useTranslation('marketing');
  const items = t('modules.items', { returnObjects: true }) as Module[];

  return (
    <section id="modules" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('modules.eyebrow')}
          title={t('modules.title')}
          subtitle={t('modules.subtitle')}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m, i) => {
            const Icon = ICONS[i] ?? CalendarDays;
            return (
              <Reveal key={m.title} delay={(i % 3) * 0.06}>
                <div className="flex h-full items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
