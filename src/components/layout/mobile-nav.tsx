import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { navigationItems, type NavItem } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function filterNavItems(items: NavItem[], userRole: string | undefined): NavItem[] {
  if (!userRole) return [];
  return items.filter(
    (item) => item.roles.includes('*') || item.roles.includes(userRole)
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();

  const visibleItems = filterNavItems(navigationItems, user?.role);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold tracking-tight">
                  {tCommon('appName')}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {tCommon('appFullName')}
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-5rem)]">
            <nav className="flex flex-col gap-1 p-4">
              {visibleItems.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{t(item.label)}</span>
                  </Link>
                );
              })}

              <Separator className="my-2" />

              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role
                    ? tCommon(`roles.${user.role}`, { defaultValue: user.role })
                    : ''}
                </p>
              </div>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
