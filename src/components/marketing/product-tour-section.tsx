import { useTranslation } from 'react-i18next';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';
import { AppPreview, type PreviewVariant } from './primitives/app-preview';

const VARIANTS: PreviewVariant[] = ['dashboard', 'triage', 'ai', 'reporting'];

interface Shot {
  title: string;
  description: string;
}

export function ProductTourSection() {
  const { t } = useTranslation('marketing');
  const shots = t('tour.shots', { returnObjects: true }) as Shot[];

  return (
    <section id="tour" className="scroll-mt-20 bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t('tour.eyebrow')} title={t('tour.title')} subtitle={t('tour.subtitle')} />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {shots.map((shot, i) => (
            <Reveal key={shot.title} delay={(i % 2) * 0.1}>
              <figure className="flex h-full flex-col">
                <AppPreview variant={VARIANTS[i] ?? 'dashboard'} />
                <figcaption className="mt-4">
                  <h3 className="font-semibold text-foreground">{shot.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{shot.description}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
