import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  useCreateDoctor,
  useUpdateDoctor,
  useDepartmentsList,
  type DoctorProfile,
} from '@/hooks/use-doctors';

function createDoctorSchema(isEditing: boolean) {
  const base = {
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    specialization: z.string().min(1, 'Required'),
    licenseNumber: z.string().min(1, 'Required'),
    departmentId: z.string().optional(),
    bio: z.string().optional(),
    yearsExperience: z
      .union([z.coerce.number().int().min(0), z.literal('')])
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : val)),
    consultationFee: z
      .union([z.coerce.number().min(0), z.literal('')])
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : val)),
  };

  if (isEditing) {
    return z.object(base);
  }

  return z.object({
    ...base,
    email: z.string().email(),
    password: z.string().min(6),
  });
}

type DoctorFormValues = z.infer<ReturnType<typeof createDoctorSchema>>;

interface DoctorFormProps {
  doctor?: DoctorProfile | null;
  onSuccess: () => void;
}

export function DoctorForm({ doctor, onSuccess }: DoctorFormProps) {
  const { t } = useTranslation('doctors');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const isEditing = !!doctor;
  const schema = createDoctorSchema(isEditing);

  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const { data: departmentsData } = useDepartmentsList();

  const departments = departmentsData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      specialization: '',
      licenseNumber: '',
      departmentId: '',
      bio: '',
      yearsExperience: '' as unknown as undefined,
      consultationFee: '' as unknown as undefined,
      ...(isEditing ? {} : { email: '', password: '' }),
    },
  });

  const selectedDepartment = watch('departmentId');

  useEffect(() => {
    if (doctor) {
      reset({
        firstName: doctor.user.firstName ?? '',
        lastName: doctor.user.lastName ?? '',
        phone: doctor.user.phone ?? '',
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        departmentId: doctor.departmentId ?? '',
        bio: doctor.bio ?? '',
        yearsExperience: doctor.yearsExperience ?? ('' as unknown as undefined),
        consultationFee: doctor.consultationFee
          ? (Number(doctor.consultationFee) as unknown as undefined)
          : ('' as unknown as undefined),
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (values: DoctorFormValues) => {
    try {
      if (isEditing && doctor) {
        const { firstName, lastName, phone, specialization, licenseNumber, departmentId, bio, yearsExperience, consultationFee } = values;
        await updateDoctor.mutateAsync({
          id: doctor.id,
          data: {
            firstName,
            lastName,
            phone,
            specialization,
            licenseNumber,
            departmentId: departmentId || null,
            bio,
            yearsExperience: yearsExperience as number | undefined,
            consultationFee: consultationFee as number | undefined,
          },
        });
        toast({
          title: t('doctorUpdated'),
          variant: 'success',
        });
      } else {
        const payload = values as DoctorFormValues & { email: string; password: string };
        await createDoctor.mutateAsync({
          email: payload.email,
          password: payload.password,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone,
          specialization: payload.specialization as string,
          licenseNumber: payload.licenseNumber as string,
          departmentId: payload.departmentId || undefined,
          bio: payload.bio,
          yearsExperience: payload.yearsExperience as number | undefined,
          consultationFee: payload.consultationFee as number | undefined,
        });
        toast({
          title: t('doctorCreated'),
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

  const isPending = createDoctor.isPending || updateDoctor.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {/* Email & Password (create only) */}
      {!isEditing && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              {...register('email' as keyof DoctorFormValues)}
              placeholder={t('email')}
            />
            {(errors as Record<string, { message?: string }>).email && (
              <p className="text-sm text-destructive">
                {(errors as Record<string, { message?: string }>).email?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              {...register('password' as keyof DoctorFormValues)}
              placeholder={t('password')}
            />
            {(errors as Record<string, { message?: string }>).password && (
              <p className="text-sm text-destructive">
                {(errors as Record<string, { message?: string }>).password?.message}
              </p>
            )}
          </div>
        </>
      )}

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

      {/* Specialization & License Number */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="specialization">{t('specialization')}</Label>
          <Input
            id="specialization"
            {...register('specialization')}
            placeholder={t('specialization')}
          />
          {errors.specialization && (
            <p className="text-sm text-destructive">{errors.specialization.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">{t('licenseNumber')}</Label>
          <Input
            id="licenseNumber"
            {...register('licenseNumber')}
            placeholder={t('licenseNumber')}
          />
          {errors.licenseNumber && (
            <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>
          )}
        </div>
      </div>

      {/* Department */}
      <div className="space-y-2">
        <Label htmlFor="departmentId">{t('department')}</Label>
        <Select
          value={selectedDepartment ?? ''}
          onValueChange={(value) =>
            setValue('departmentId', value === 'NONE' ? '' : value, { shouldValidate: true })
          }
        >
          <SelectTrigger id="departmentId">
            <SelectValue placeholder={t('selectDepartment')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">{t('noDepartment')}</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.departmentId && (
          <p className="text-sm text-destructive">{errors.departmentId.message}</p>
        )}
      </div>

      {/* Years of Experience & Consultation Fee */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">{t('yearsExperience')}</Label>
          <Input
            id="yearsExperience"
            type="number"
            min={0}
            {...register('yearsExperience')}
            placeholder={t('yearsExperience')}
          />
          {errors.yearsExperience && (
            <p className="text-sm text-destructive">{errors.yearsExperience.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="consultationFee">{t('consultationFee')}</Label>
          <Input
            id="consultationFee"
            type="number"
            min={0}
            step="0.01"
            {...register('consultationFee')}
            placeholder={t('consultationFee')}
          />
          {errors.consultationFee && (
            <p className="text-sm text-destructive">{errors.consultationFee.message}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">{t('bio')}</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder={t('bio')}
          rows={3}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending
            ? tCommon('loading')
            : isEditing
              ? t('updateDoctor')
              : t('createDoctor')}
        </Button>
      </div>
    </form>
  );
}
