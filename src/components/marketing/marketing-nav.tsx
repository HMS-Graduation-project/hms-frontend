import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { BrandMark } from './primitives/brand-mark';

const SECTIONS = ['overview', 'modules', 'workflow', 'network', 'ai', 'security', 'faq', 'contact'] as const;

export function MarketingNav() {
  const { t } = useTranslation('marketing');
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('');
  const [open, setOpen] = useState(false);

  const dashboardPath = user?.role === 'PATIENT' ? '/portal/home' : '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const primaryCta = isAuthenticated ? (
    <Button asChild size="sm">
      <Link to={dashboardPath}>{t('nav.dashboard')}</Link>
    </Button>
  ) : (
    <Button asChild size="sm">
      <Link to="/login">{t('nav.login')}</Link>
    </Button>
  );

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={t('brand.name')}>
          <BrandMark />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active === id ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {t(`nav.${id}`)}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="ms-2">{primaryCta}</div>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('nav.openMenu')}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">{t('brand.name')}</SheetTitle>
              <div className="mb-6 mt-2">
                <BrandMark />
              </div>
              <ul className="flex flex-col gap-1">
                {SECTIONS.map((id) => (
                  <li key={id}>
                    <SheetClose asChild>
                      <a
                        href={`#${id}`}
                        className="block rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        {t(`nav.${id}`)}
                      </a>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-2">
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link to={dashboardPath}>{t('nav.dashboard')}</Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link to="/login">{t('nav.login')}</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/register">{t('nav.register')}</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
