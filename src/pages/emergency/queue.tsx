import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';
import { Plus, Siren, Eye, Stethoscope, Activity } from 'lucide-react';
import {
  useEmergencyVisits,
  type EmergencyStatus,
  type TriageLevel,
  type EmergencyVisit,
} from '@/hooks/use-emergency';
import { useAuth } from '@/providers/auth-provider';
import { TriageBadge, triageRowClassMap } from '@/components/emergency/triage-badge';
import { EmergencyStatusBadge } from '@/components/emergency/emergency-status-badge';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StatusFilter = 'OPEN' | 'ALL' | EmergencyStatus;
type TriageFilter = 'ALL' | TriageLevel;

const STATUS_FILTER_OPTIONS: StatusFilter[] = [
  'OPEN',
  'ALL',
  'ARRIVED',
  'IN_TRIAGE',
  'IN_TREATMENT',
  'DISCHARGED',
  'ADMITTED',
  'TRANSFERRED',
  'LEFT_WITHOUT_BEING_SEEN',
];

const TRIAGE_FILTER_OPTIONS: TriageFilter[] = [
  'ALL',
  'RED',
  'ORANGE',
  'YELLOW',
  'GREEN',
  'BLUE',
];

function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '—';
}

function formatRelativeTime(iso: string): string {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return '—';
  }
}

function formatDuration(fromIso: string, toIso: string | null): string {
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

const QUEUE_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'HOSPITAL_ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
];

export default function EmergencyQueuePage() {
  const { t } = useTranslation('emergency');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('OPEN');
  const [triageFilter, setTriageFilter] = useState<TriageFilter>('ALL');

  const params = useMemo(() => {
    const p: { status?: string; triageLevel?: string; limit: number } = {
      limit: 50,
    };
    if (statusFilter !== 'OPEN' && statusFilter !== 'ALL') {
      p.status = statusFilter;
    }
    if (triageFilter !== 'ALL') p.triageLevel = triageFilter;
    return p;
  }, [statusFilter, triageFilter]);

  const { data, isLoading } = useEmergencyVisits(params);

  const visits = useMemo<EmergencyVisit[]>(() => {
    if (!data) return [];
    if (statusFilter === 'ALL') return data.data;
    if (statusFilter === 'OPEN') {
      const open: EmergencyStatus[] = ['ARRIVED', 'IN_TRIAGE', 'IN_TREATMENT'];
      return data.data.filter((v) => open.includes(v.status));
    }
    return data.data;
  }, [data, statusFilter]);

  const canCreateIntake = !!user && QUEUE_ROLES.includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/10 text-red-600 dark:bg-red-500/20">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
        {canCreateIntake && (
          <Button
            onClick={() => navigate('/emergency/intake')}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('newIntake')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === 'OPEN'
                  ? t('allOpen')
                  : opt === 'ALL'
                    ? t('allStatuses')
                    : t(`statuses.${opt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={triageFilter}
          onValueChange={(v) => setTriageFilter(v as TriageFilter)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('filterByTriage')} />
          </SelectTrigger>
          <SelectContent>
            {TRIAGE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === 'ALL' ? t('allTriage') : t(`triage.${opt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Queue */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <EmptyState
          icon={Siren}
          title={t('noOpenVisits')}
          description={t('noOpenVisitsDescription')}
          action={
            canCreateIntake ? (
              <Button onClick={() => navigate('/emergency/intake')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('newIntake')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">{t('triageLevel')}</TableHead>
                <TableHead>{t('patient')}</TableHead>
                <TableHead>{t('chiefComplaint')}</TableHead>
                <TableHead className="w-[140px]">{t('status')}</TableHead>
                <TableHead className="w-[130px]">{t('arrived')}</TableHead>
                <TableHead className="w-[100px]">{t('wait')}</TableHead>
                <TableHead className="w-[180px]">{t('attending')}</TableHead>
                <TableHead className="w-[200px] text-right">
                  {tCommon('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((visit) => (
                <QueueRow key={visit.id} visit={visit} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

interface QueueRowProps {
  visit: EmergencyVisit;
}

function QueueRow({ visit }: QueueRowProps) {
  const { t } = useTranslation('emergency');
  const navigate = useNavigate();
  const { user } = useAuth();

  const rowClass = visit.triageLevel
    ? triageRowClassMap[visit.triageLevel]
    : '';

  const doctorName = visit.attendingDoctor
    ? `${formatName(
        visit.attendingDoctor.user.firstName,
        visit.attendingDoctor.user.lastName,
      )}${visit.attendingDoctor.specialization ? ` · ${visit.attendingDoctor.specialization}` : ''}`
    : '—';

  const isOpen =
    visit.status === 'ARRIVED' ||
    visit.status === 'IN_TRIAGE' ||
    visit.status === 'IN_TREATMENT';

  const canTriage =
    visit.status === 'ARRIVED' &&
    (user?.role === 'NURSE' ||
      user?.role === 'DOCTOR' ||
      user?.role === 'ADMIN' ||
      user?.role === 'HOSPITAL_ADMIN');

  const canClaim =
    isOpen &&
    !!visit.triageLevel &&
    !visit.attendingDoctorId &&
    user?.role === 'DOCTOR';

  const handleRowClick = () => navigate(`/emergency/${visit.id}`);

  return (
    <TableRow
      className={cn('cursor-pointer', rowClass)}
      onClick={handleRowClick}
    >
      <TableCell>
        <TriageBadge level={visit.triageLevel} />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium leading-none">
            {visit.displayName || t('unidentified')}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {visit.nationalPatient ? (
              <Badge variant="outline" className="text-[10px]">
                {t('nhid')}: {visit.nationalPatient.id.slice(0, 8)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                {t('unidentified')}
              </Badge>
            )}
            {visit.nationalPatient?.criticalAlerts && (
              <Badge variant="destructive" className="text-[10px]">
                {visit.nationalPatient.criticalAlerts}
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        <p className="truncate text-sm text-muted-foreground" title={visit.chiefComplaint}>
          {visit.chiefComplaint}
        </p>
      </TableCell>
      <TableCell>
        <EmergencyStatusBadge status={visit.status} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatRelativeTime(visit.arrivedAt)}
      </TableCell>
      <TableCell className="text-sm">
        {formatDuration(visit.arrivedAt, visit.closedAt)}
      </TableCell>
      <TableCell className="text-sm">{doctorName}</TableCell>
      <TableCell className="text-right">
        <div
          className="flex justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {canTriage && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/emergency/${visit.id}`)}
            >
              <Activity className="mr-1 h-3.5 w-3.5" />
              {t('startTriage')}
            </Button>
          )}
          {canClaim && (
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate(`/emergency/${visit.id}`)}
            >
              <Stethoscope className="mr-1 h-3.5 w-3.5" />
              {t('claim')}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate(`/emergency/${visit.id}`)}
            aria-label={t('view')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
