import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

function createPatientSchema(isEditing: boolean) {
  const base = {
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelation: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
  };

  if (isEditing) {
    return z.object(base);
  }

  return z.object({
    ...base,
    password: z.string().min(6),
  });
}

type PatientFormValues = z.infer<ReturnType<typeof createPatientSchema>>;

interface PatientFormProps {
  patient?: PatientProfile | null;
  onSuccess: () => void;
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const isEditing = !!patient;
  const schema = createPatientSchema(isEditing);

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      address: '',
      bloodType: '',
      allergies: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      ...(isEditing ? {} : { password: '' }),
    },
  });

  const selectedGender = watch('gender');
  const selectedBloodType = watch('bloodType');

  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.user.firstName ?? '',
        lastName: patient.user.lastName ?? '',
        email: patient.user.email,
        phone: patient.user.phone ?? '',
        gender: patient.user.gender ?? '',
        dateOfBirth: patient.user.dateOfBirth
          ? patient.user.dateOfBirth.substring(0, 10)
          : '',
        address: patient.user.address ?? '',
        bloodType: patient.bloodType ?? '',
        allergies: patient.allergies ?? '',
        emergencyContactName: patient.emergencyContactName ?? '',
        emergencyContactPhone: patient.emergencyContactPhone ?? '',
        emergencyContactRelation: patient.emergencyContactRelation ?? '',
        insuranceProvider: patient.insuranceProvider ?? '',
        insurancePolicyNumber: patient.insurancePolicyNumber ?? '',
      });
    }
  }, [patient, reset]);

  const onSubmit = async (values: PatientFormValues) => {
    try {
      if (isEditing && patient) {
        const { email, ...rest } = values;
        void email;
        await updatePatient.mutateAsync({
          id: patient.id,
          data: rest,
        });
        toast({
          title: t('patientUpdated'),
          variant: 'success',
        });
      } else {
        await createPatient.mutateAsync(
          values as Parameters<typeof createPatient.mutateAsync>[0]
        );
        toast({
          title: t('patientCreated'),
          variant: 'success',
        });
      }
      onSuccess();
    } catch {
      toast({
        title: tCommon('error'),
        variant: 'destructive',
      });
    }
  };

  const isPending = createPatient.isPending || updatePatient.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {t('personalInfo')}
        </h4>
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t('email')}
              disabled={isEditing}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password (create only) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                {...register('password' as keyof PatientFormValues)}
                placeholder={t('password')}
              />
              {(errors as Record<string, { message?: string }>).password && (
                <p className="text-sm text-destructive">
                  {(errors as Record<string, { message?: string }>).password?.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('firstName')}</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder={t('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('lastName')}</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder={t('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder={t('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">{t('gender')}</Label>
              <Select
                value={selectedGender}
                onValueChange={(value) =>
                  setValue('gender', value, { shouldValidate: true })
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
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder={t('address')}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Medical Information */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {t('medicalInfo')}
        </h4>
        <div className="space-y-4">
          {/* Blood Type */}
          <div className="space-y-2">
            <Label htmlFor="bloodType">{t('bloodType')}</Label>
            <Select
              value={selectedBloodType}
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
            {errors.bloodType && (
              <p className="text-sm text-destructive">{errors.bloodType.message}</p>
            )}
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">{t('allergies')}</Label>
            <Textarea
              id="allergies"
              {...register('allergies')}
              placeholder={t('allergies')}
              rows={3}
            />
            {errors.allergies && (
              <p className="text-sm text-destructive">{errors.allergies.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Emergency Contact */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {t('emergencyContact')}
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Emergency Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">{t('emergencyContactName')}</Label>
              <Input
                id="emergencyContactName"
                {...register('emergencyContactName')}
                placeholder={t('emergencyContactName')}
              />
              {errors.emergencyContactName && (
                <p className="text-sm text-destructive">
                  {errors.emergencyContactName.message}
                </p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">
                {t('emergencyContactPhone')}
              </Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                {...register('emergencyContactPhone')}
                placeholder={t('emergencyContactPhone')}
              />
              {errors.emergencyContactPhone && (
                <p className="text-sm text-destructive">
                  {errors.emergencyContactPhone.message}
                </p>
              )}
            </div>
          </div>

          {/* Emergency Contact Relation */}
          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelation">
              {t('emergencyContactRelation')}
            </Label>
            <Input
              id="emergencyContactRelation"
              {...register('emergencyContactRelation')}
              placeholder={t('emergencyContactRelation')}
            />
            {errors.emergencyContactRelation && (
              <p className="text-sm text-destructive">
                {errors.emergencyContactRelation.message}
              </p>
            )}
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
          {/* Insurance Provider */}
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">{t('insuranceProvider')}</Label>
            <Input
              id="insuranceProvider"
              {...register('insuranceProvider')}
              placeholder={t('insuranceProvider')}
            />
            {errors.insuranceProvider && (
              <p className="text-sm text-destructive">
                {errors.insuranceProvider.message}
              </p>
            )}
          </div>

          {/* Insurance Policy Number */}
          <div className="space-y-2">
            <Label htmlFor="insurancePolicyNumber">
              {t('insurancePolicyNumber')}
            </Label>
            <Input
              id="insurancePolicyNumber"
              {...register('insurancePolicyNumber')}
              placeholder={t('insurancePolicyNumber')}
            />
            {errors.insurancePolicyNumber && (
              <p className="text-sm text-destructive">
                {errors.insurancePolicyNumber.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending
            ? tCommon('loading')
            : isEditing
              ? t('updatePatient')
              : t('createPatient')}
        </Button>
      </div>
    </form>
  );
}
