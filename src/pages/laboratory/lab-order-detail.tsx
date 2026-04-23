import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  User,
  Stethoscope,
  Calendar,
  FlaskConical,
  TestTube,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  useLabOrder,
  useUpdateLabOrderStatus,
  type LabOrderStatus,
  type LabOrderPriority,
} from '@/hooks/use-laboratory';
import { LabResultForm } from '@/components/laboratory/lab-result-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const STATUS_BADGE_MAP: Record<
  LabOrderStatus,
  'secondary' | 'success' | 'warning' | 'destructive' | 'default'
> = {
  ORDERED: 'secondary',
  SAMPLE_COLLECTED: 'default',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

const PRIORITY_BADGE_MAP: Record<
  LabOrderPriority,
  'secondary' | 'warning' | 'destructive'
> = {
  NORMAL: 'secondary',
  URGENT: 'warning',
  STAT: 'destructive',
};

export default function LabOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('laboratory');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const { data: order, isLoading } = useLabOrder(id);
  const updateStatus = useUpdateLabOrderStatus();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<LabOrderStatus | null>(null);
  const [resultFormOpen, setResultFormOpen] = useState(false);

  const handleStatusChange = (status: LabOrderStatus) => {
    setTargetStatus(status);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!order || !targetStatus) return;
    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status: targetStatus,
      });
      toast({ title: t('statusUpdated'), variant: 'success' });
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    } finally {
      setStatusDialogOpen(false);
      setTargetStatus(null);
    }
  };

  if (isLoading) {
    return <LabOrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('notFound')}</p>
      </div>
    );
  }

  const patientName = order.patient
    ? [order.patient.user.firstName, order.patient.user.lastName]
        .filter(Boolean)
        .join(' ') || order.patient.user.email
    : '';

  const doctorName = order.doctor
    ? [order.doctor.user.firstName, order.doctor.user.lastName]
        .filter(Boolean)
        .join(' ') || order.doctor.user.email
    : '';

  const orderedDate = new Date(order.orderedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isTerminal =
    order.status === 'COMPLETED' || order.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/laboratory')}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('orderDetail')}
            </h1>
            <p className="text-muted-foreground">{order.testName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === 'ORDERED' && (
            <Button
              onClick={() => handleStatusChange('SAMPLE_COLLECTED')}
              className="flex-1 sm:flex-none"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {t('collectSample')}
            </Button>
          )}
          {order.status === 'SAMPLE_COLLECTED' && (
            <Button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="flex-1 sm:flex-none"
            >
              <Clock className="mr-2 h-4 w-4" />
              {t('startProcessing')}
            </Button>
          )}
          {order.status === 'IN_PROGRESS' && (
            <Button
              onClick={() => handleStatusChange('COMPLETED')}
              className="flex-1 sm:flex-none"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('markComplete')}
            </Button>
          )}
          {!isTerminal && (
            <Button
              variant="destructive"
              onClick={() => handleStatusChange('CANCELLED')}
              className="flex-1 sm:flex-none"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t('cancelOrder')}
            </Button>
          )}
        </div>
      </div>

      {/* Status + Priority Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('status')}:</span>
          <Badge variant={STATUS_BADGE_MAP[order.status]}>
            {t(`statuses.${order.status}`)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('priority')}:
          </span>
          <Badge variant={PRIORITY_BADGE_MAP[order.priority]}>
            {t(`priorities.${order.priority}`)}
          </Badge>
        </div>
      </div>

      {/* Meta Info Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {order.patient && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <User className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('patient')}</p>
                <Link
                  to={`/patients/${order.patientId}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {patientName}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        {order.doctor && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Stethoscope className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t('doctor')}</p>
                <Link
                  to={`/doctors/${order.doctorId}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {doctorName}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('orderedAt')}</p>
              <p className="text-sm font-medium">{orderedDate}</p>
            </div>
          </CardContent>
        </Card>
        {order.completedAt && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t('completedAt')}
                </p>
                <p className="text-sm font-medium">
                  {new Date(order.completedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FlaskConical className="h-5 w-5" />
            {t('orderInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('testName')}</p>
              <p className="text-sm font-medium">{order.testName}</p>
            </div>
            {order.testCategory && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('testCategory')}
                </p>
                <p className="text-sm font-medium">{order.testCategory}</p>
              </div>
            )}
          </div>
          {order.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">{t('notes')}</p>
                <p className="text-sm whitespace-pre-wrap mt-1">
                  {order.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="h-5 w-5" />
              {t('results')}
            </CardTitle>
            {!order.result && !isTerminal && (
              <Button
                size="sm"
                onClick={() => setResultFormOpen(true)}
              >
                <FlaskConical className="mr-2 h-4 w-4" />
                {t('enterResults')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {order.result ? (
            <div className="space-y-4">
              {/* Result value */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {t('result')}
                    </p>
                    <p className="text-sm font-medium whitespace-pre-wrap">
                      {order.result.result}
                    </p>
                  </div>
                  {order.result.isAbnormal != null && (
                    <Badge
                      variant={
                        order.result.isAbnormal ? 'destructive' : 'success'
                      }
                      className="shrink-0 ml-2"
                    >
                      {order.result.isAbnormal ? (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      ) : (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {order.result.isAbnormal ? t('abnormal') : t('normal')}
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {order.result.normalRange && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('normalRange')}
                      </p>
                      <p className="text-sm font-medium">
                        {order.result.normalRange}
                      </p>
                    </div>
                  )}
                  {order.result.unit && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('unit')}
                      </p>
                      <p className="text-sm font-medium">
                        {order.result.unit}
                      </p>
                    </div>
                  )}
                  {order.result.reportedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('reportedAt')}
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(order.result.reportedAt).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {order.result.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('notes')}
                      </p>
                      <p className="text-sm whitespace-pre-wrap mt-1">
                        {order.result.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noResultsYet')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Enter Results Dialog */}
      {order && (
        <LabResultForm
          labOrderId={order.id}
          open={resultFormOpen}
          onOpenChange={setResultFormOpen}
        />
      )}

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('confirmStatusChange')}</DialogTitle>
            <DialogDescription>{t('confirmStatusMessage')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant={
                targetStatus === 'CANCELLED' ? 'destructive' : 'default'
              }
              onClick={handleConfirmStatus}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? tCommon('loading') : tCommon('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabOrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
