import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Plus, Stethoscope, Loader2, Eye, BedDouble } from 'lucide-react';
import {
  useAdmissions,
  useAdmit,
  useBeds,
  useWards,
  type AdmissionStatus,
} from '@/hooks/use-inpatient';
import { usePatients } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import { useAuth } from '@/providers/auth-provider';
import { AdmissionStatusBadge } from '@/components/inpatient/admission-status-badge';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

type StatusFilter = 'OPEN' | 'ALL' | AdmissionStatus;

const STATUS_OPTIONS: StatusFilter[] = [
  'OPEN',
  'ALL',
  'ADMITTED',
  'TRANSFERRED',
  'DISCHARGED',
  'DECEASED',
];

const ADMIT_ROLES = ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN'];

export default function AdmissionsPage() {
  const { t } = useTranslation('inpatient');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('OPEN');
  const [admitOpen, setAdmitOpen] = useState(false);

  const params = useMemo(() => {
    const p: { status?: AdmissionStatus; limit: number } = { limit: 50 };
    if (statusFilter !== 'OPEN' && statusFilter !== 'ALL') {
      p.status = statusFilter;
    }
    return p;
  }, [statusFilter]);

  const { data, isLoading } = useAdmissions(params);

  const canAdmit = !!user && ADMIT_ROLES.includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('admissions.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('admissions.subtitle')}
            </p>
          </div>
        </div>
        {canAdmit && (
          <Button onClick={() => setAdmitOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('admissions.admitPatient')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o === 'OPEN'
                  ? t('admissions.filter.open')
                  : o === 'ALL'
                    ? t('admissions.filter.all')
                    : t(`admissionStatus.${o}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title={t('admissions.emptyTitle')}
          description={t('admissions.emptyDescription')}
          action={
            canAdmit ? (
              <Button onClick={() => setAdmitOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('admissions.admitPatient')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admissions.columns.patient')}</TableHead>
                <TableHead>{t('admissions.columns.bed')}</TableHead>
                <TableHead>{t('admissions.columns.diagnosis')}</TableHead>
                <TableHead>{t('admissions.columns.admittedBy')}</TableHead>
                <TableHead>{t('admissions.columns.admissionDate')}</TableHead>
                <TableHead>{t('admissions.columns.status')}</TableHead>
                <TableHead className="text-right">{tCommon('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((adm) => {
                const name = adm.patientProfile.nationalPatient;
                const doc = adm.admittingDoctor.user;
                return (
                  <TableRow
                    key={adm.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/inpatient/admissions/${adm.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {name.firstName} {name.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('nhid', { ns: 'patients' })}: {name.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {adm.bed
                        ? `${adm.bed.ward.name} · ${adm.bed.number}`
                        : t('admissions.noBed')}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {adm.diagnosis ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {doc.firstName} {doc.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(adm.admissionDate), 'PP p')}
                    </TableCell>
                    <TableCell>
                      <AdmissionStatusBadge status={adm.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/inpatient/admissions/${adm.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {admitOpen && (
        <AdmitDialog onClose={() => setAdmitOpen(false)} />
      )}
    </div>
  );
}

function AdmitDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('inpatient');
  const { toast } = useToast();
  const navigate = useNavigate();
  const admit = useAdmit();

  const [patientProfileId, setPatientProfileId] = useState('');
  const [admittingDoctorId, setAdmittingDoctorId] = useState('');
  const [wardId, setWardId] = useState<string>('NO_WARD');
  const [bedId, setBedId] = useState<string>('NO_BED');
  const [diagnosis, setDiagnosis] = useState('');
  const [reason, setReason] = useState('');

  const { data: patients, isLoading: patientsLoading } = usePatients({ limit: 100 });
  const { data: doctors, isLoading: doctorsLoading } = useDoctors({ limit: 100 });
  const { data: wards } = useWards();
  const { data: beds, isLoading: bedsLoading } = useBeds({
    wardId: wardId === 'NO_WARD' ? undefined : wardId,
    status: 'AVAILABLE',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await admit.mutateAsync({
        patientProfileId,
        admittingDoctorId,
        bedId: bedId === 'NO_BED' ? undefined : bedId,
        diagnosis: diagnosis || undefined,
        reason: reason || undefined,
      });
      toast({ title: t('admissions.admitSuccess') });
      onClose();
      navigate(`/inpatient/admissions/${created.id}`);
    } catch (err) {
      toast({
        title: t('admissions.admitError'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  }

  const formValid = !!patientProfileId && !!admittingDoctorId;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('admissions.admitPatient')}</DialogTitle>
            <DialogDescription>
              {t('admissions.admitDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('admissions.fields.patient')}</Label>
              <Select
                value={patientProfileId}
                onValueChange={setPatientProfileId}
                disabled={patientsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admissions.fields.patientPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {patients?.data.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nationalPatient.firstName} {p.nationalPatient.lastName}
                      {p.nationalPatient.syrianNationalId
                        ? ` · SY-ID ${p.nationalPatient.syrianNationalId}`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t('admissions.fields.doctor')}</Label>
              <Select
                value={admittingDoctorId}
                onValueChange={setAdmittingDoctorId}
                disabled={doctorsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admissions.fields.doctorPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {doctors?.data.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.user.firstName} {d.user.lastName}
                      {d.specialization ? ` · ${d.specialization}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('admissions.fields.ward')}</Label>
              <Select
                value={wardId}
                onValueChange={(v) => {
                  setWardId(v);
                  setBedId('NO_BED');
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admissions.fields.wardPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_WARD">
                    {t('admissions.fields.noBedNow')}
                  </SelectItem>
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
                value={bedId}
                onValueChange={setBedId}
                disabled={wardId === 'NO_WARD' || bedsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admissions.fields.bedPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_BED">
                    {t('admissions.fields.pickLater')}
                  </SelectItem>
                  {beds?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.ward?.name} · {b.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t('admissions.fields.diagnosis')}</Label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('admissions.fields.reason')}</Label>
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
            <Button type="submit" disabled={!formValid || admit.isPending}>
              {admit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Stethoscope className="mr-2 h-4 w-4" />
              {t('admissions.admit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
