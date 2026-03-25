import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useDoctor } from '@/hooks/use-doctors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DoctorForm } from './doctor-form';

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('doctors');
  const { t: tCommon } = useTranslation('common');

  const { data: doctor, isLoading } = useDoctor(id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('noResults')}</p>
        <Button
          variant="link"
          onClick={() => navigate('/doctors')}
          className="mt-2"
        >
          {t('backToList')}
        </Button>
      </div>
    );
  }

  const fullName = [doctor.user.firstName, doctor.user.lastName]
    .filter(Boolean)
    .join(' ') || doctor.user.email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/doctors')}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground">{t('details')}</p>
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)} className="w-full sm:w-auto">
          <Pencil className="mr-2 h-4 w-4" />
          {t('editDoctor')}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label={t('name')} value={fullName} />
            <Separator />
            <DetailRow label={t('email')} value={doctor.user.email} />
            <Separator />
            <DetailRow label={t('phone')} value={doctor.user.phone || '-'} />
            <Separator />
            <DetailRow
              label={t('availability')}
              value={
                <Badge variant={doctor.isAvailable ? 'success' : 'destructive'}>
                  {doctor.isAvailable ? t('available') : t('unavailable')}
                </Badge>
              }
            />
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('specialization')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label={t('specialization')} value={doctor.specialization} />
            <Separator />
            <DetailRow label={t('licenseNumber')} value={doctor.licenseNumber} />
            <Separator />
            <DetailRow
              label={t('department')}
              value={doctor.department?.name || t('noDepartment')}
            />
            <Separator />
            <DetailRow
              label={t('yearsExperience')}
              value={doctor.yearsExperience != null ? String(doctor.yearsExperience) : '-'}
            />
            <Separator />
            <DetailRow
              label={t('consultationFee')}
              value={doctor.consultationFee != null ? `$${doctor.consultationFee}` : '-'}
            />
          </CardContent>
        </Card>

        {/* Bio */}
        {doctor.bio && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{t('bio')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{doctor.bio}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('editDoctor')}</DialogTitle>
            <DialogDescription>{t('editDoctor')}</DialogDescription>
          </DialogHeader>
          <DoctorForm doctor={doctor} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
