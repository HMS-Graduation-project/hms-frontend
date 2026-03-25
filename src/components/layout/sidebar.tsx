import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeft, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { navigationItems, type NavItem } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function filterNavItems(items: NavItem[], userRole: string | undefined): NavItem[] {
  if (!userRole) return [];
  return items.filter(
    (item) => item.roles.includes('*') || item.roles.includes(userRole)
  );
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();

  const visibleItems = filterNavItems(navigationItems, user?.role);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:flex',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b px-4',
          isOpen ? 'justify-start gap-3' : 'justify-center'
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">
              {tCommon('appName')}
            </span>
            <span className="text-xs text-muted-foreground">
              {tCommon('appFullName')}
            </span>
          </div>
        )}
      </div>

      {/* Navigation items */}
      <ScrollArea className="flex-1 py-2">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-1 px-2">
            {visibleItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== '/dashboard' &&
                  location.pathname.startsWith(item.href));
              const Icon = item.icon;

              return isOpen ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{t(item.label)}</span>
                </Link>
              ) : (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{t(item.label)}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {t(item.label)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Collapse toggle */}
      <Separator />
      <div className="flex shrink-0 items-center justify-center p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="h-9 w-9 text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          {isOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}
