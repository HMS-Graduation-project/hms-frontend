import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  useCreateDepartment,
  useUpdateDepartment,
  type Department,
} from '@/hooks/use-departments';

const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  floor: z.string().optional(),
  phone: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  department?: Department | null;
  onSuccess: () => void;
}

export function DepartmentForm({ department, onSuccess }: DepartmentFormProps) {
  const { t } = useTranslation('departments');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const isEditing = !!department;

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      description: '',
      floor: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description ?? '',
        floor: department.floor ?? '',
        phone: department.phone ?? '',
      });
    }
  }, [department, reset]);

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      if (isEditing && department) {
        await updateDepartment.mutateAsync({
          id: department.id,
          data: values,
        });
        toast({
          title: t('departmentUpdated'),
          variant: 'success',
        });
      } else {
        await createDepartment.mutateAsync(values);
        toast({
          title: t('departmentCreated'),
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

  const isPending = createDepartment.isPending || updateDepartment.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={t('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder={t('description')}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Floor */}
        <div className="space-y-2">
          <Label htmlFor="floor">{t('floor')}</Label>
          <Input
            id="floor"
            {...register('floor')}
            placeholder={t('floor')}
          />
          {errors.floor && (
            <p className="text-sm text-destructive">{errors.floor.message}</p>
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
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending
            ? tCommon('loading')
            : isEditing
              ? t('updateDepartment')
              : t('createDepartment')}
        </Button>
      </div>
    </form>
  );
}
