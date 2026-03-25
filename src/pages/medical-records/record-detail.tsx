import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Pencil,
  Activity,
  Stethoscope,
  ClipboardList,
  FileText,
  Pill,
  Calendar,
  User,
} from 'lucide-react';
import { useMedicalRecord } from '@/hooks/use-medical-records';
import { VitalsForm } from '@/components/medical-records/vitals-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('medical-records');
  const { t: tCommon } = useTranslation('common');
  const { t: tRx } = useTranslation('prescriptions');

  const { data: record, isLoading } = useMedicalRecord(id);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);

  if (isLoading) {
    return <RecordDetailSkeleton />;
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('notFound')}</p>
      </div>
    );
  }

  const patientName = record.patient
    ? [record.patient.user.firstName, record.patient.user.lastName]
        .filter(Boolean)
        .join(' ') || record.patient.user.email
    : '';

  const doctorName = record.doctor
    ? [record.doctor.user.firstName, record.doctor.user.lastName]
        .filter(Boolean)
        .join(' ') || record.doctor.user.email
    : '';

  const recordDate = new Date(record.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const latestVitals =
    record.vitalSigns && record.vitalSigns.length > 0
      ? record.vitalSigns[0]
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('recordDetail')}
            </h1>
            <p className="text-muted-foreground">{recordDate}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/medical-records/${id}/edit`)}
          className="w-full sm:w-auto"
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('editRecord')}
        </Button>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {record.patient && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('patient')}</p>
                <Link
                  to={`/patients/${record.patientId}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {patientName}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        {record.doctor && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Stethoscope className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('doctor')}</p>
                <Link
                  to={`/doctors/${record.doctorId}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {doctorName}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        {record.appointment && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t('appointment')}
                </p>
                <p className="text-sm font-medium">
                  {new Date(record.appointment.scheduledAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clinical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5" />
            {t('chiefComplaint')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {record.chiefComplaint && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {t('chiefComplaint')}
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {record.chiefComplaint}
              </p>
            </div>
          )}

          {record.presentIllness && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('presentIllness')}
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {record.presentIllness}
                </p>
              </div>
            </>
          )}

          {record.examination && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('examination')}
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {record.examination}
                </p>
              </div>
            </>
          )}

          {!record.chiefComplaint &&
            !record.presentIllness &&
            !record.examination && (
              <p className="text-sm text-muted-foreground">--</p>
            )}
        </CardContent>
      </Card>

      {/* Diagnosis */}
      {(record.diagnosis || record.icdCodes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {t('diagnosis')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.diagnosis && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('diagnosis')}
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {record.diagnosis}
                </p>
              </div>
            )}
            {record.icdCodes && (
              <>
                {record.diagnosis && <Separator />}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('icdCodes')}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {record.icdCodes.split(',').map((code, i) => (
                      <Badge key={i} variant="secondary">
                        {code.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Treatment Plan */}
      {(record.treatmentPlan || record.notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5" />
              {t('treatmentPlan')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.treatmentPlan && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('treatmentPlan')}
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {record.treatmentPlan}
                </p>
              </div>
            )}
            {record.notes && (
              <>
                {record.treatmentPlan && <Separator />}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('notes')}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vital Signs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            {t('vitalSigns')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVitalsDialogOpen(true)}
          >
            <Activity className="mr-2 h-4 w-4" />
            {latestVitals ? t('updateVitals') : t('addVitals')}
          </Button>
        </CardHeader>
        <CardContent>
          {latestVitals ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <VitalItem
                label={t('temperature')}
                value={latestVitals.temperature}
                unit={t('celsius')}
              />
              <VitalItem
                label={t('bloodPressure')}
                value={
                  latestVitals.bloodPressureSystolic != null &&
                  latestVitals.bloodPressureDiastolic != null
                    ? `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}`
                    : null
                }
                unit={t('mmHg')}
              />
              <VitalItem
                label={t('heartRate')}
                value={latestVitals.heartRate}
                unit={t('bpm')}
              />
              <VitalItem
                label={t('respiratoryRate')}
                value={latestVitals.respiratoryRate}
                unit={t('breaths')}
              />
              <VitalItem
                label={t('oxygenSaturation')}
                value={latestVitals.oxygenSaturation}
                unit={t('percent')}
              />
              <VitalItem
                label={t('weight')}
                value={latestVitals.weight}
                unit={t('kg')}
              />
              <VitalItem
                label={t('height')}
                value={latestVitals.height}
                unit={t('cm')}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              --
            </p>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions */}
      {record.prescriptions && record.prescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5" />
              {t('prescriptions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {record.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/prescriptions/${rx.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/prescriptions/${rx.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                      {rx._count && (
                        <p className="text-xs text-muted-foreground">
                          {rx._count.items} {tRx('medications')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      rx.status === 'DISPENSED'
                        ? 'success'
                        : rx.status === 'CANCELLED'
                          ? 'destructive'
                          : rx.status === 'PARTIALLY_DISPENSED'
                            ? 'warning'
                            : 'secondary'
                    }
                  >
                    {tRx(`statuses.${rx.status}`)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vitals Dialog */}
      <VitalsForm
        medicalRecordId={record.id}
        open={vitalsDialogOpen}
        onOpenChange={setVitalsDialogOpen}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function VitalItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string | null;
  unit: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">
        {value != null ? (
          <>
            {value}{' '}
            <span className="text-xs text-muted-foreground">{unit}</span>
          </>
        ) : (
          '--'
        )}
      </p>
    </div>
  );
}

function RecordDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-36 w-full rounded-lg" />
      <Skeleton className="h-36 w-full rounded-lg" />
    </div>
  );
}
