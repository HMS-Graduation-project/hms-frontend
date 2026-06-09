import { useTranslation } from 'react-i18next';
import { Landmark, MapPinned, Building2, HeartPulse, ChevronRight, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [Landmark, MapPinned, Building2, HeartPulse];

interface Tier {
  level: string;
  title: string;
  description: string;
}

export function VisionSection() {
  const { t } = useTranslation('marketing');
  const tiers = t('vision.tiers', { returnObjects: true }) as Tier[];

  return (
    <section id="vision" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('vision.eyebrow')}
          title={t('vision.title')}
          subtitle={t('vision.subtitle')}
        />

        <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {tiers.map((tier, i) => {
            const Icon = ICONS[i] ?? Landmark;
            return (
              <div key={tier.title} className="contents">
                <Reveal delay={i * 0.1}>
                  <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {tier.level}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{tier.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
                  </div>
                </Reveal>
                {i < tiers.length - 1 && (
                  <div aria-hidden="true" className="hidden items-center justify-center lg:flex">
                    <ChevronRight className="h-6 w-6 text-muted-foreground/50 rtl:rotate-180" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
