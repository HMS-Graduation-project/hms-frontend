import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { Users, Stethoscope, CalendarDays, FlaskConical } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentAppointments } from '@/components/dashboard/recent-appointments';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}, {user?.email ?? ''}
        </p>
      </div>

      {/* Stat cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('totalPatients')}
          value="1,234"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t('totalDoctors')}
          value="48"
          icon={Stethoscope}
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title={t('todayAppointments')}
          value="12"
          icon={CalendarDays}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title={t('pendingLabResults')}
          value="7"
          icon={FlaskConical}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Appointments */}
      <RecentAppointments />
    </div>
  );
}
