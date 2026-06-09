import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Activity,
  TestTubes,
  Tablets,
  CreditCard,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Activity,
  TestTubes,
  Tablets,
  CreditCard,
  Send,
];

interface Step {
  title: string;
  description: string;
}

export function WorkflowSection() {
  const { t } = useTranslation('marketing');
  const steps = t('workflow.steps', { returnObjects: true }) as Step[];

  return (
    <section id="workflow" className="scroll-mt-20 bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('workflow.eyebrow')}
          title={t('workflow.title')}
          subtitle={t('workflow.subtitle')}
        />

        <ol className="relative mx-auto mt-14 max-w-3xl">
          {/* Connecting line */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 top-6 start-[22px] w-px bg-gradient-to-b from-primary via-accent to-primary/30"
          />
          {steps.map((s, i) => {
            const Icon = ICONS[i] ?? UserPlus;
            return (
              <li key={s.title} className="relative mb-8 last:mb-0 ps-16">
                <Reveal delay={Math.min(i * 0.06, 0.3)}>
                  <span className="absolute start-0 top-0 grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-background text-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-semibold text-foreground">{s.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
