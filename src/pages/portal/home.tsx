import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Pill,
  FlaskConical,
  HeartPulse,
  AlertTriangle,
  Plus,
  Building2,
} from 'lucide-react';
import {
  usePortalProfile,
  usePortalAppointments,
  usePortalNationalRecord,
} from '@/hooks/use-portal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

export default function PortalHomePage() {
  const { t } = useTranslation('portal');
  const { data: profile, isLoading: pLoading } = usePortalProfile();
  const { data: upcoming, isLoading: aLoading } = usePortalAppointments({
    status: 'CONFIRMED',
    limit: 5,
  });
  const { data: record } = usePortalNationalRecord();

  const np = profile?.nationalPatient;
  const fullName = np ? `${np.firstName} ${np.lastName}`.trim() : '';
  const alerts = np?.criticalAlerts;
  const allergies = np?.allergies;
  const chronic = np?.chronicConditions;

  return (
    <div className="space-y-6">
      {/* Hero / greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('home.greeting', { name: fullName || t('home.you') })}
        </h1>
        <p className="text-muted-foreground">{t('home.subtitle')}</p>
      </div>

      {/* Critical alerts banner */}
      {(alerts || allergies || chronic) && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {t('home.criticalAlerts')}
          </div>
          <dl className="grid gap-2 sm:grid-cols-3">
            {alerts && (
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t('home.alerts')}
                </dt>
                <dd className="font-medium">{alerts}</dd>
              </div>
            )}
            {allergies && (
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t('home.allergies')}
                </dt>
                <dd className="font-medium">{allergies}</dd>
              </div>
            )}
            {chronic && (
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t('home.chronic')}
                </dt>
                <dd className="font-medium">{chronic}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Quick action: book appointment */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/portal/appointments/book">
            <Plus className="me-1.5 h-4 w-4" />
            {t('home.bookNew')}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/portal/records">
            <HeartPulse className="me-1.5 h-4 w-4" />
            {t('home.viewRecords')}
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('home.statHospitals')}
          value={profile?.hospitals.length ?? 0}
          icon={Building2}
          isLoading={pLoading}
        />
        <StatCard
          title={t('home.statRecords')}
          value={record?.medicalRecords.length ?? 0}
          icon={HeartPulse}
        />
        <StatCard
          title={t('home.statPrescriptions')}
          value={record?.prescriptions.length ?? 0}
          icon={Pill}
        />
        <StatCard
          title={t('home.statLab')}
          value={record?.labOrders.length ?? 0}
          icon={FlaskConical}
        />
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">{t('home.upcoming')}</CardTitle>
          <Link
            to="/portal/appointments"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t('home.seeAll')}
          </Link>
        </CardHeader>
        <CardContent>
          {aLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : upcoming?.data && upcoming.data.length > 0 ? (
            <ul className="divide-y">
              {upcoming.data.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {formatDate(a.date, 'PPP')} · {a.startTime}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dr. {a.doctor.user.firstName} {a.doctor.user.lastName}
                        {' · '}
                        {a.hospital.name}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {a.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('home.noUpcoming')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase text-muted-foreground">
            {title}
          </span>
          {isLoading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <span className="text-2xl font-bold leading-none">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
