import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Reveal } from './primitives/reveal';

export function ContactSection() {
  const { t } = useTranslation('marketing');
  const { isAuthenticated, user } = useAuth();
  const email = t('contact.email');
  const dashboardPath = user?.role === 'PATIENT' ? '/portal/home' : '/dashboard';

  return (
    <section id="contact" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-15">
              <div className="absolute -start-10 -top-10 h-60 w-60 rounded-full border border-white/40" />
              <div className="absolute -end-10 bottom-0 h-72 w-72 rounded-full border border-white/30" />
            </div>

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {t('contact.eyebrow')}
              </span>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                {t('contact.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/85">
                {t('contact.subtitle')}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:w-auto"
                >
                  <Mail className="h-4 w-4" />
                  {t('contact.emailLabel')}
                </a>
                {isAuthenticated ? (
                  <Link
                    to={dashboardPath}
                    className="inline-flex h-11 w-full items-center justify-center rounded-md border border-white/60 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:w-auto"
                  >
                    {t('nav.dashboard')}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex h-11 w-full items-center justify-center rounded-md border border-white/60 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:w-auto"
                    >
                      {t('contact.ctaPrimary')}
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex h-11 w-full items-center justify-center rounded-md px-6 text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:underline sm:w-auto"
                    >
                      {t('contact.ctaSecondary')}
                    </Link>
                  </>
                )}
              </div>

              <a
                href={`mailto:${email}`}
                className="mt-6 inline-block text-sm text-primary-foreground/80 underline-offset-4 hover:underline"
              >
                {email}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
