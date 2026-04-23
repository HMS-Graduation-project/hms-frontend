import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Pill,
  User,
  Stethoscope,
  Calendar,
  CheckCircle,
  Package,
} from 'lucide-react';
import {
  usePrescriptions,
  useUpdatePrescriptionStatus,
  type Prescription,
} from '@/hooks/use-prescriptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

export default function DispensingPage() {
  const { t } = useTranslation('pharmacy');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const { data, isLoading } = usePrescriptions({
    status: 'PENDING',
    limit: 50,
  });

  const updateStatus = useUpdatePrescriptionStatus();

  const handleDispense = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDispense = async () => {
    if (!selectedPrescription) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedPrescription.id,
        status: 'DISPENSED',
      });
      toast({
        title: t('dispensed'),
        variant: 'success',
      });
    } catch {
      toast({
        title: tCommon('error'),
        variant: 'destructive',
      });
    } finally {
      setConfirmDialogOpen(false);
      setSelectedPrescription(null);
    }
  };

  const prescriptions = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <Package className="mr-2 inline-block h-6 w-6" />
            {t('dispensingQueue')}
          </h1>
          <p className="text-muted-foreground">{t('dispensingSubtitle')}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value="dispensing">
        <TabsList>
          <TabsTrigger value="medications" asChild>
            <Link to="/pharmacy">{t('medications')}</Link>
          </TabsTrigger>
          <TabsTrigger value="dispensing" asChild>
            <Link to="/pharmacy/dispensing">{t('dispensing')}</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Prescriptions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t('noPendingPrescriptions')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onDispense={handleDispense}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Dispense Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('dispenseMedication')}</DialogTitle>
            <DialogDescription>{t('dispenseConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleConfirmDispense}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? tCommon('loading') : t('dispense')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prescription Card Sub-component
// ---------------------------------------------------------------------------

interface PrescriptionCardProps {
  prescription: Prescription;
  onDispense: (prescription: Prescription) => void;
  t: (key: string) => string;
}

function PrescriptionCard({
  prescription,
  onDispense,
  t,
}: PrescriptionCardProps) {
  const patientName = prescription.patient
    ? [
        prescription.patient.user.firstName,
        prescription.patient.user.lastName,
      ]
        .filter(Boolean)
        .join(' ') || prescription.patient.user.email
    : '--';

  const doctorName = prescription.doctor
    ? [
        prescription.doctor.user.firstName,
        prescription.doctor.user.lastName,
      ]
        .filter(Boolean)
        .join(' ') || prescription.doctor.user.email
    : '--';

  const prescriptionDate = new Date(
    prescription.createdAt
  ).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">
            <Link
              to={`/prescriptions/${prescription.id}`}
              className="hover:underline"
            >
              #{prescription.id.slice(0, 8)}
            </Link>
          </CardTitle>
          <Badge variant="secondary">
            {prescription._count?.items ?? 0} {t('medications').toLowerCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-3">
        {/* Patient */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">{t('patient')}:</span>
          <span className="font-medium truncate">{patientName}</span>
        </div>

        {/* Doctor */}
        <div className="flex items-center gap-2 text-sm">
          <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">{t('doctor')}:</span>
          <span className="font-medium truncate">{doctorName}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">{t('prescriptionDate')}:</span>
          <span className="font-medium">{prescriptionDate}</span>
        </div>

        {/* Medications List */}
        {prescription.items && prescription.items.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('prescribedMedications')}:
            </p>
            <div className="space-y-1">
              {prescription.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Pill className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{item.medicationName}</span>
                  {item.dosage && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {item.dosage}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button
          className="w-full"
          onClick={() => onDispense(prescription)}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {t('dispense')}
        </Button>
      </CardFooter>
    </Card>
  );
}
