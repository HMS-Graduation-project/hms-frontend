import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Pencil,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertCircle,
  Shield,
  Calendar,
  FileText,
  FlaskConical,
  CreditCard,
  Pill,
  Clock,
} from 'lucide-react';
import { usePatient } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PatientForm } from './patient-form';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');

  const { data: patient, isLoading } = usePatient(id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading) {
    return <PatientDetailSkeleton />;
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{tCommon('notFound')}</p>
      </div>
    );
  }

  const fullName = [patient.user.firstName, patient.user.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/patients')}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {fullName || patient.user.email}
            </h1>
            <p className="text-muted-foreground">{t('details')}</p>
          </div>
        </div>
        <Button
          onClick={() => setEditDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('editPatient')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="medical-history">{t('medicalHistory')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
          <TabsTrigger value="prescriptions">{t('prescriptions')}</TabsTrigger>
          <TabsTrigger value="lab-results">{t('labResults')}</TabsTrigger>
          <TabsTrigger value="billing">{t('billing')}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                {t('personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label={t('name')}
                  value={fullName}
                />
                <InfoItem
                  icon={<Mail className="h-4 w-4" />}
                  label={t('email')}
                  value={patient.user.email}
                />
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label={t('phone')}
                  value={patient.user.phone}
                />
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label={t('gender')}
                  value={
                    patient.user.gender
                      ? t(patient.user.gender.toLowerCase() as 'male' | 'female' | 'other')
                      : null
                  }
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label={t('dateOfBirth')}
                  value={
                    patient.user.dateOfBirth
                      ? new Date(patient.user.dateOfBirth).toLocaleDateString()
                      : null
                  }
                />
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label={t('address')}
                  value={patient.user.address}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5" />
                {t('medicalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('bloodType')}</p>
                  {patient.bloodType ? (
                    <Badge variant="secondary">{patient.bloodType}</Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">--</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('allergies')}</p>
                  <p className="text-sm">
                    {patient.allergies || t('noAllergies')}
                  </p>
                </div>
              </div>
              {patient.medicalNotes && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t('medicalNotes')}</p>
                    <p className="text-sm whitespace-pre-wrap">{patient.medicalNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5" />
                {t('emergencyContact')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label={t('emergencyContactName')}
                  value={patient.emergencyContactName}
                />
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label={t('emergencyContactPhone')}
                  value={patient.emergencyContactPhone}
                />
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label={t('emergencyContactRelation')}
                  value={patient.emergencyContactRelation}
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                {t('insurance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<Shield className="h-4 w-4" />}
                  label={t('insuranceProvider')}
                  value={patient.insuranceProvider}
                />
                <InfoItem
                  icon={<FileText className="h-4 w-4" />}
                  label={t('insurancePolicyNumber')}
                  value={patient.insurancePolicyNumber}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical-history">
          <PlaceholderTab
            icon={<Clock className="h-12 w-12" />}
            title={t('medicalHistory')}
          />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <PlaceholderTab
            icon={<Calendar className="h-12 w-12" />}
            title={t('appointments')}
          />
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <PlaceholderTab
            icon={<Pill className="h-12 w-12" />}
            title={t('prescriptions')}
          />
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="lab-results">
          <PlaceholderTab
            icon={<FlaskConical className="h-12 w-12" />}
            title={t('labResults')}
          />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <PlaceholderTab
            icon={<CreditCard className="h-12 w-12" />}
            title={t('billing')}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('editPatient')}</DialogTitle>
            <DialogDescription>{t('editPatient')}</DialogDescription>
          </DialogHeader>
          <PatientForm
            patient={patient}
            onSuccess={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium">{value || '--'}</p>
    </div>
  );
}

function PlaceholderTab({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-muted-foreground mb-4">{icon}</div>
        <CardTitle className="text-lg mb-2">{title}</CardTitle>
        <CardDescription>Coming in Phase 3</CardDescription>
      </CardContent>
    </Card>
  );
}

function PatientDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
