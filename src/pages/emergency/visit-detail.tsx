import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  ClipboardList,
  Stethoscope,
  Activity,
  CheckCircle2,
  UserPlus,
  ExternalLink,
  Siren,
} from 'lucide-react';
import {
  useEmergencyVisit,
  useTriageEmergencyVisit,
  useClaimEmergencyVisit,
  useDispositionEmergencyVisit,
  useLinkEmergencyPatient,
  type EmergencyVisit,
  type TriageLevel,
  type Disposition,
} from '@/hooks/use-emergency';
import { useAuth } from '@/providers/auth-provider';
import {
  NationalPatientSearch,
  type NationalPatientSearchResult,
} from '@/components/patients/national-patient-search';
import { TriageBadge } from '@/components/emergency/triage-badge';
import { EmergencyStatusBadge } from '@/components/emergency/emergency-status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const TRIAGE_LEVELS: TriageLevel[] = ['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE'];
const DISPOSITIONS: Disposition[] = [
  'DISCHARGED',
  'ADMITTED',
  'TRANSFERRED',
  'LEFT_WITHOUT_BEING_SEEN',
];

const CLINICAL_ROLES = ['DOCTOR', 'NURSE', 'ADMIN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'];
const DOCTOR_ROLES = ['DOCTOR', 'ADMIN', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'];

function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '—';
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'PPp');
  } catch {
    return iso;
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'HH:mm');
  } catch {
    return iso;
  }
}

function durationMinutes(fromIso: string, toIso: string | null): string {
  try {
    const from = new Date(fromIso).getTime();
    const to = (toIso ? new Date(toIso) : new Date()).getTime();
    const mins = Math.max(0, Math.floor((to - from) / 60000));
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem ? `${hours}h ${rem}m` : `${hours}h`;
  } catch {
    return '—';
  }
}

export default function EmergencyVisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('emergency');
  const { t: tCommon } = useTranslation('common');

  const { data: visit, isLoading } = useEmergencyVisit(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!visit || !id) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('notFound')}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/emergency')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToQueue')}
        </Button>
      </div>
    );
  }

  return <VisitDetailContent visit={visit} />;
}

interface VisitDetailContentProps {
  visit: EmergencyVisit;
}

