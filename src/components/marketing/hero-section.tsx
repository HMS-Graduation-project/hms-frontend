import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { AppPreview } from './primitives/app-preview';

interface HeroStat {
  value: string;
  label: string;
}

export function HeroSection() {
  const { t } = useTranslation('marketing');
  const { isAuthenticated, user } = useAuth();
  const reduce = useReducedMotion();

  const title = t('hero.title');
  const highlight = t('hero.highlight');
  const [before, after] = title.split('{{highlight}}');
  const stats = t('hero.stats', { returnObjects: true }) as HeroStat[];
  const dashboardPath = user?.role === 'PATIENT' ? '/portal/home' : '/dashboard';

  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 end-[-10%] h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 start-[-10%] h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div className="text-center lg:text-start">
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t('hero.badge')}
          </motion.span>

          <motion.h1
            {...rise(0.08)}
            className="mt-5 text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {before}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {highlight}
            </span>
            {after}
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            {...rise(0.24)}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <a href="#overview">
                {t('hero.ctaPrimary')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to={isAuthenticated ? dashboardPath : '/login'}>
                {isAuthenticated ? t('nav.dashboard') : t('hero.ctaSecondary')}
              </Link>
            </Button>
          </motion.div>

          <motion.dl
            {...rise(0.32)}
            className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center lg:text-start">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-bold text-foreground sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Hero visual */}
        <motion.div
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.2 } }
            : {
                initial: { opacity: 0, scale: 0.96, y: 20 },
                animate: { opacity: 1, scale: 1, y: 0 },
                transition: { duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const },
              })}
          className="relative"
        >
          <AppPreview variant="dashboard" />
          <div className="absolute -bottom-4 -start-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:flex">
            <ShieldCheck className="h-5 w-5 text-success" />
            <span className="text-xs font-medium text-foreground">{t('security.eyebrow')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
