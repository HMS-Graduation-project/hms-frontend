import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  User,
  Stethoscope,
  Building2,
  FileText,
  XCircle,
} from 'lucide-react';
import {
  useAppointment,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  useRescheduleAppointment,
  useAvailableSlots,
  type AppointmentStatus,
  type AvailableSlot,
} from '@/hooks/use-appointments';
import { StatusBadge } from '@/components/appointments/status-badge';
import { TimeSlotPicker } from '@/components/appointments/time-slot-picker';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '-';
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('appointments');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const { data: appointment, isLoading } = useAppointment(id);
  const updateStatus = useUpdateAppointmentStatus();
  const cancelAppointment = useCancelAppointment();
  const rescheduleAppointment = useRescheduleAppointment();

  // Cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Reschedule dialog
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState<AvailableSlot | null>(null);

  // Fetch available slots for reschedule
  const { data: rescheduleSlots, isLoading: rescheduleSlotsLoading } =
    useAvailableSlots(
      rescheduleDialogOpen ? appointment?.doctorId : undefined,
      rescheduleDate || undefined,
    );

  const handleStatusUpdate = async (status: AppointmentStatus) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ id, data: { status } });
      toast({ title: t('statusUpdated'), variant: 'success' });
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelAppointment.mutateAsync({
        id,
        data: { reason: cancelReason || undefined },
      });
      toast({ title: t('appointmentCancelled'), variant: 'success' });
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const handleReschedule = async () => {
    if (!id || !rescheduleSlot) return;
    try {
      await rescheduleAppointment.mutateAsync({
        id,
        data: {
          date: rescheduleDate,
          startTime: rescheduleSlot.startTime,
          endTime: rescheduleSlot.endTime,
        },
      });
      toast({ title: t('appointmentRescheduled'), variant: 'success' });
      setRescheduleDialogOpen(false);
      setRescheduleDate('');
      setRescheduleSlot(null);
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('noResults')}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/appointments')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToList')}
        </Button>
      </div>
    );
  }

  const patientName = formatName(
    appointment.patient?.user?.firstName,
    appointment.patient?.user?.lastName,
  );
  const doctorName = formatName(
    appointment.doctor?.user?.firstName,
    appointment.doctor?.user?.lastName,
  );

  // Determine available actions based on status
  const status = appointment.status;
  const showConfirm = status === 'PENDING';
  const showStart = status === 'CONFIRMED';
  const showComplete = status === 'IN_PROGRESS';
  const showCancel = status === 'PENDING' || status === 'CONFIRMED';
  const showReschedule = status === 'PENDING' || status === 'CONFIRMED';
  const showNoShow = status === 'CONFIRMED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/appointments')}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('appointmentDetail')}
            </h1>
            <p className="text-muted-foreground">
              {appointment.date} - {formatTime(appointment.startTime)}
            </p>
          </div>
        </div>
        <StatusBadge status={appointment.status} className="text-sm" />
      </div>

      {/* Action buttons */}
      {(showConfirm || showStart || showComplete || showCancel || showReschedule || showNoShow) && (
        <div className="flex flex-wrap gap-2">
          {showConfirm && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('CONFIRMED')}
              disabled={updateStatus.isPending}
            >
              {t('actions.confirm')}
            </Button>
          )}
          {showStart && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={updateStatus.isPending}
            >
              {t('actions.start')}
            </Button>
          )}
          {showComplete && (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={updateStatus.isPending}
            >
              {t('actions.complete')}
            </Button>
          )}
          {showReschedule && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRescheduleDialogOpen(true)}
            >
              {t('actions.reschedule')}
            </Button>
          )}
          {showNoShow && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleStatusUpdate('NO_SHOW')}
              disabled={updateStatus.isPending}
            >
              {t('actions.noShow')}
            </Button>
          )}
          {showCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              {t('actions.cancel')}
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              {t('patient')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{patientName}</p>
          </CardContent>
        </Card>

        {/* Doctor Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5" />
              {t('doctor')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">{doctorName}</p>
            <p className="text-sm text-muted-foreground">
              {appointment.doctor?.specialization}
            </p>
          </CardContent>
        </Card>

        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {t('appointmentDetail')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('date')}</p>
                <p className="text-sm">{appointment.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('time')}</p>
                <p className="text-sm">
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('type')}</p>
                <p className="text-sm">{appointment.type || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('status')}</p>
                <StatusBadge status={appointment.status} />
              </div>
            </div>

            {appointment.department && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <Building2 className="mr-1 inline h-4 w-4" />
                    {t('department')}
                  </p>
                  <p className="text-sm">{appointment.department.name}</p>
                </div>
              </>
            )}

            {appointment.reason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('reason')}</p>
                  <p className="text-sm">{appointment.reason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes & Cancel Reason */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {t('notes')}
            </CardTitle>
            <CardDescription>
              {!appointment.notes && !appointment.cancelReason
                ? '-'
                : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('notes')}</p>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            )}

            {appointment.cancelReason && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <XCircle className="mr-1 inline h-4 w-4 text-destructive" />
                  {t('cancelReason')}
                </p>
                <p className="text-sm">{appointment.cancelReason}</p>
              </div>
            )}

            {/* Medical Record link */}
            {appointment.status === 'COMPLETED' && (
              <div className="pt-2">
                <Separator className="mb-4" />
                {appointment.medicalRecord ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/medical-records/${appointment.medicalRecord!.id}`)
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('viewMedicalRecord')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/medical-records/create?appointmentId=${appointment.id}&patientId=${appointment.patientId}`,
                      )
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('createMedicalRecord')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('actions.cancel')}</DialogTitle>
            <DialogDescription>{t('cancelReason')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">{t('reason')}</Label>
              <Textarea
                id="cancel-reason"
                placeholder={t('reason')}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelAppointment.isPending}
            >
              {cancelAppointment.isPending
                ? tCommon('loading')
                : t('actions.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('actions.reschedule')}</DialogTitle>
            <DialogDescription>
              {t('selectDate')} & {t('selectTimeSlot')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reschedule-date">{t('date')}</Label>
              <Input
                id="reschedule-date"
                type="date"
                min={today}
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleSlot(null);
                }}
                className="mt-1"
              />
            </div>

            {rescheduleDate && (
              <div>
                <Label>{t('selectTimeSlot')}</Label>
                <div className="mt-2">
                  <TimeSlotPicker
                    slots={rescheduleSlots}
                    isLoading={rescheduleSlotsLoading}
                    selectedSlot={rescheduleSlot}
                    onSelect={setRescheduleSlot}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={
                !rescheduleDate ||
                !rescheduleSlot ||
                rescheduleAppointment.isPending
              }
            >
              {rescheduleAppointment.isPending
                ? tCommon('loading')
                : t('actions.reschedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
