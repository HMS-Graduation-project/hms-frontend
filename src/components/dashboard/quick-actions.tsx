import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, UserPlus, BarChart3 } from 'lucide-react';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: string[];
}

const actions: QuickAction[] = [
  {
    label: 'newAppointment',
    icon: CalendarDays,
    href: '/appointments',
    roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT'],
  },
  {
    label: 'registerPatient',
    icon: UserPlus,
    href: '/patients',
    roles: ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'],
  },
  {
    label: 'viewReports',
    icon: BarChart3,
    href: '/analytics',
    roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  },
];

export function QuickActions() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const userRole = user?.role ?? '';

  const visibleActions = actions.filter((action) =>
    action.roles.includes(userRole)
  );

  if (visibleActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.label} variant="outline" asChild>
                <Link to={action.href} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {t(action.label)}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
