import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeading } from './primitives/section-heading';
import { Reveal } from './primitives/reveal';

interface Faq {
  q: string;
  a: string;
}

export function FaqSection() {
  const { t } = useTranslation('marketing');
  const items = t('faq.items', { returnObjects: true }) as Faq[];

  return (
    <section id="faq" className="scroll-mt-20 bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} subtitle={t('faq.subtitle')} />

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
