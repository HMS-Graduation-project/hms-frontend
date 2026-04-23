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
  Eye,
  IdCard,
  Hospital as HospitalIcon,
  AlertTriangle,
} from 'lucide-react';
import { usePatient } from '@/hooks/use-patients';
import { usePatientMedicalRecords } from '@/hooks/use-medical-records';
import { usePatientPrescriptions, type PrescriptionStatus } from '@/hooks/use-prescriptions';
import { useAuth } from '@/providers/auth-provider';
import { PatientTimeline } from '@/components/medical-records/patient-timeline';
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
  const { hospital } = useAuth();

  const { t: tMR } = useTranslation('medical-records');
  const { t: tRx } = useTranslation('prescriptions');

  const { data: patient, isLoading } = usePatient(id);
  const { data: medicalRecordsData, isLoading: isMRLoading } =
    usePatientMedicalRecords(patient?.id, { page: 1, limit: 20 });
  const { data: prescriptionsData, isLoading: isRxLoading } =
    usePatientPrescriptions(patient?.id, { page: 1, limit: 20 });
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

  const national = patient.nationalPatient;
  const fullName = [national?.firstName, national?.lastName]
    .filter(Boolean)
    .join(' ');
  const fullNameAr = [national?.firstNameAr, national?.lastNameAr]
    .filter(Boolean)
    .join(' ');

  const otherProfiles =
    national?.profiles?.filter((p) => p.id !== patient.id) ?? [];
  const allProfiles = national?.profiles ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/patients')}
            aria-label={t('backToList')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {fullName || patient.user?.email || t('unnamedPatient')}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {national?.id && (
                <span className="flex items-center gap-1">
                  <IdCard className="h-3 w-3" />
                  {t('nhid')}: {national.id.slice(0, 8)}
                  <span className="opacity-60">…</span>
                </span>
              )}
              {national?.syrianNationalId && (
                <>
                  <span className="opacity-50">·</span>
                  <span>
                    {t('syrianNationalId')}: {national.syrianNationalId}
                  </span>
                </>
              )}
            </div>
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

      {/* Critical alerts banner */}
      {national?.criticalAlerts && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">{t('criticalAlerts')}</p>
            <p className="text-sm">{national.criticalAlerts}</p>
          </div>
        </div>
      )}

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
          {/* Personal Information (from NationalPatient) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                {t('personalInfo')}
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {t('fromNationalRegistry')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label={t('name')}
                  value={fullName}
                />
                {fullNameAr && (
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label={t('nameAr')}
                    value={fullNameAr}
                  />
                )}
                <InfoItem
                  icon={<IdCard className="h-4 w-4" />}
                  label={t('syrianNationalId')}
                  value={national?.syrianNationalId}
                />
                <InfoItem
                  icon={<Mail className="h-4 w-4" />}
                  label={t('email')}
                  value={patient.user?.email}
                />
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label={t('phone')}
                  value={national?.phone}
                />
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label={t('gender')}
                  value={
                    national?.gender
                      ? t(
                          national.gender.toLowerCase() as
                            | 'male'
                            | 'female'
                            | 'other',
                          { defaultValue: national.gender },
                        )
                      : null
                  }
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label={t('dateOfBirth')}
                  value={
                    national?.dateOfBirth
                      ? new Date(national.dateOfBirth).toLocaleDateString()
                      : null
                  }
                />
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label={t('address')}
                  value={national?.address}
                />
              </div>
            </CardContent>
          </Card>

          {/* Registered at (cross-hospital) */}
          {allProfiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HospitalIcon className="h-5 w-5" />
                  {t('alsoRegisteredAt')}
                </CardTitle>
                <CardDescription>
                  {otherProfiles.length > 0
                    ? t('crossHospitalInformational')
                    : t('onlyHereSoFar')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allProfiles.map((p) => {
                    const isCurrent = p.id === patient.id;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {p.hospital.name}
                          </p>
                          {p.hospital.nameAr && (
                            <p
                              className="text-xs text-muted-foreground truncate"
                              dir="rtl"
                            >
                              {p.hospital.nameAr}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {p.hospital.code}
                          </p>
                        </div>
                        {isCurrent ? (
                          <Badge variant="success" className="text-[10px]">
                            {t('thisHospital')}
                          </Badge>
                        ) : (
                          hospital?.id === p.hospitalId && (
                            <Badge variant="success" className="text-[10px]">
                              {t('thisHospital')}
                            </Badge>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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
                  <p className="text-sm text-muted-foreground">
                    {t('bloodType')}
                  </p>
                  {patient.bloodType || national?.bloodType ? (
                    <Badge variant="secondary">
                      {patient.bloodType ?? national?.bloodType}
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">--</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t('allergies')}
                  </p>
                  <p className="text-sm">
                    {patient.allergies ??
                      national?.allergies ??
                      t('noAllergies')}
                  </p>
                </div>
                {national?.chronicConditions && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {t('chronicConditions')}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {national.chronicConditions}
                    </p>
                  </div>
                )}
              </div>
              {patient.medicalNotes && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {t('medicalNotes')}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {patient.medicalNotes}
                    </p>
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
        <TabsContent value="medical-history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{tMR('patientHistory')}</h3>
          </div>
          <PatientTimeline
            records={medicalRecordsData?.data ?? []}
            isLoading={isMRLoading}
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
        <TabsContent value="prescriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{tRx('title')}</h3>
          </div>
          {isRxLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !prescriptionsData?.data?.length ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Pill className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">{tRx('noMedications')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {prescriptionsData.data.map((rx) => {
                const rxDoctorName = rx.doctor
                  ? [rx.doctor.user.firstName, rx.doctor.user.lastName]
                      .filter(Boolean)
                      .join(' ')
                  : '';
                const statusBadge: Record<PrescriptionStatus, 'secondary' | 'success' | 'warning' | 'destructive'> = {
                  PENDING: 'secondary',
                  DISPENSED: 'success',
                  PARTIALLY_DISPENSED: 'warning',
                  CANCELLED: 'destructive',
                };
                return (
                  <Card
                    key={rx.id}
                    className="transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/prescriptions/${rx.id}`)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Pill className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {new Date(rx.createdAt).toLocaleDateString()}
                          </p>
                          {rxDoctorName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {tRx('prescribedBy')}: {rxDoctorName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={statusBadge[rx.status]}>
                          {tRx(`statuses.${rx.status}`)}
                        </Badge>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
