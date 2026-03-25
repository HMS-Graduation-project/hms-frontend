import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  User,
  Stethoscope,
  Calendar,
  Pill,
} from 'lucide-react';
import {
  usePrescription,
  useUpdatePrescriptionStatus,
  type PrescriptionStatus,
} from '@/hooks/use-prescriptions';
import { PrintPrescription } from '@/components/prescriptions/print-prescription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  PrescriptionStatus,
  'secondary' | 'success' | 'warning' | 'destructive'
> = {
  PENDING: 'secondary',
  DISPENSED: 'success',
  PARTIALLY_DISPENSED: 'warning',
  CANCELLED: 'destructive',
};

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('prescriptions');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: prescription, isLoading } = usePrescription(id);
  const updateStatus = useUpdatePrescriptionStatus();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<PrescriptionStatus | null>(
    null
  );

  const handleStatusChange = (status: PrescriptionStatus) => {
    setTargetStatus(status);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!prescription || !targetStatus) return;
    try {
      await updateStatus.mutateAsync({
        id: prescription.id,
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

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <PrescriptionDetailSkeleton />;
  }

  if (!prescription) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('notFound')}</p>
      </div>
    );
  }

  const patientName = prescription.patient
    ? [
        prescription.patient.user.firstName,
        prescription.patient.user.lastName,
      ]
        .filter(Boolean)
        .join(' ') || prescription.patient.user.email
    : '';

  const doctorName = prescription.doctor
    ? [
        prescription.doctor.user.firstName,
        prescription.doctor.user.lastName,
      ]
        .filter(Boolean)
        .join(' ') || prescription.doctor.user.email
    : '';

  const prescriptionDate = new Date(
    prescription.createdAt
  ).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const canDispense =
    prescription.status === 'PENDING' ||
    prescription.status === 'PARTIALLY_DISPENSED';
  const canCancel = prescription.status === 'PENDING';

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
              {t('prescriptionDetail')}
            </h1>
            <p className="text-muted-foreground">{prescriptionDate}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1 sm:flex-none"
          >
            <Printer className="mr-2 h-4 w-4" />
            {t('print')}
          </Button>
          {canDispense && (
            <Button
              onClick={() => handleStatusChange('DISPENSED')}
              className="flex-1 sm:flex-none"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('actions.dispense')}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => handleStatusChange('CANCELLED')}
              className="flex-1 sm:flex-none"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t('actions.cancel')}
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('status')}:</span>
        <Badge variant={STATUS_BADGE_MAP[prescription.status]}>
          {t(`statuses.${prescription.status}`)}
        </Badge>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {prescription.patient && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t('prescribedFor')}
                </p>
                <Link
                  to={`/patients/${prescription.patientId}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {patientName}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        {prescription.doctor && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Stethoscope className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t('prescribedBy')}
                </p>
                <Link
                  to={`/doctors/${prescription.doctorId}`}
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
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {t('prescriptionDate')}
              </p>
              <p className="text-sm font-medium">{prescriptionDate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5" />
            {t('medications')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescription.items && prescription.items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('medication')}</TableHead>
                    <TableHead>{t('dosage')}</TableHead>
                    <TableHead>{t('frequency')}</TableHead>
                    <TableHead>{t('duration')}</TableHead>
                    <TableHead>{t('quantity')}</TableHead>
                    <TableHead>{t('instructions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescription.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {item.medicationName}
                      </TableCell>
                      <TableCell>{item.dosage}</TableCell>
                      <TableCell>{item.frequency}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>{item.quantity ?? '--'}</TableCell>
                      <TableCell>{item.instructions || '--'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noMedications')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {prescription.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{prescription.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Print component (hidden on screen) */}
      <PrintPrescription ref={printRef} prescription={prescription} />

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {targetStatus === 'DISPENSED'
                ? t('actions.dispense')
                : t('actions.cancel')}
            </DialogTitle>
            <DialogDescription>
              {targetStatus === 'DISPENSED'
                ? t('actions.dispense')
                : t('actions.cancel')}
            </DialogDescription>
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
              {updateStatus.isPending
                ? tCommon('loading')
                : tCommon('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PrescriptionDetailSkeleton() {
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
    </div>
  );
}
