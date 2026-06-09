import { useTranslation } from 'react-i18next';
import {
  KeyRound,
  Building2,
  Handshake,
  History,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

const ICONS: LucideIcon[] = [KeyRound, Building2, Handshake, History, LockKeyhole, ShieldCheck];

interface SecurityItem {
  title: string;
  description: string;
}

export function SecuritySection() {
  const { t } = useTranslation('marketing');
  const items = t('security.items', { returnObjects: true }) as SecurityItem[];

  return (
    <section id="security" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8">
        <div>
          <SectionHeading
            eyebrow={t('security.eyebrow')}
            title={t('security.title')}
            subtitle={t('security.subtitle')}
            align="start"
          />
          <Reveal delay={0.15}>
            <div className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8">
              <ShieldCheck className="h-20 w-20 text-primary" strokeWidth={1.5} />
            </div>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = ICONS[i] ?? ShieldCheck;
            return (
              <Reveal key={item.title} delay={(i % 2) * 0.08}>
                <div className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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
