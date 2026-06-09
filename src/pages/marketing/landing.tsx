import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { HeroSection } from '@/components/marketing/hero-section';
import { GovernorateBand } from '@/components/marketing/governorate-band';
import { OverviewSection } from '@/components/marketing/overview-section';
import { BenefitsSection } from '@/components/marketing/benefits-section';
import { ModulesSection } from '@/components/marketing/modules-section';
import { WorkflowSection } from '@/components/marketing/workflow-section';
import { VisionSection } from '@/components/marketing/vision-section';
import { SyriaMapSection } from '@/components/marketing/syria-map-section';
import { StatsSection } from '@/components/marketing/stats-section';
import { AiSection } from '@/components/marketing/ai-section';
import { ProductTourSection } from '@/components/marketing/product-tour-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { SecuritySection } from '@/components/marketing/security-section';
import { FutureVisionSection } from '@/components/marketing/future-vision-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { ContactSection } from '@/components/marketing/contact-section';
import { SITE_URL, buildStructuredData } from '@/lib/marketing/seo';

export default function LandingPage() {
  const { t, i18n } = useTranslation('marketing');
  const lang = (i18n.language || 'en').split('-')[0];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const canonical = `${SITE_URL}/`;
  const ogImage = `${SITE_URL}/og-image.svg`;
  const jsonLd = JSON.stringify(buildStructuredData(t, lang));

  return (
    <>
      <Helmet>
        <html lang={lang} dir={dir} />
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={t('brand.name')} />
        <meta property="og:title" content={t('meta.ogTitle')} />
        <meta property="og:description" content={t('meta.ogDescription')} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:locale" content={lang} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('meta.ogTitle')} />
        <meta name="twitter:description" content={t('meta.ogDescription')} />
        <meta name="twitter:image" content={ogImage} />

        <link rel="alternate" hrefLang="en" href={canonical} />
        <link rel="alternate" hrefLang="ar" href={canonical} />
        <link rel="alternate" hrefLang="tr" href={canonical} />
        <link rel="alternate" hrefLang="x-default" href={canonical} />

        <script type="application/ld+json">{jsonLd}</script>
      </Helmet>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {t('nav.skip')}
      </a>

      <div className="flex min-h-screen flex-col bg-background">
        <MarketingNav />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <HeroSection />
          <GovernorateBand />
          <OverviewSection />
          <BenefitsSection />
          <ModulesSection />
          <WorkflowSection />
          <VisionSection />
          <SyriaMapSection />
          <StatsSection />
          <AiSection />
          <ProductTourSection />
          <CtaSection />
          <SecuritySection />
          <FutureVisionSection />
          <FaqSection />
          <ContactSection />
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}
