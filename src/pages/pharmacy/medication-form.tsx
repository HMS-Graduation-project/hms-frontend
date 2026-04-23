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
import {
  useCreateMedication,
  useUpdateMedication,
  type Medication,
} from '@/hooks/use-pharmacy';

const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Injection',
  'Cream',
  'Drops',
] as const;

const DOSAGE_FORM_KEYS: Record<string, string> = {
  Tablet: 'tablet',
  Capsule: 'capsule',
  Syrup: 'syrup',
  Injection: 'injection',
  Cream: 'cream',
  Drops: 'drops',
};

const medicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genericName: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  unit: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  stock: z.coerce.number().int().min(0).optional(),
  reorderLevel: z.coerce.number().int().min(0).optional(),
  expiryDate: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  medication?: Medication | null;
  onSuccess: () => void;
}

export function MedicationForm({ medication, onSuccess }: MedicationFormProps) {
  const { t } = useTranslation('pharmacy');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const isEditing = !!medication;

  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      dosageForm: '',
      strength: '',
      unit: '',
      price: 0,
      stock: 0,
      reorderLevel: 10,
      expiryDate: '',
    },
  });

  const dosageFormValue = watch('dosageForm');

  useEffect(() => {
    if (medication) {
      reset({
        name: medication.name,
        genericName: medication.genericName ?? '',
        category: medication.category ?? '',
        manufacturer: medication.manufacturer ?? '',
        dosageForm: medication.dosageForm ?? '',
        strength: medication.strength ?? '',
        unit: medication.unit ?? '',
        price: medication.price,
        stock: medication.stock,
        reorderLevel: medication.reorderLevel,
        expiryDate: medication.expiryDate
          ? medication.expiryDate.slice(0, 10)
          : '',
      });
    }
  }, [medication, reset]);

  const onSubmit = async (values: MedicationFormValues) => {
    // Clean up empty strings to undefined
    const payload = {
      ...values,
      genericName: values.genericName || undefined,
      category: values.category || undefined,
      manufacturer: values.manufacturer || undefined,
      dosageForm: values.dosageForm || undefined,
      strength: values.strength || undefined,
      unit: values.unit || undefined,
      expiryDate: values.expiryDate || undefined,
    };

    try {
      if (isEditing && medication) {
        await updateMedication.mutateAsync({
          id: medication.id,
          data: payload,
        });
        toast({
          title: t('medicationUpdated'),
          variant: 'success',
        });
      } else {
        await createMedication.mutateAsync(payload);
        toast({
          title: t('medicationCreated'),
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

  const isPending = createMedication.isPending || updateMedication.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name & Generic Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <div className="space-y-2">
          <Label htmlFor="genericName">{t('genericName')}</Label>
          <Input
            id="genericName"
            {...register('genericName')}
            placeholder={t('genericName')}
          />
        </div>
      </div>

      {/* Category & Manufacturer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">{t('category')}</Label>
          <Input
            id="category"
            {...register('category')}
            placeholder={t('category')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manufacturer">{t('manufacturer')}</Label>
          <Input
            id="manufacturer"
            {...register('manufacturer')}
            placeholder={t('manufacturer')}
          />
        </div>
      </div>

      {/* Dosage Form & Strength */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('dosageForm')}</Label>
          <Select
            value={dosageFormValue || ''}
            onValueChange={(val) => setValue('dosageForm', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('dosageForm')} />
            </SelectTrigger>
            <SelectContent>
              {DOSAGE_FORMS.map((form) => (
                <SelectItem key={form} value={form}>
                  {t(DOSAGE_FORM_KEYS[form])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="strength">{t('strength')}</Label>
          <Input
            id="strength"
            {...register('strength')}
            placeholder={t('strength')}
          />
        </div>
      </div>

      {/* Unit & Price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="unit">{t('unit')}</Label>
          <Input
            id="unit"
            {...register('unit')}
            placeholder={t('unit')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">{t('price')}</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price')}
            placeholder={t('price')}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>
      </div>

      {/* Stock & Reorder Level */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stock">{t('stock')}</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            {...register('stock')}
            placeholder={t('stock')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorderLevel">{t('reorderLevel')}</Label>
          <Input
            id="reorderLevel"
            type="number"
            min="0"
            {...register('reorderLevel')}
            placeholder={t('reorderLevel')}
          />
        </div>
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
        <Input
          id="expiryDate"
          type="date"
          {...register('expiryDate')}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending
            ? tCommon('loading')
            : isEditing
              ? t('editMedication')
              : t('addMedication')}
        </Button>
      </div>
    </form>
  );
}
