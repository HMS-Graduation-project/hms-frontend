import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  ArrowLeft,
  BedDouble,
  ArrowRightLeft,
  LogOut,
  User,
  Stethoscope,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  useAdmission,
  useBeds,
  useTransferBed,
  useDischarge,
  useWards,
} from '@/hooks/use-inpatient';
import { useAuth } from '@/providers/auth-provider';
import { AdmissionStatusBadge } from '@/components/inpatient/admission-status-badge';
import { BedStatusBadge } from '@/components/inpatient/bed-status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const TRANSFER_ROLES = ['DOCTOR', 'NURSE', 'ADMIN', 'HOSPITAL_ADMIN'];
const DISCHARGE_ROLES = ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN'];

export default function AdmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('inpatient');
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: admission, isLoading, error } = useAdmission(id);

  const [transferOpen, setTransferOpen] = useState(false);
  const [dischargeOpen, setDischargeOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error || !admission) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <p className="font-medium">{t('admissionDetail.loadError')}</p>
        <p className="mt-2 text-xs">
          {error instanceof Error ? error.message : String(error ?? '')}
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate('/inpatient/admissions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('admissionDetail.backToList')}
        </Button>
      </div>
    );
  }

  const np = admission.patientProfile.nationalPatient;
  const doc = admission.admittingDoctor.user;
  const isOpen =
    admission.status === 'ADMITTED' || admission.status === 'TRANSFERRED';

  const canTransfer =
    isOpen && !!user && TRANSFER_ROLES.includes(user.role);
  const canDischarge =
    isOpen && !!user && DISCHARGE_ROLES.includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/inpatient/admissions')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {np.firstName} {np.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('admissionDetail.admittedSince', {
                when: formatDistanceToNowStrict(new Date(admission.admissionDate), {
                  addSuffix: true,
                }),
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdmissionStatusBadge status={admission.status} />
          {canTransfer && (
            <Button
              variant="outline"
              onClick={() => setTransferOpen(true)}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {t('admissionDetail.transferBed')}
            </Button>
          )}
          {canDischarge && (
            <Button onClick={() => setDischargeOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('admissionDetail.discharge')}
            </Button>
          )}
        </div>
      </div>

      {np.criticalAlerts && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">{t('admissionDetail.criticalAlerts')}</p>
            <p>{np.criticalAlerts}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: patient + clinical summary */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                {t('admissionDetail.patientInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Field
                label={t('admissionDetail.fields.nhid')}
                value={np.id.slice(0, 8)}
              />
              <Field
                label={t('admissionDetail.fields.dob')}
                value={format(new Date(np.dateOfBirth), 'PP')}
              />
              <Field
                label={t('admissionDetail.fields.gender')}
                value={np.gender}
              />
              <Field
                label={t('admissionDetail.fields.bloodType')}
                value={np.bloodType ?? '—'}
              />
              <Field
                label={t('admissionDetail.fields.allergies')}
                value={np.allergies ?? '—'}
              />
              <Field
                label={t('admissionDetail.fields.patientProfile')}
                value={
                  <Link
                    to={`/patients/${admission.patientProfileId}`}
                    className="text-primary hover:underline"
                  >
                    {t('admissionDetail.openPatientRecord')}
                  </Link>
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4" />
                {t('admissionDetail.clinical')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field
                label={t('admissionDetail.fields.admittingDoctor')}
                value={`${doc.firstName ?? ''} ${doc.lastName ?? ''} · ${admission.admittingDoctor.specialization}`}
              />
              <Field
                label={t('admissionDetail.fields.admissionDate')}
                value={format(new Date(admission.admissionDate), 'PP p')}
              />
              {admission.dischargeDate && (
                <Field
                  label={t('admissionDetail.fields.dischargeDate')}
                  value={format(new Date(admission.dischargeDate), 'PP p')}
                />
              )}
              <Field
                label={t('admissionDetail.fields.diagnosis')}
                value={admission.diagnosis ?? '—'}
              />
              <Field
                label={t('admissionDetail.fields.reason')}
                value={admission.reason ?? '—'}
              />
              {admission.dischargeSummary && (
                <Field
                  label={t('admissionDetail.fields.dischargeSummary')}
                  value={admission.dischargeSummary}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRightLeft className="h-4 w-4" />
                {t('admissionDetail.transfers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {admission.transfers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('admissionDetail.noTransfers')}
                </p>
              ) : (
                <ol className="space-y-3">
                  {admission.transfers.map((tr) => (
                    <li
                      key={tr.id}
                      className="rounded-md border bg-muted/30 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {tr.fromBed
                            ? `${tr.fromBed.ward.name} · ${tr.fromBed.number}`
                            : t('admissionDetail.fromNowhere')}
                        </Badge>
                        <ArrowRightLeft className="h-3 w-3" />
                        <Badge>
                          {tr.toBed.ward.name} · {tr.toBed.number}
                        </Badge>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(new Date(tr.transferredAt), 'PP p')}
                        </span>
                      </div>
                      {tr.reason && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tr.reason}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('admissionDetail.medicalRecords')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {admission.medicalRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('admissionDetail.noRecords')}
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {admission.medicalRecords.map((mr) => (
                    <li
                      key={mr.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div>
                        <Link
                          to={`/medical-records/${mr.id}`}
                          className="font-medium hover:underline"
                        >
                          {mr.diagnosis ?? mr.chiefComplaint ?? mr.id.slice(0, 8)}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {mr.doctor.user.firstName} {mr.doctor.user.lastName} ·{' '}
                          {format(new Date(mr.createdAt), 'PP')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: bed card */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BedDouble className="h-4 w-4" />
                {t('admissionDetail.currentBed')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {admission.bed ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {admission.bed.number}
                    </span>
                    <BedStatusBadge status={admission.bed.status} />
                  </div>
                  <p className="text-muted-foreground">
                    {admission.bed.ward.name} ({t(`wardType.${admission.bed.ward.type}`)})
                  </p>
                  <Separator />
                  <Link
                    to={`/inpatient/bed-board?wardId=${admission.bed.ward.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {t('admissionDetail.openBedBoard')}
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground">
                  {t('admissionDetail.noBedAllocated')}
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {transferOpen && (
        <TransferDialog
          admissionId={admission.id}
          currentBedId={admission.bedId}
          onClose={() => setTransferOpen(false)}
        />
      )}
      {dischargeOpen && (
        <DischargeDialog
          admissionId={admission.id}
          onClose={() => setDischargeOpen(false)}
        />
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TransferDialog({
  admissionId,
  currentBedId,
  onClose,
}: {
  admissionId: string;
  currentBedId: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('inpatient');
  const { toast } = useToast();
  const transfer = useTransferBed();

  const { data: wards } = useWards();
  const [wardId, setWardId] = useState<string>('');
  const [toBedId, setToBedId] = useState<string>('');
  const [reason, setReason] = useState('');

  const { data: beds, isLoading: bedsLoading } = useBeds({
    wardId: wardId || undefined,
    status: 'AVAILABLE',
  });
  const availableBeds = (beds ?? []).filter((b) => b.id !== currentBedId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await transfer.mutateAsync({
        id: admissionId,
        data: { toBedId, reason: reason || undefined },
      });
      toast({ title: t('admissionDetail.transferSuccess') });
      onClose();
    } catch (err) {
      toast({
        title: t('admissionDetail.transferError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('admissionDetail.transferBed')}</DialogTitle>
            <DialogDescription>
              {t('admissionDetail.transferDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('admissions.fields.ward')}</Label>
              <Select
                value={wardId}
                onValueChange={(v) => {
                  setWardId(v);
                  setToBedId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admissions.fields.wardPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {wards?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admissions.fields.bed')}</Label>
              <Select
                value={toBedId}
                onValueChange={setToBedId}
                disabled={!wardId || bedsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admissions.fields.bedPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableBeds.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.ward?.name} · {b.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admissionDetail.fields.transferReason')}</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={!toBedId || transfer.isPending}>
              {transfer.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('admissionDetail.transfer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DischargeDialog({
  admissionId,
  onClose,
}: {
  admissionId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation('inpatient');
  const { toast } = useToast();
  const discharge = useDischarge();

  const [status, setStatus] = useState<'DISCHARGED' | 'DECEASED'>('DISCHARGED');
  const [summary, setSummary] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await discharge.mutateAsync({
        id: admissionId,
        data: { status, dischargeSummary: summary || undefined },
      });
      toast({ title: t('admissionDetail.dischargeSuccess') });
      onClose();
    } catch (err) {
      toast({
        title: t('admissionDetail.dischargeError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('admissionDetail.discharge')}</DialogTitle>
            <DialogDescription>
              {t('admissionDetail.dischargeDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('admissionDetail.fields.outcome')}</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as 'DISCHARGED' | 'DECEASED')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISCHARGED">
                    {t('admissionStatus.DISCHARGED')}
                  </SelectItem>
                  <SelectItem value="DECEASED">
                    {t('admissionStatus.DECEASED')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admissionDetail.fields.dischargeSummary')}</Label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={5}
                placeholder={t('admissionDetail.fields.dischargeSummaryPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={discharge.isPending}>
              {discharge.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <LogOut className="mr-2 h-4 w-4" />
              {t('admissionDetail.confirmDischarge')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

