import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format';
import { HeartPulse, Building2 } from 'lucide-react';
import { usePortalNationalRecord } from '@/hooks/use-portal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PortalRecordsPage() {
  const { t } = useTranslation('portal');
  const { data, isLoading } = usePortalNationalRecord();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!data) return null;

  const np = data.nationalPatient;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('records.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('records.subtitle')}</p>
      </div>

      {/* Summary card — NHID, demographics, alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartPulse className="h-4 w-4" />
            {t('records.summary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Field label={t('records.nhid')} value={np.id} />
            <Field
              label={t('records.syrianNationalId')}
              value={np.syrianNationalId ?? '—'}
            />
            <Field
              label={t('records.dob')}
              value={formatDate(np.dateOfBirth, 'PPP')}
            />
            <Field label={t('records.gender')} value={np.gender} />
            <Field
              label={t('records.bloodType')}
              value={np.bloodType ?? '—'}
            />
            <Field
              label={t('records.allergies')}
              value={np.allergies ?? '—'}
            />
            <Field
              label={t('records.chronic')}
              value={np.chronicConditions ?? '—'}
            />
            <Field
              label={t('records.alerts')}
              value={np.criticalAlerts ?? '—'}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Hospitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> {t('records.visitedHospitals')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.hospitals.map((h) => (
              <li
                key={h.profileId}
                className="rounded-md border p-3 text-sm"
              >
                <div className="font-medium">{h.hospital.name}</div>
                <div className="text-xs text-muted-foreground">
                  {h.hospital.city?.name && `${h.hospital.city.name} · `}
                  {h.hospital.code}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Medical records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('records.medicalRecords')}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.medicalRecords.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('records.noRecords')}
            </p>
          ) : (
            <ul className="space-y-3">
              {data.medicalRecords.map((r) => (
                <li
                  key={r.id}
                  className="rounded-md border p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {r.diagnosis ?? t('records.untitled')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {r.hospital.name}
                    </Badge>
                  </div>
                  {r.chiefComplaint && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t('records.chiefComplaint')}: {r.chiefComplaint}
                    </div>
                  )}
                  {r.treatmentPlan && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t('records.treatmentPlan')}: {r.treatmentPlan}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Dr. {r.doctor.user.firstName} {r.doctor.user.lastName}
                    {' · '}
                    {formatDate(r.createdAt, 'PPP')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
