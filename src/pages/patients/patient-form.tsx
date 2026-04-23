import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  useCreatePatient,
  useUpdatePatient,
  type PatientProfile,
} from '@/hooks/use-patients';
import type { NationalPatient } from '@/hooks/use-national-registry';
import {
  NationalPatientSearch,
  type NationalPatientSearchResult,
} from '@/components/patients/national-patient-search';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
// NationalPatient uses capitalized gender values per backend.
const GENDERS = ['Male', 'Female', 'Other'] as const;

/* ------------------------------------------------------------------------- */
/*  Zod schemas                                                              */
/* ------------------------------------------------------------------------- */

// Hospital-local fields — always editable.
const localFieldsSchema = z.object({
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  medicalNotes: z.string().optional(),
});

// Optional login credentials (only for create).
const loginFieldsSchema = z.object({
  email: z
    .union([z.string().email(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  password: z
    .union([z.string().min(6), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

// Demographic fields — required in "new" mode; read-only in "existing" mode.
const newDemographicsSchema = z.object({
  syrianNationalId: z
    .string()
    .regex(/^\d{11}$/, { message: 'Must be 11 digits' }),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  firstNameAr: z.string().optional(),
  lastNameAr: z.string().optional(),
  dateOfBirth: z.string().min(1),
  gender: z.enum(GENDERS),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Schemas per flow
const createNewSchema = newDemographicsSchema
  .merge(localFieldsSchema)
  .merge(loginFieldsSchema);

const createLinkSchema = localFieldsSchema.merge(loginFieldsSchema);

const editSchema = localFieldsSchema;

type CreateNewValues = z.infer<typeof createNewSchema>;
type CreateLinkValues = z.infer<typeof createLinkSchema>;
type EditValues = z.infer<typeof editSchema>;

type Mode = 'search' | 'form';
type FlowKind = 'new' | 'existing' | 'edit';

interface PatientFormProps {
  patient?: PatientProfile | null;
  onSuccess: () => void;
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const isEditing = !!patient;

  const [mode, setMode] = useState<Mode>(isEditing ? 'form' : 'search');
  const [selectedNational, setSelectedNational] = useState<NationalPatient | null>(
    null,
  );

  // When editing, mode is always 'edit'. When creating, mode is 'new' or
  // 'existing' after the user makes a search choice.
  const flow: FlowKind = isEditing
    ? 'edit'
    : selectedNational
      ? 'existing'
      : 'new';

  const handleSearchSelect = (result: NationalPatientSearchResult) => {
    if (result.mode === 'existing') {
      setSelectedNational(result.nationalPatient);
    } else {
      setSelectedNational(null);
    }
    setMode('form');
  };

  const handleBackToSearch = () => {
    setSelectedNational(null);
    setMode('search');
  };

  if (!isEditing && mode === 'search') {
    return <NationalPatientSearch onSelect={handleSearchSelect} />;
  }

  return (
    <PatientFormInner
      key={flow + (selectedNational?.id ?? '')}
      patient={patient ?? null}
      selectedNational={selectedNational}
      flow={flow}
      onBack={isEditing ? undefined : handleBackToSearch}
      onSuccess={onSuccess}
    />
  );
}

/* ------------------------------------------------------------------------- */
/*  Inner form (active after step 1 is done or in edit mode)                 */
/* ------------------------------------------------------------------------- */

interface PatientFormInnerProps {
  patient: PatientProfile | null;
  selectedNational: NationalPatient | null;
  flow: FlowKind;
  onBack?: () => void;
  onSuccess: () => void;
}

function PatientFormInner({
  patient,
  selectedNational,
  flow,
  onBack,
  onSuccess,
}: PatientFormInnerProps) {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const defaultLocalValues = (): EditValues => ({
    bloodType: patient?.bloodType ?? '',
    allergies: patient?.allergies ?? '',
    emergencyContactName: patient?.emergencyContactName ?? '',
    emergencyContactPhone: patient?.emergencyContactPhone ?? '',
    emergencyContactRelation: patient?.emergencyContactRelation ?? '',
    insuranceProvider: patient?.insuranceProvider ?? '',
    insurancePolicyNumber: patient?.insurancePolicyNumber ?? '',
    medicalNotes: patient?.medicalNotes ?? '',
  });

  // Pick the schema based on flow.
  const activeSchema =
    flow === 'new'
      ? createNewSchema
      : flow === 'existing'
        ? createLinkSchema
        : editSchema;

  /**
   * A superset form type. Schema validation narrows individual fields per
   * flow; this shape just captures every possible field so a single
   * `useForm` call can be reused.
   */
  type FormValues = Partial<CreateNewValues> & Partial<CreateLinkValues> &
    EditValues & {
      syrianNationalId?: string;
      firstName?: string;
      lastName?: string;
      firstNameAr?: string;
      lastNameAr?: string;
      dateOfBirth?: string;
      gender?: string;
      phone?: string;
      address?: string;
      email?: string;
      password?: string;
    };

  const form = useForm<FormValues>({
    resolver: zodResolver(
      activeSchema as unknown as z.ZodType<FormValues>,
    ),
    defaultValues:
      flow === 'new'
        ? {
            syrianNationalId: '',
            firstName: '',
            lastName: '',
            firstNameAr: '',
            lastNameAr: '',
            dateOfBirth: '',
            gender: undefined,
            phone: '',
            address: '',
            email: '',
            password: '',
            ...defaultLocalValues(),
          }
        : flow === 'existing'
          ? {
              email: '',
              password: '',
              ...defaultLocalValues(),
            }
          : defaultLocalValues(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const selectedGender = watch('gender');
  const selectedBloodType = watch('bloodType');

  // Reset when editing a different patient (keeps form in sync).
  useEffect(() => {
    if (flow === 'edit') {
      reset(defaultLocalValues() as FormValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id, flow]);

  const nationalForDisplay: NationalPatient | null =
    selectedNational ?? patient?.nationalPatient ?? null;

  const fullNameDisplay = nationalForDisplay
    ? [nationalForDisplay.firstName, nationalForDisplay.lastName]
        .filter(Boolean)
        .join(' ')
    : '';

  const onSubmit = async (values: FormValues) => {
    try {
      if (flow === 'edit' && patient) {
        await updatePatient.mutateAsync({
          id: patient.id,
          data: {
            bloodType: values.bloodType || undefined,
            allergies: values.allergies || undefined,
            emergencyContactName: values.emergencyContactName || undefined,
            emergencyContactPhone: values.emergencyContactPhone || undefined,
            emergencyContactRelation: values.emergencyContactRelation || undefined,
            insuranceProvider: values.insuranceProvider || undefined,
            insurancePolicyNumber: values.insurancePolicyNumber || undefined,
            medicalNotes: values.medicalNotes || undefined,
          },
        });
        toast({ title: t('patientUpdated'), variant: 'success' });
      } else if (flow === 'existing' && selectedNational) {
        await createPatient.mutateAsync({
          nationalPatientId: selectedNational.id,
          email: values.email || undefined,
          password: values.password || undefined,
          bloodType: values.bloodType || undefined,
          allergies: values.allergies || undefined,
          emergencyContactName: values.emergencyContactName || undefined,
          emergencyContactPhone: values.emergencyContactPhone || undefined,
          emergencyContactRelation: values.emergencyContactRelation || undefined,
          insuranceProvider: values.insuranceProvider || undefined,
          insurancePolicyNumber: values.insurancePolicyNumber || undefined,
          medicalNotes: values.medicalNotes || undefined,
        });
        toast({ title: t('patientCreated'), variant: 'success' });
      } else {
        // New national + new profile. Zod schema guarantees the required
        // demographic fields are present in this branch.
        await createPatient.mutateAsync({
          syrianNationalId: values.syrianNationalId ?? '',
          firstName: values.firstName ?? '',
          lastName: values.lastName ?? '',
          firstNameAr: values.firstNameAr || undefined,
          lastNameAr: values.lastNameAr || undefined,
          dateOfBirth: values.dateOfBirth ?? '',
          gender: values.gender ?? '',
          phone: values.phone || undefined,
          address: values.address || undefined,
          email: values.email || undefined,
          password: values.password || undefined,
          bloodType: values.bloodType || undefined,
          allergies: values.allergies || undefined,
          emergencyContactName: values.emergencyContactName || undefined,
          emergencyContactPhone: values.emergencyContactPhone || undefined,
          emergencyContactRelation: values.emergencyContactRelation || undefined,
          insuranceProvider: values.insuranceProvider || undefined,
          insurancePolicyNumber: values.insurancePolicyNumber || undefined,
          medicalNotes: values.medicalNotes || undefined,
        });
        toast({ title: t('patientCreated'), variant: 'success' });
      }
      onSuccess();
    } catch {
      toast({ title: tCommon('error'), variant: 'destructive' });
    }
  };

  const isPending = createPatient.isPending || updatePatient.isPending;

  // error accessor that works across the union form values type
  const err = errors as Record<string, { message?: string } | undefined>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step-1 summary header (create only) */}
      {flow !== 'edit' && onBack && (
        <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/30 p-3">
          <div className="flex-1 min-w-0">
            {flow === 'existing' ? (
              <>
                <p className="text-xs font-medium text-muted-foreground">
                  {t('linkingToExisting')}
                </p>
                <p className="text-sm font-medium truncate">
                  {fullNameDisplay}
                </p>
                {nationalForDisplay?.syrianNationalId && (
                  <p className="text-xs text-muted-foreground">
                    {t('syrianNationalId')}:{' '}
                    {nationalForDisplay.syrianNationalId}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-muted-foreground">
                  {t('registeringNewNational')}
                </p>
                <p className="text-sm">{t('registeringNewNationalDesc')}</p>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            {t('change')}
          </Button>
        </div>
      )}

      {/* Edit-mode national-registry banner */}
      {flow === 'edit' && nationalForDisplay && (
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t('nationalRegistryRecord')}
              </p>
              <p className="text-sm font-medium">{fullNameDisplay}</p>
              {nationalForDisplay.syrianNationalId && (
                <p className="text-xs text-muted-foreground">
                  {t('syrianNationalId')}:{' '}
                  {nationalForDisplay.syrianNationalId}
                </p>
              )}
            </div>
            <Button
              asChild
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <Link to={`/admin/national-registry?nhid=${nationalForDisplay.id}`}>
                <ExternalLink className="mr-1 h-3 w-3" />
                {t('editInNationalRegistry')}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Demographics section */}
      {flow !== 'edit' && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {t('nationalDemographics')}
          </h4>
          <div className="space-y-4">
            {/* Syrian National ID */}
            <div className="space-y-2">
              <Label htmlFor="syrianNationalId">{t('syrianNationalId')}</Label>
              {flow === 'new' ? (
                <Input
                  id="syrianNationalId"
                  inputMode="numeric"
                  maxLength={11}
                  {...register('syrianNationalId')}
                  placeholder={t('nationalIdPlaceholder')}
                />
              ) : (
                <Input
                  id="syrianNationalId"
                  readOnly
                  value={nationalForDisplay?.syrianNationalId ?? ''}
                  className="bg-muted"
                />
              )}
              {err.syrianNationalId?.message && (
                <p className="text-sm text-destructive">
                  {err.syrianNationalId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')}</Label>
                {flow === 'new' ? (
                  <Input id="firstName" {...register('firstName')} />
                ) : (
                  <Input
                    id="firstName"
                    readOnly
                    value={nationalForDisplay?.firstName ?? ''}
                    className="bg-muted"
                  />
                )}
                {err.firstName?.message && (
                  <p className="text-sm text-destructive">
                    {err.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')}</Label>
                {flow === 'new' ? (
                  <Input id="lastName" {...register('lastName')} />
                ) : (
                  <Input
                    id="lastName"
                    readOnly
                    value={nationalForDisplay?.lastName ?? ''}
                    className="bg-muted"
                  />
                )}
                {err.lastName?.message && (
                  <p className="text-sm text-destructive">
                    {err.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {flow === 'new' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstNameAr">{t('firstNameAr')}</Label>
                  <Input
                    id="firstNameAr"
                    dir="rtl"
                    {...register('firstNameAr')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastNameAr">{t('lastNameAr')}</Label>
                  <Input
                    id="lastNameAr"
                    dir="rtl"
                    {...register('lastNameAr')}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
                {flow === 'new' ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                  />
                ) : (
                  <Input
                    id="dateOfBirth"
                    readOnly
                    value={
                      nationalForDisplay?.dateOfBirth
                        ? nationalForDisplay.dateOfBirth.substring(0, 10)
                        : ''
                    }
                    className="bg-muted"
                  />
                )}
                {err.dateOfBirth?.message && (
                  <p className="text-sm text-destructive">
                    {err.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">{t('gender')}</Label>
                {flow === 'new' ? (
                  <Select
                    value={selectedGender || ''}
                    onValueChange={(value) =>
                      setValue(
                        'gender',
                        value as 'Male' | 'Female' | 'Other',
                        { shouldValidate: true },
                      )
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder={t('selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {t(g.toLowerCase() as 'male' | 'female' | 'other')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="gender"
                    readOnly
                    value={nationalForDisplay?.gender ?? ''}
                    className="bg-muted"
                  />
                )}
                {err.gender?.message && (
                  <p className="text-sm text-destructive">
                    {err.gender.message}
                  </p>
                )}
              </div>
            </div>

            {flow === 'new' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t('address')}</Label>
                  <Input id="address" {...register('address')} />
                </div>
              </div>
            )}
          </div>
          <Separator className="my-6" />
        </div>
      )}

      {/* Optional login credentials (create only) */}
      {flow !== 'edit' && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {t('loginCredentialsOptional')}
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            {t('loginCredentialsHelp')}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t('email')}
              />
              {err.email?.message && (
                <p className="text-sm text-destructive">{err.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder={t('password')}
              />
              {err.password?.message && (
                <p className="text-sm text-destructive">
                  {err.password.message}
                </p>
              )}
            </div>
          </div>
          <Separator className="my-6" />
        </div>
      )}

      {/* Hospital-local medical info */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {t('medicalInfo')}
          {flow !== 'edit' && (
            <Badge variant="outline" className="ml-2 text-[10px]">
              {t('hospitalLocal')}
            </Badge>
          )}
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bloodType">{t('bloodType')}</Label>
            <Select
              value={(selectedBloodType as string) || ''}
              onValueChange={(value) =>
                setValue('bloodType', value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="bloodType">
                <SelectValue placeholder={t('selectBloodType')} />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map((bt) => (
                  <SelectItem key={bt} value={bt}>
                    {bt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">{t('allergies')}</Label>
            <Textarea
              id="allergies"
              {...register('allergies')}
              placeholder={t('allergies')}
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Emergency contact */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {t('emergencyContact')}
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">
                {t('emergencyContactName')}
              </Label>
              <Input
                id="emergencyContactName"
                {...register('emergencyContactName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">
                {t('emergencyContactPhone')}
              </Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                {...register('emergencyContactPhone')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelation">
              {t('emergencyContactRelation')}
            </Label>
            <Input
              id="emergencyContactRelation"
              {...register('emergencyContactRelation')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Insurance */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {t('insurance')}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">{t('insuranceProvider')}</Label>
            <Input
              id="insuranceProvider"
              {...register('insuranceProvider')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurancePolicyNumber">
              {t('insurancePolicyNumber')}
            </Label>
            <Input
              id="insurancePolicyNumber"
              {...register('insurancePolicyNumber')}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending
            ? tCommon('loading')
            : flow === 'edit'
              ? t('updatePatient')
              : t('createPatient')}
        </Button>
      </div>
    </form>
  );
}
