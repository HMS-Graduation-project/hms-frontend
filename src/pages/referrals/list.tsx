import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';
import { Plus, ArrowRightLeft, Eye, Inbox, Send } from 'lucide-react';
import {
  useIncomingReferrals,
  useOutgoingReferrals,
  type ReferralStatus,
  type ReferralUrgency,
} from '@/hooks/use-referrals';
import { useAuth } from '@/providers/auth-provider';
import { ReferralStatusBadge } from '@/components/referrals/referral-status-badge';
import { ReferralUrgencyBadge } from '@/components/referrals/referral-urgency-badge';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StatusFilter = 'ALL' | ReferralStatus;
type UrgencyFilter = 'ALL' | ReferralUrgency;

const STATUS_OPTIONS: StatusFilter[] = [
  'ALL',
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
];
const URGENCY_OPTIONS: UrgencyFilter[] = ['ALL', 'EMERGENT', 'URGENT', 'ROUTINE'];

const AUTHOR_ROLES = ['DOCTOR', 'HOSPITAL_ADMIN', 'ADMIN'];

interface Props {
  direction: 'incoming' | 'outgoing';
}

export default function ReferralsListPage({ direction }: Props) {
  const { t } = useTranslation('referrals');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('ALL');

  const params = useMemo(() => {
    const p: { status?: ReferralStatus; urgency?: ReferralUrgency; limit: number } = {
      limit: 50,
    };
    if (statusFilter !== 'ALL') p.status = statusFilter as ReferralStatus;
    if (urgencyFilter !== 'ALL') p.urgency = urgencyFilter as ReferralUrgency;
    return p;
  }, [statusFilter, urgencyFilter]);

  const incoming = useIncomingReferrals(direction === 'incoming' ? params : {});
  const outgoing = useOutgoingReferrals(direction === 'outgoing' ? params : {});
  const query = direction === 'incoming' ? incoming : outgoing;

  const canCreate = !!user && AUTHOR_ROLES.includes(user.role);
  const isIncoming = direction === 'incoming';
  const Icon = isIncoming ? Inbox : Send;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-500/20">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t(`${direction}.title`)}
            </h1>
            <p className="text-muted-foreground">
              {t(`${direction}.subtitle`)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isIncoming ? 'default' : 'outline'}
            onClick={() => navigate('/referrals/incoming')}
          >
            <Inbox className="mr-2 h-4 w-4" />
            {t('incoming.tab')}
          </Button>
          <Button
            variant={!isIncoming ? 'default' : 'outline'}
            onClick={() => navigate('/referrals/outgoing')}
          >
            <Send className="mr-2 h-4 w-4" />
            {t('outgoing.tab')}
          </Button>
          {canCreate && !isIncoming && (
            <Button onClick={() => navigate('/referrals/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('newReferral')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o === 'ALL' ? t('filter.allStatuses') : t(`status.${o}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as UrgencyFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {URGENCY_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o === 'ALL' ? t('filter.allUrgencies') : t(`urgency.${o}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !query.data || query.data.data.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title={t(`${direction}.emptyTitle`)}
          description={t(`${direction}.emptyDescription`)}
          action={
            canCreate && !isIncoming ? (
              <Button onClick={() => navigate('/referrals/new')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('newReferral')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.urgency')}</TableHead>
                <TableHead>{t('columns.patient')}</TableHead>
                <TableHead>{t('columns.reason')}</TableHead>
                <TableHead>
                  {isIncoming ? t('columns.from') : t('columns.to')}
                </TableHead>
                <TableHead>{t('columns.status')}</TableHead>
                <TableHead>{t('columns.created')}</TableHead>
                <TableHead className="text-right">{tCommon('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.data.map((r) => {
                const np = r.nationalPatient;
                const counter = isIncoming ? r.fromHospital : r.toHospital;
                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/referrals/${r.id}`)}
                  >
                    <TableCell>
                      <ReferralUrgencyBadge urgency={r.urgency} />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/referrals/${r.id}`}
                        className="font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {np.firstName} {np.lastName}
                      </Link>
                      {np.criticalAlerts && (
                        <div className="text-xs text-destructive">
                          {np.criticalAlerts}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {r.reason}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{counter.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {counter.city.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ReferralStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(r.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/referrals/${r.id}`);
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
    </div>
  );
}
