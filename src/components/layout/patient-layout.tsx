import { Link, NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  CalendarDays,
  Pill,
  FlaskConical,
  Receipt,
  ArrowLeftRight,
  HeartPulse,
  User as UserIcon,
  LogOut,
  Building2,
  Activity,
  Menu,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { usePortalProfile } from '@/hooks/use-portal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PageLoading } from '@/components/page-loading';

interface PortalNavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PORTAL_NAV: PortalNavItem[] = [
  { href: '/portal/home', labelKey: 'home', icon: Home },
  { href: '/portal/appointments', labelKey: 'appointments', icon: CalendarDays },
  { href: '/portal/records', labelKey: 'records', icon: HeartPulse },
  { href: '/portal/prescriptions', labelKey: 'prescriptions', icon: Pill },
  { href: '/portal/lab-results', labelKey: 'labResults', icon: FlaskConical },
  { href: '/portal/invoices', labelKey: 'invoices', icon: Receipt },
  { href: '/portal/referrals', labelKey: 'referrals', icon: ArrowLeftRight },
  { href: '/portal/profile', labelKey: 'profile', icon: UserIcon },
];

function PortalNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation('portal');

  return (
    <nav className="flex flex-col gap-1 px-2">
      {PORTAL_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{t(`nav.${item.labelKey}`)}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

function MyHospitals() {
  const { t } = useTranslation('portal');
  const { data, isLoading } = usePortalProfile();

  if (isLoading || !data) return null;

  return (
    <div className="border-t px-4 py-4">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        {t('myHospitals')}
      </h3>
      <ul className="space-y-1.5">
        {data.hospitals.map((h) => (
          <li
            key={h.profileId}
            className="text-xs leading-tight text-foreground/80"
          >
            <span className="font-medium">{h.hospital.name}</span>
            {h.hospital.city?.name && (
              <span className="text-muted-foreground">
                {' · '}
                {h.hospital.city.name}
              </span>
            )}
          </li>
        ))}
        {data.hospitals.length === 0 && (
          <li className="text-xs text-muted-foreground">
            {t('noHospitalsYet')}
          </li>
        )}
      </ul>
    </div>
  );
}

export function PatientLayout() {
  const { t } = useTranslation('portal');
  const { t: tCommon } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Staff users do not belong in the portal — send them to the staff dashboard.
  if (user && user.role !== 'PATIENT') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">
              {tCommon('appName')}
            </span>
            <span className="text-xs text-muted-foreground">{t('portal')}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <PortalNav />
        </div>
        <MyHospitals />
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:ms-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-3 border-b px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{tCommon('appName')}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('portal')}
                  </span>
                </div>
              </div>
              <div className="py-3">
                <PortalNav onNavigate={() => setMobileOpen(false)} />
              </div>
              <MyHospitals />
            </SheetContent>
          </Sheet>

          <Badge variant="secondary" className="hidden items-center gap-1.5 sm:inline-flex">
            <HeartPulse className="h-3.5 w-3.5" />
            <span className="text-xs">{t('patientPortal')}</span>
          </Badge>

          <div className="flex-1" />

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              to="/portal/profile"
              className="hidden rounded-full bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/70 sm:inline-block"
            >
              {user?.email?.split('@')[0]}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              aria-label={tAuth('signOut')}
            >
              <LogOut className="me-1 h-4 w-4" />
              <span className="hidden sm:inline">{tAuth('signOut')}</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          <Suspense fallback={<PageLoading variant="skeleton" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
