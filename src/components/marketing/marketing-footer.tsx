import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { BrandMark } from './primitives/brand-mark';

const PLATFORM_LINKS = ['overview', 'modules', 'workflow', 'ai', 'security'] as const;
const NETWORK_LINKS = ['network', 'faq', 'contact'] as const;

export function MarketingFooter() {
  const { t } = useTranslation('marketing');
  const { isAuthenticated, user } = useAuth();
  const year = new Date().getFullYear();
  const dashboardPath = user?.role === 'PATIENT' ? '/portal/home' : '/dashboard';

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <BrandMark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t('footer.tagline')}
            </p>
            <p className="mt-3 text-xs font-medium text-primary">{t('footer.builtFor')}</p>
          </div>

          <nav aria-label={t('footer.product')}>
            <h2 className="text-sm font-semibold text-foreground">{t('footer.product')}</h2>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_LINKS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {t(`nav.${id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.company')}>
            <h2 className="text-sm font-semibold text-foreground">{t('footer.company')}</h2>
            <ul className="mt-4 space-y-2.5">
              {NETWORK_LINKS.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {t(`nav.${id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.account')}>
            <h2 className="text-sm font-semibold text-foreground">{t('footer.account')}</h2>
            <ul className="mt-4 space-y-2.5">
              {isAuthenticated ? (
                <li>
                  <Link to={dashboardPath} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {t('nav.dashboard')}
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {t('nav.login')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {t('nav.register')}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <a
                  href={`mailto:${t('contact.email')}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('contact.email')}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {t('brand.name')}. {t('footer.rights')}
          </p>
          <p className="max-w-md sm:text-end">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
