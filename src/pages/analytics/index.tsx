import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Stethoscope,
  CalendarDays,
  FlaskConical,
  DollarSign,
  FileText,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { DepartmentChart } from '@/components/charts/department-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/use-analytics';

export default function AnalyticsPage() {
  const { t } = useTranslation('analytics');
  const [appointmentPeriod, setAppointmentPeriod] = useState('month');
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stat cards grid */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            title={t('pendingLabOrders')}
            value={stats?.pendingLabOrders?.toLocaleString() ?? '0'}
            icon={FlaskConical}
          />
          <StatCard
            title={t('monthlyRevenue')}
            value={`$${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title={t('pendingInvoices')}
            value={stats?.pendingInvoices?.toLocaleString() ?? '0'}
            icon={FileText}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AppointmentChart
          period={appointmentPeriod}
          onPeriodChange={setAppointmentPeriod}
        />
        <RevenueChart period={appointmentPeriod} />
      </div>

      <DepartmentChart />
    </div>
  );
}
