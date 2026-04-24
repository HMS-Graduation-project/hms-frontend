import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Globe2,
  Activity,
  ArrowRightLeft,
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
  useNationalSummary,
  useReferralFlow,
  useDiseaseTrends,
  type ReportingPeriod,
} from '@/hooks/use-reporting';

export default function MinistryDashboardPage() {
  const { t } = useTranslation('reporting');
  const [period, setPeriod] = useState<ReportingPeriod>('30d');

  const { data, isLoading, error } = useNationalSummary({ period });
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
            {t('nationalTitle')}
          </h1>
          <p className="text-muted-foreground">{t('nationalSubtitle')}</p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('citiesCovered')}
            value={data.national.totalCities.toLocaleString()}
            icon={Globe2}
          />
          <StatCard
            title={t('hospitalsNationwide')}
            value={data.national.totalHospitals.toLocaleString()}
            icon={Building2}
          />
          <StatCard
            title={t('nationalPatients')}
            value={data.national.nationalPatients.toLocaleString()}
            icon={Activity}
            description={t('unifiedIdentity')}
          />
          <StatCard
            title={t('activeReferrals')}
            value={data.national.activeReferralsInPeriod.toLocaleString()}
            icon={ArrowRightLeft}
          />
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t('citiesBreakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (data?.cities.length ?? 0) === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('city')}</TableHead>
                  <TableHead className="text-right">{t('hospitalsShort')}</TableHead>
                  <TableHead className="text-right">{t('bedOccupancyShort')}</TableHead>
                  <TableHead className="text-right">{t('openAdmissionsShort')}</TableHead>
                  <TableHead className="text-right">{t('erVisitsShort')}</TableHead>
                  <TableHead className="text-right">{t('patientsShort')}</TableHead>
                  <TableHead className="text-right">{t('incomingShort')}</TableHead>
                  <TableHead className="text-right">{t('outgoingShort')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.cities.map((c) => (
                  <TableRow key={c.city.id}>
                    <TableCell className="font-medium">{c.city.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.hospitalCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.bedOccupancyPct}% ({c.occupiedBeds}/{c.totalBeds})
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.openAdmissions}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.erVisitsInPeriod}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.totalPatients}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.referralsIn}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.referralsOut}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <ReferralFlowTable data={flow} isLoading={flowLoading} />
        <DiseaseTrendsChart data={trends} isLoading={trendsLoading} />
      </div>
    </div>
  );
}
