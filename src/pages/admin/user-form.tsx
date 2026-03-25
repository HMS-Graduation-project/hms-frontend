import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUser, useUpdateUser, type User } from '@/hooks/use-users';

const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PATIENT',
  'PHARMACIST',
  'LAB_TECHNICIAN',
] as const;

function createUserSchema(isEditing: boolean) {
  const base = {
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email(),
    role: z.string().min(1),
    phone: z.string().optional(),
  };

  if (isEditing) {
    return z.object(base);
  }

  return z.object({
    ...base,
    password: z.string().min(6),
  });
}

type CreateFormValues = z.infer<ReturnType<typeof createUserSchema>>;

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { t } = useTranslation('users');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const isEditing = !!user;
  const schema = createUserSchema(isEditing);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      phone: '',
      ...(isEditing ? {} : { password: '' }),
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: CreateFormValues) => {
    try {
      if (isEditing && user) {
        const { email, role, firstName, lastName, phone } = values;
        await updateUser.mutateAsync({
          id: user.id,
          data: { email, role, firstName, lastName, phone },
        });
        toast({
          title: t('userUpdated'),
          variant: 'success',
        });
      } else {
        await createUser.mutateAsync(values as Parameters<typeof createUser.mutateAsync>[0]);
        toast({
          title: t('userCreated'),
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

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder={t('email')}
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
            {...register('password' as keyof CreateFormValues)}
            placeholder={t('password')}
          />
          {(errors as Record<string, { message?: string }>).password && (
            <p className="text-sm text-destructive">
              {(errors as Record<string, { message?: string }>).password?.message}
            </p>
          )}
        </div>
      )}

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">{t('role')}</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setValue('role', value, { shouldValidate: true })}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder={t('selectRole')} />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {tCommon(`roles.${role}`, { defaultValue: role })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

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

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending
            ? tCommon('loading')
            : isEditing
              ? t('updateUser')
              : t('createUser')}
        </Button>
      </div>
    </form>
  );
}
