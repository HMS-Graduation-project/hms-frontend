import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  BedDouble,
  Siren,
  ArrowRightLeft,
  Users,
  Activity,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PeriodSelect } from '@/components/reporting/period-select';
import { PatientVolumeChart } from '@/components/reporting/patient-volume-chart';
import { TopDiagnosesChart } from '@/components/reporting/top-diagnoses-chart';
import { ReferralFlowTable } from '@/components/reporting/referral-flow-table';
import { DiseaseTrendsChart } from '@/components/reporting/disease-trends-chart';
import {
  useRegionalSummary,
  useReferralFlow,
  useDiseaseTrends,
  type ReportingPeriod,
} from '@/hooks/use-reporting';

export default function RegionalDashboardPage() {
  const { t } = useTranslation('reporting');
  const [period, setPeriod] = useState<ReportingPeriod>('30d');

  const { data, isLoading, error } = useRegionalSummary({ period });
  const { data: flow, isLoading: flowLoading } = useReferralFlow({ period });
  const { data: trends, isLoading: trendsLoading } = useDiseaseTrends({
    period,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('loadFailed')}</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('regionalTitle')}
          </h1>
          <p className="text-muted-foreground">
            {data?.scope.city?.name
              ? t('regionalSubtitleCity', { city: data.scope.city.name })
              : t('regionalSubtitle')}
          </p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title={t('hospitals')}
            value={data.totals.totalHospitals.toLocaleString()}
            icon={Building2}
          />
          <StatCard
            title={t('bedOccupancy')}
            value={`${data.totals.bedOccupancyPct}%`}
            icon={BedDouble}
            description={t('bedsOfTotal', {
              occupied: data.totals.occupiedBeds,
              total: data.totals.totalBeds,
            })}
          />
          <StatCard
            title={t('openAdmissions')}
            value={data.totals.openAdmissions.toLocaleString()}
            icon={Activity}
          />
          <StatCard
            title={t('erVisits')}
            value={data.totals.erVisitsInPeriod.toLocaleString()}
            icon={Siren}
          />
          <StatCard
            title={t('referralsInOut')}
            value={`${data.totals.incomingReferrals}/${data.totals.outgoingReferrals}`}
            icon={ArrowRightLeft}
            description={t('incomingOutgoing')}
          />
          <StatCard
            title={t('totalPatients')}
            value={data.totals.totalPatients.toLocaleString()}
            icon={Users}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <PatientVolumeChart
          data={data?.dailyPatientVolume ?? []}
          isLoading={isLoading}
        />
        <TopDiagnosesChart
          data={data?.topDiagnoses ?? []}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t('hospitalsBreakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (data?.hospitals.length ?? 0) === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('noHospitalsInScope')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hospital')}</TableHead>
                  <TableHead className="text-right">{t('bedOccupancyShort')}</TableHead>
                  <TableHead className="text-right">{t('openAdmissionsShort')}</TableHead>
                  <TableHead className="text-right">{t('erVisitsShort')}</TableHead>
                  <TableHead className="text-right">{t('avgTriageMin')}</TableHead>
                  <TableHead className="text-right">{t('incomingShort')}</TableHead>
                  <TableHead className="text-right">{t('outgoingShort')}</TableHead>
                  <TableHead className="text-right">{t('patientsShort')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.hospitals.map((h) => (
                  <TableRow key={h.hospital.id}>
                    <TableCell>
                      <div className="font-medium">{h.hospital.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.hospital.code} · {h.hospital.city.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.bedOccupancyPct}% ({h.occupiedBeds}/{h.totalBeds})
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.openAdmissions}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.erVisitsInPeriod}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.avgTriageMinutes == null ? '—' : h.avgTriageMinutes}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.incomingReferrals}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.outgoingReferrals}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.totalPatients}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReferralFlowTable data={flow} isLoading={flowLoading} />
        <DiseaseTrendsChart data={trends} isLoading={trendsLoading} />
      </div>
    </div>
  );
}
