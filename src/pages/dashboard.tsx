import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { Users, Stethoscope, CalendarDays, FlaskConical } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentAppointments } from '@/components/dashboard/recent-appointments';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/use-analytics';

export default function DashboardPage() {
  const { user } = useAuth();

  // National/regional roles get their own dashboards — the hospital dashboard
  // is not meaningful for them (no hospitalId scope).
  if (user?.role === 'MINISTRY_ADMIN') {
    return <Navigate to="/ministry" replace />;
  }
  if (user?.role === 'REGIONAL_ADMIN') {
    return <Navigate to="/regional" replace />;
  }

  return <HospitalDashboard />;
}

function HospitalDashboard() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))
        ) : (
          <>
            <StatCard
              title={t('totalPatients')}
              value={stats?.totalPatients?.toLocaleString() ?? '0'}
              icon={Users}
              trend={
                stats?.patientsTrend != null
                  ? {
                      value: Math.abs(stats.patientsTrend),
                      isPositive: stats.patientsTrend >= 0,
                    }
                  : undefined
              }
            />
            <StatCard
              title={t('totalDoctors')}
              value={stats?.totalDoctors?.toLocaleString() ?? '0'}
              icon={Stethoscope}
              trend={
                stats?.doctorsTrend != null
                  ? {
                      value: Math.abs(stats.doctorsTrend),
                      isPositive: stats.doctorsTrend >= 0,
                    }
                  : undefined
              }
            />
            <StatCard
              title={t('todayAppointments')}
              value={stats?.todayAppointments?.toLocaleString() ?? '0'}
              icon={CalendarDays}
              trend={
                stats?.appointmentsTrend != null
                  ? {
                      value: Math.abs(stats.appointmentsTrend),
                      isPositive: stats.appointmentsTrend >= 0,
                    }
                  : undefined
              }
            />
            <StatCard
              title={t('pendingLabResults')}
              value={stats?.pendingLabOrders?.toLocaleString() ?? '0'}
              icon={FlaskConical}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Appointments */}
      <RecentAppointments />
    </div>
  );
}
