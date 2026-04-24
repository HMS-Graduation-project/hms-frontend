import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  CheckCheck,
  Ban,
  Loader2,
  AlertTriangle,
  FileText,
  Pill,
  FlaskConical,
  Lock,
} from 'lucide-react';
import {
  useReferral,
  useAcceptReferral,
  useRejectReferral,
  useCompleteReferral,
  useCancelReferral,
  useCrossHospitalRecords,
} from '@/hooks/use-referrals';
import { useAuth } from '@/providers/auth-provider';
import { ReferralStatusBadge } from '@/components/referrals/referral-status-badge';
import { ReferralUrgencyBadge } from '@/components/referrals/referral-urgency-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/components/ui/use-toast';

type Action = 'accept' | 'reject' | 'complete' | 'cancel';

export default function ReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('referrals');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: referral, isLoading, error } = useReferral(id);
  const [action, setAction] = useState<Action | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error || !referral) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <p className="font-medium">{t('detail.loadError')}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/referrals/incoming')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('detail.back')}
        </Button>
      </div>
    );
  }

  const isReceiver = user?.hospitalId === referral.toHospitalId;
  const isSender = user?.hospitalId === referral.fromHospitalId;
  const np = referral.nationalPatient;

  const canAccept = isReceiver && referral.status === 'PENDING';
  const canReject = isReceiver && referral.status === 'PENDING';
  const canComplete = isReceiver && referral.status === 'ACCEPTED';
  const canCancel =
    isSender && (referral.status === 'PENDING' || referral.status === 'ACCEPTED');

  const grantsCrossHospitalRead =
    referral.status === 'ACCEPTED' || referral.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate(isReceiver ? '/referrals/incoming' : '/referrals/outgoing')
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {np.firstName} {np.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('detail.createdAgo', {
                when: formatDistanceToNowStrict(new Date(referral.createdAt), {
                  addSuffix: true,
                }),
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReferralStatusBadge status={referral.status} />
          <ReferralUrgencyBadge urgency={referral.urgency} />
          {canAccept && (
            <Button onClick={() => setAction('accept')}>
              <Check className="mr-2 h-4 w-4" />
              {t('detail.accept')}
            </Button>
          )}
          {canReject && (
            <Button
              variant="destructive"
              onClick={() => setAction('reject')}
            >
              <X className="mr-2 h-4 w-4" />
              {t('detail.reject')}
            </Button>
          )}
          {canComplete && (
            <Button onClick={() => setAction('complete')}>
              <CheckCheck className="mr-2 h-4 w-4" />
              {t('detail.complete')}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setAction('cancel')}
            >
              <Ban className="mr-2 h-4 w-4" />
              {t('detail.cancel')}
            </Button>
          )}
        </div>
      </div>

      {np.criticalAlerts && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">{t('detail.criticalAlerts')}</p>
            <p>{np.criticalAlerts}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: referral + clinical */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('detail.routeCardTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('detail.from')}
                  </p>
                  <p className="font-semibold">{referral.fromHospital.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {referral.fromHospital.city.name} ·{' '}
                    {referral.fromHospital.code}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('detail.to')}
                  </p>
                  <p className="font-semibold">{referral.toHospital.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {referral.toHospital.city.name} ·{' '}
                    {referral.toHospital.code}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label={t('detail.fromDoctor')}
                  value={`${referral.fromDoctor.user.firstName ?? ''} ${referral.fromDoctor.user.lastName ?? ''} · ${referral.fromDoctor.specialization}`}
                />
                <Field
                  label={t('detail.toDoctor')}
                  value={
                    referral.toDoctor
                      ? `${referral.toDoctor.user.firstName ?? ''} ${referral.toDoctor.user.lastName ?? ''} · ${referral.toDoctor.specialization}`
                      : t('detail.unassigned')
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('detail.clinicalCardTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field label={t('detail.reason')} value={referral.reason} />
              {referral.clinicalSummary && (
                <Field
                  label={t('detail.clinicalSummary')}
                  value={
                    <p className="whitespace-pre-wrap">
                      {referral.clinicalSummary}
                    </p>
                  }
                />
              )}
              {referral.responseNote && (
                <Field
                  label={t('detail.responseNote')}
                  value={
                    <p className="whitespace-pre-wrap">
                      {referral.responseNote}
                    </p>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Cross-hospital records panel — receiver sees source-hospital records */}
          {isReceiver && (
            <CrossHospitalRecordsPanel
              nhid={referral.nationalPatientId}
              grantsAccess={grantsCrossHospitalRead}
              status={referral.status}
            />
          )}
        </div>

        {/* Right: patient + timeline */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('detail.patientCardTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Field
                label={t('detail.nhid')}
                value={np.id.slice(0, 8)}
              />
              {np.syrianNationalId && (
                <Field
                  label={t('detail.syrianId')}
                  value={np.syrianNationalId}
                />
              )}
              <Field
                label={t('detail.dob')}
                value={format(new Date(np.dateOfBirth), 'PP')}
              />
              <Field label={t('detail.gender')} value={np.gender} />
              {np.bloodType && (
                <Field label={t('detail.bloodType')} value={np.bloodType} />
              )}
              {np.allergies && (
                <Field label={t('detail.allergies')} value={np.allergies} />
              )}
              {np.chronicConditions && (
                <Field
                  label={t('detail.chronicConditions')}
                  value={np.chronicConditions}
                />
              )}
              <Separator />
              <Link
                to={`/admin/national-registry?nhid=${np.id}`}
                className="text-xs text-primary hover:underline"
              >
                {t('detail.openInRegistry')}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('detail.timelineTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <TimelineItem
                label={t('detail.timeline.created')}
                at={referral.createdAt}
              />
              {referral.respondedAt && (
                <TimelineItem
                  label={t(
                    `detail.timeline.${
                      referral.status === 'ACCEPTED' || referral.status === 'COMPLETED'
                        ? 'accepted'
                        : 'rejected'
                    }`,
                  )}
                  at={referral.respondedAt}
                />
              )}
              {referral.completedAt && (
                <TimelineItem
                  label={t('detail.timeline.completed')}
                  at={referral.completedAt}
                />
              )}
              {referral.cancelledAt && (
                <TimelineItem
                  label={t('detail.timeline.cancelled')}
                  at={referral.cancelledAt}
                />
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {action && (
        <ActionDialog
          action={action}
          referralId={referral.id}
          onClose={() => setAction(null)}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function TimelineItem({ label, at }: { label: string; at: string }) {
  return (
    <div className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">
        {format(new Date(at), 'PP p')}
      </span>
    </div>
  );
}

function CrossHospitalRecordsPanel({
  nhid,
  grantsAccess,
  status,
}: {
  nhid: string;
  grantsAccess: boolean;
  status: string;
}) {
  const { t } = useTranslation('referrals');
  const { data, isLoading, error } = useCrossHospitalRecords(
    grantsAccess ? nhid : undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('detail.crossHospitalTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!grantsAccess ? (
          <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t('detail.crossHospitalLocked', { status })}
            </p>
          </div>
        ) : isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : String(error)}
          </p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('detail.crossHospitalEmpty')}
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((p) => (
              <div key={p.profileId} className="rounded-md border">
                <div className="flex items-center justify-between border-b bg-muted/30 p-3">
                  <div>
                    <p className="font-semibold">{p.hospital.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.hospital.city.name} · {p.hospital.code}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {t('detail.readOnly')}
                  </Badge>
                </div>
                <div className="space-y-3 p-3 text-sm">
                  <SectionList
                    icon={FileText}
                    title={t('detail.medicalRecords', {
                      count: p.medicalRecords.length,
                    })}
                    items={p.medicalRecords.map((mr) => (
                      <div key={mr.id} className="border-l-2 border-muted pl-3">
                        <p className="font-medium">
                          {mr.diagnosis ?? mr.chiefComplaint ?? mr.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mr.doctor.user.firstName} {mr.doctor.user.lastName} ·{' '}
                          {mr.doctor.specialization} ·{' '}
                          {format(new Date(mr.createdAt), 'PP')}
                        </p>
                      </div>
                    ))}
                  />
                  <SectionList
                    icon={Pill}
                    title={t('detail.prescriptions', {
                      count: p.prescriptions.length,
                    })}
                    items={p.prescriptions.map((rx) => (
                      <div key={rx.id} className="border-l-2 border-muted pl-3">
                        <p className="font-medium">
                          {rx.items
                            .map(
                              (i) => `${i.medicationName} ${i.dosage} ${i.frequency}`,
                            )
                            .join('; ') || rx.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rx.status} · {format(new Date(rx.createdAt), 'PP')}
                        </p>
                      </div>
                    ))}
                  />
                  <SectionList
                    icon={FlaskConical}
                    title={t('detail.labOrders', { count: p.labOrders.length })}
                    items={p.labOrders.map((lab) => (
                      <div key={lab.id} className="border-l-2 border-muted pl-3">
                        <p className="font-medium">{lab.testName}</p>
                        <p className="text-xs text-muted-foreground">
                          {lab.status} ·{' '}
                          {format(new Date(lab.orderedAt), 'PP')}
                          {lab.result?.isAbnormal && (
                            <span className="ml-1 text-destructive">
                              · {t('detail.abnormal')}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionList({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: React.ReactNode[];
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">—</p>
      ) : (
        <div className="space-y-2">{items}</div>
      )}
    </div>
  );
}

function ActionDialog({
  action,
  referralId,
  onClose,
}: {
  action: Action;
  referralId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation('referrals');
  const { toast } = useToast();

  const accept = useAcceptReferral();
  const reject = useRejectReferral();
  const complete = useCompleteReferral();
  const cancel = useCancelReferral();

  const [note, setNote] = useState('');

  const mut = {
    accept,
    reject,
    complete,
    cancel,
  }[action];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mut.mutateAsync({
        id: referralId,
        data: { responseNote: note || undefined },
      });
      toast({ title: t(`detail.actions.${action}.success`) });
      onClose();
    } catch (err) {
      toast({
        title: t(`detail.actions.${action}.error`),
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
            <DialogTitle>{t(`detail.actions.${action}.title`)}</DialogTitle>
            <DialogDescription>
              {t(`detail.actions.${action}.description`)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>{t('detail.actions.note')}</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder={t(`detail.actions.${action}.notePlaceholder`)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t(`detail.actions.${action}.confirm`)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
