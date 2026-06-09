import type { TFunction } from 'i18next';

/** Canonical public origin for the marketing site. */
export const SITE_URL = 'https://snhhmp.com';

interface Faq {
  q: string;
  a: string;
}

/**
 * Build a schema.org @graph for the landing page: Organization, WebSite,
 * SoftwareApplication, and FAQPage. `t` must be bound to the `marketing` namespace.
 */
export function buildStructuredData(t: TFunction, lang: string) {
  const name = t('brand.name');
  const description = t('meta.description');
  const email = t('contact.email');
  const faqs = t('faq.items', { returnObjects: true }) as Faq[];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
        email,
        description,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name,
        inLanguage: lang,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        name,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}
