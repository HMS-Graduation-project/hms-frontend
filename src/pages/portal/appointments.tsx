import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/format';
import { CalendarDays, Plus } from 'lucide-react';
import {
  usePortalAppointments,
  useCancelPortalAppointment,
  type PortalAppointment,
} from '@/hooks/use-portal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const STATUS_FILTERS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

export default function PortalAppointmentsPage() {
  const { t } = useTranslation('portal');
  const { toast } = useToast();
  const [status, setStatus] = useState<string>('ALL');

  const params = status === 'ALL' ? {} : { status };
  const { data, isLoading } = usePortalAppointments(params);
  const cancelMutation = useCancelPortalAppointment();

  const handleCancel = async (a: PortalAppointment) => {
    if (!confirm(t('appointments.confirmCancel'))) return;
    try {
      await cancelMutation.mutateAsync(a.id);
      toast({
        title: t('appointments.cancelled'),
        description: formatDate(a.date, 'PPP'),
      });
    } catch (err: unknown) {
      toast({
        title: t('appointments.cancelFailed'),
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('appointments.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('appointments.subtitle')}
          </p>
        </div>
        <Button asChild>
          <Link to="/portal/appointments/book">
            <Plus className="me-1.5 h-4 w-4" />
            {t('appointments.book')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t('appointments.filter')}:
        </span>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'ALL' ? t('appointments.allStatuses') : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : data?.data.length ? (
        <ul className="space-y-3">
          {data.data.map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {formatDate(a.date, 'PPP')} · {a.startTime}–
                        {a.endTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dr. {a.doctor.user.firstName} {a.doctor.user.lastName}
                        {a.doctor.specialization &&
                          ` · ${a.doctor.specialization}`}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {t('appointments.atHospital')}:
                        </span>{' '}
                        {a.hospital.name}
                      </div>
                      {a.reason && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {t('appointments.reason')}: {a.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                    {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(a)}
                        disabled={cancelMutation.isPending}
                      >
                        {t('appointments.cancel')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('appointments.empty')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'CONFIRMED':
    case 'IN_PROGRESS':
      return 'default';
    case 'COMPLETED':
      return 'secondary';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'destructive';
    default:
      return 'outline';
  }
}
