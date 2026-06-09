import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Network } from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

// The map (and its GeoJSON parsing) loads only when this section is reached.
const SyriaMap = lazy(() =>
  import('./primitives/syria-map').then((m) => ({ default: m.SyriaMap })),
);

export function SyriaMapSection() {
  const { t } = useTranslation('marketing');

  return (
    <section id="network" className="scroll-mt-20 bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading
            eyebrow={t('network.eyebrow')}
            title={t('network.title')}
            subtitle={t('network.subtitle')}
            align="start"
          />
          <Reveal delay={0.15}>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <Network className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-foreground">{t('network.legend')}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} from="left">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
            <Suspense
              fallback={<div className="aspect-[8/7] w-full animate-pulse rounded-xl bg-muted" />}
            >
              <SyriaMap />
            </Suspense>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
