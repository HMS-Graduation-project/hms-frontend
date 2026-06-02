import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { Users, Stethoscope, CalendarDays, FlaskConical, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentAppointments } from '@/components/dashboard/recent-appointments';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDashboardStats } from '@/hooks/use-analytics';

export default function DashboardPage() {
  const { user } = useAuth();

  // Role-based redirects: patients land in the portal, national/regional
  // roles in their own dashboards. The hospital dashboard is only for
  // hospital-scoped staff.
  if (user?.role === 'PATIENT') {
    return <Navigate to="/portal/home" replace />;
  }
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
  const { data: stats, isLoading, isError } = useDashboardStats();

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
      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('statsErrorTitle', 'Failed to load statistics')}</AlertTitle>
          <AlertDescription>
            {t('statsErrorDescription', 'Could not fetch dashboard data. Please try refreshing the page.')}
          </AlertDescription>
        </Alert>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))
        ) : (
          <>
            <StatCard
              title={t('totalPatients')}
              value={stats?.totalPatients?.toLocaleString() ?? '—'}
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
              value={stats?.totalDoctors?.toLocaleString() ?? '—'}
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
              value={stats?.todayAppointments?.toLocaleString() ?? '—'}
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
              value={stats?.pendingLabOrders?.toLocaleString() ?? '—'}
              icon={FlaskConical}
            />
          </>
        )}
      </div>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Appointments */}
      <RecentAppointments />
    </div>
  );
}