function VisitDetailContent({ visit }: VisitDetailContentProps) {
  const { t } = useTranslation('emergency');
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role ?? '';
  const isDoctor = role === 'DOCTOR';
  const canTriage = CLINICAL_ROLES.includes(role);
  const canDisposition = DOCTOR_ROLES.includes(role);

  const isClosed =
    visit.status === 'DISCHARGED' ||
    visit.status === 'ADMITTED' ||
    visit.status === 'TRANSFERRED' ||
    visit.status === 'LEFT_WITHOUT_BEING_SEEN';

  const hasTriage = !!visit.triageLevel;
  const hasClaim = !!visit.attendingDoctorId;
  const criticalAlerts = visit.nationalPatient?.criticalAlerts;

  return (
    <div className="space-y-6">
      {/* Critical alerts banner */}
      {criticalAlerts && (
        <div className="flex items-start gap-3 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t('criticalAlerts')}</p>
            <p className="text-sm">{criticalAlerts}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/emergency')}
            aria-label={t('backToQueue')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-red-600 dark:text-red-500" />
              <h1 className="text-2xl font-bold tracking-tight">
                {visit.displayName || t('unidentified')}
              </h1>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TriageBadge level={visit.triageLevel} />
              <EmergencyStatusBadge status={visit.status} />
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {t('arrived')} {formatDateTime(visit.arrivedAt)}
              </Badge>
              <Badge variant="outline">
                {t('wait')} · {durationMinutes(visit.arrivedAt, visit.closedAt)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT (spans 2) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Clinical summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" />
                {t('clinicalSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('chiefComplaint')}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {visit.chiefComplaint}
                </p>
              </div>

              {visit.triageNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t('triageNotes')}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {visit.triageNotes}
                    </p>
                  </div>
                </>
              )}

              {visit.dispositionNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t('dispositionNotes')}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {visit.dispositionNotes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {!isClosed && (
            <>
              {!hasTriage && canTriage && (
                <TriageForm visitId={visit.id} />
              )}

              {hasTriage && !hasClaim && isDoctor && (
                <ClaimCard visitId={visit.id} />
              )}

              {hasTriage && canDisposition && (
                <DispositionForm visitId={visit.id} />
              )}

              {hasTriage && !isDoctor && !hasClaim && (
                <Card>
                  <CardContent className="py-6 text-sm text-muted-foreground">
                    {t('notClaimedYet')}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {isClosed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {t('disposition')}
                </CardTitle>
                <CardDescription>{t('closed')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {t('disposition')}:
                  </span>
                  <Badge variant="secondary">
                    {t(`statuses.${visit.status}`)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {t('closedAt')}: {formatDateTime(visit.closedAt)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">
          {/* Patient card */}
          <PatientCard visit={visit} />

          {/* Timeline */}
          <TimelineCard visit={visit} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Patient card                                                       */
/* ------------------------------------------------------------------ */

function PatientCard({ visit }: { visit: EmergencyVisit }) {
  const { t } = useTranslation('emergency');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const linkPatient = useLinkEmergencyPatient();
  const [showSearch, setShowSearch] = useState(false);

  const handleSelect = async (result: NationalPatientSearchResult) => {
    if (result.mode !== 'existing') return;
    try {
      await linkPatient.mutateAsync({
        id: visit.id,
        data: { nationalPatientId: result.nhid },
      });
      toast({ title: t('linkPatientSuccess'), variant: 'success' });
      setShowSearch(false);
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const np = visit.nationalPatient;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5" />
          {t('patient')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {np ? (
          <>
            <div>
              <p className="font-medium">
                {formatName(np.firstName, np.lastName)}
              </p>
              {np.syrianNationalId && (
                <p className="text-xs text-muted-foreground">
                  {np.syrianNationalId}
                </p>
              )}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                {t('nhid')}: {np.id.slice(0, 8)}
              </p>
              {np.dateOfBirth && (
                <p>{new Date(np.dateOfBirth).toLocaleDateString()}</p>
              )}
              {np.gender && <p>{np.gender}</p>}
              {np.bloodType && <p>Blood: {np.bloodType}</p>}
            </div>
            {visit.patientProfileId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  (window.location.href = `/patients/${visit.patientProfileId}`)
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('viewPatientProfile')}
              </Button>
            )}
          </>
        ) : (
          <>
            <Badge variant="secondary">{t('unidentified')}</Badge>
            {showSearch ? (
              <div className="mt-3 space-y-2">
                <NationalPatientSearch
                  onSelect={handleSelect}
                  onCancel={() => setShowSearch(false)}
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowSearch(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t('identifyPatient')}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline                                                           */
/* ------------------------------------------------------------------ */

function TimelineCard({ visit }: { visit: EmergencyVisit }) {
  const { t } = useTranslation('emergency');

  const steps = [
    {
      icon: Siren,
      label: t('arrived'),
      time: formatDateTime(visit.arrivedAt),
      done: true,
      actor: null as string | null,
    },
    {
      icon: Activity,
      label: t('triageCompleted'),
      time: visit.triagedAt ? formatDateTime(visit.triagedAt) : t('notTriagedYet'),
      done: !!visit.triagedAt,
      actor: visit.triagedBy
        ? `${t('triagedBy')} ${formatName(visit.triagedBy.firstName, visit.triagedBy.lastName)} (${formatTime(visit.triagedAt)})`
        : null,
    },
    {
      icon: Stethoscope,
      label: t('claimed'),
      time: visit.claimedAt
        ? formatDateTime(visit.claimedAt)
        : t('notClaimedYet'),
      done: !!visit.claimedAt,
      actor: visit.attendingDoctor
        ? `${t('claimedBy')} ${formatName(visit.attendingDoctor.user.firstName, visit.attendingDoctor.user.lastName)}`
        : null,
    },
    {
      icon: CheckCircle2,
      label: t('closed'),
      time: visit.closedAt ? formatDateTime(visit.closedAt) : t('notClosed'),
      done: !!visit.closedAt,
      actor: null,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          {t('timeline')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <li key={idx} className="flex gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                    s.done
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="text-sm font-medium leading-tight">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.time}</p>
                  {s.actor && (
                    <p className="text-xs text-muted-foreground">{s.actor}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Triage form                                                        */
/* ------------------------------------------------------------------ */

const triageSchema = z.object({
  triageLevel: z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE']),
  triageNotes: z.string().trim().max(1000, 'Too long').optional(),
});

type TriageFormValues = z.infer<typeof triageSchema>;

function TriageForm({ visitId }: { visitId: string }) {
  const { t } = useTranslation('emergency');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const triage = useTriageEmergencyVisit();

  const form = useForm<TriageFormValues>({
    resolver: zodResolver(triageSchema),
    defaultValues: { triageLevel: 'YELLOW', triageNotes: '' },
  });

  const onSubmit = async (values: TriageFormValues) => {
    try {
      await triage.mutateAsync({
        id: visitId,
        data: {
          triageLevel: values.triageLevel,
          triageNotes: values.triageNotes?.trim() || undefined,
        },
      });
      toast({ title: t('triageSuccess'), variant: 'success' });
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const level = form.watch('triageLevel');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          {t('startTriage')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="triage-level">
              {t('triageLevel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={level}
              onValueChange={(v) =>
                form.setValue('triageLevel', v as TriageLevel, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="triage-level">
                <SelectValue placeholder={t('selectTriage')} />
              </SelectTrigger>
              <SelectContent>
                {TRIAGE_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    <span className="flex items-center gap-2">
                      <TriageBadge level={lvl} />
                      <span>{t(`triage.${lvl.toLowerCase()}`)}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="triage-notes">{t('triageNotes')}</Label>
            <Textarea
              id="triage-notes"
              rows={4}
              placeholder={t('triageNotesPlaceholder')}
              {...form.register('triageNotes')}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={triage.isPending}>
              {triage.isPending ? tCommon('loading') : t('submitTriage')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Claim card                                                         */
/* ------------------------------------------------------------------ */

function ClaimCard({ visitId }: { visitId: string }) {
  const { t } = useTranslation('emergency');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const claim = useClaimEmergencyVisit();

  const handleClaim = async () => {
    try {
      await claim.mutateAsync({ id: visitId });
      toast({ title: t('claimSuccess'), variant: 'success' });
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Stethoscope className="h-5 w-5" />
          {t('claim')}
        </CardTitle>
        <CardDescription>{t('notClaimedYet')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClaim} disabled={claim.isPending}>
          <Stethoscope className="mr-2 h-4 w-4" />
          {claim.isPending ? tCommon('loading') : t('claim')}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Disposition form                                                   */
/* ------------------------------------------------------------------ */

const dispositionSchema = z.object({
  disposition: z.enum([
    'DISCHARGED',
    'ADMITTED',
    'TRANSFERRED',
    'LEFT_WITHOUT_BEING_SEEN',
  ]),
  dispositionNotes: z.string().trim().max(1000, 'Too long').optional(),
});

type DispositionFormValues = z.infer<typeof dispositionSchema>;

function DispositionForm({ visitId }: { visitId: string }) {
  const { t } = useTranslation('emergency');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const disposition = useDispositionEmergencyVisit();

  const form = useForm<DispositionFormValues>({
    resolver: zodResolver(dispositionSchema),
    defaultValues: { disposition: 'DISCHARGED', dispositionNotes: '' },
  });

  const onSubmit = async (values: DispositionFormValues) => {
    try {
      await disposition.mutateAsync({
        id: visitId,
        data: {
          disposition: values.disposition,
          dispositionNotes: values.dispositionNotes?.trim() || undefined,
        },
      });
      toast({ title: t('dispositionSuccess'), variant: 'success' });
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5" />
          {t('disposition')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="disposition">
              {t('disposition')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch('disposition')}
              onValueChange={(v) =>
                form.setValue('disposition', v as Disposition, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="disposition">
                <SelectValue placeholder={t('selectDisposition')} />
              </SelectTrigger>
              <SelectContent>
                {DISPOSITIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {t(`dispositions.${d}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disposition-notes">{t('dispositionNotes')}</Label>
            <Textarea
              id="disposition-notes"
              rows={4}
              placeholder={t('dispositionNotesPlaceholder')}
              {...form.register('dispositionNotes')}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={disposition.isPending}>
              {disposition.isPending
                ? tCommon('loading')
                : t('submitDisposition')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
