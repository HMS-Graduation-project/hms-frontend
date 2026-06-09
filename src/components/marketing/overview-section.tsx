import { useTranslation } from 'react-i18next';
import { FileHeart, Network, Landmark, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [FileHeart, Network, Landmark];

interface Pillar {
  title: string;
  description: string;
}

export function OverviewSection() {
  const { t } = useTranslation('marketing');
  const pillars = t('overview.pillars', { returnObjects: true }) as Pillar[];

  return (
    <section id="overview" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('overview.eyebrow')}
          title={t('overview.title')}
          subtitle={t('overview.subtitle')}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = ICONS[i] ?? FileHeart;
            return (
              <Reveal key={p.title} delay={i * 0.08}>
                <Card className="h-full border-border/70 transition-all hover:border-primary/40 hover:shadow-lg">
                  <CardContent className="p-6">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
