import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Reveal } from './primitives/reveal';

export function CtaSection() {
  const { t } = useTranslation('marketing');
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user?.role === 'PATIENT' ? '/portal/home' : '/dashboard';

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('cta.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">{t('cta.subtitle')}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
                <Link to={isAuthenticated ? dashboardPath : '/login'}>
                  {isAuthenticated ? t('nav.dashboard') : t('cta.primary')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <a href="#contact">{t('cta.secondary')}</a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
