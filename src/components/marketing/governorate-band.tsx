import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

export function GovernorateBand() {
  const { t } = useTranslation('marketing');
  const governorates = t('governorates', { returnObjects: true }) as string[];
  // Duplicate the list so the marquee can loop seamlessly (-50% translate).
  const loop = [...governorates, ...governorates];

  return (
    <section aria-label={t('band.title')} className="border-y border-border bg-muted/30 py-6">
      <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {t('band.title')}
      </p>
      <div className="marquee-pause relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="animate-marquee flex w-max items-center gap-3 px-3">
          {loop.map((g, i) => (
            <li
              key={`${g}-${i}`}
              aria-hidden={i >= governorates.length}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {g}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
