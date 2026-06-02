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
import { useCreateCity, useUpdateCity, type City } from '@/hooks/use-cities';

const GOVERNORATES = [
  'Damascus',
  'Rural Damascus',
  'Aleppo',
  'Homs',
  'Hama',
  'Latakia',
  'Tartus',
  'Idlib',
  'Daraa',
  'As-Suwayda',
  'Quneitra',
  'Deir ez-Zor',
  'Al-Hasakah',
  'Raqqa',
] as const;

const citySchema = z.object({
  name: z.string().min(1, 'Required'),
  nameAr: z.string().optional(),
  governorate: z.string().optional(),
});

type CityFormValues = z.infer<typeof citySchema>;

interface CityFormProps {
  city?: City | null;
  onSuccess: () => void;
}

export function CityForm({ city, onSuccess }: CityFormProps) {
  const { t } = useTranslation('cities');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();

  const isEditing = !!city;
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: '',
      nameAr: '',
      governorate: '',
    },
  });

  const selectedGovernorate = watch('governorate');

  useEffect(() => {
    if (city) {
      reset({
        name: city.name,
        nameAr: city.nameAr ?? '',
        governorate: city.governorate ?? '',
      });
    }
  }, [city, reset]);

  const onSubmit = async (values: CityFormValues) => {
    try {
      if (isEditing && city) {
        await updateCity.mutateAsync({
          id: city.id,
          data: {
            name: values.name,
            nameAr: values.nameAr || undefined,
            governorate: values.governorate || undefined,
          },
        });
        toast({ title: t('cityUpdated'), variant: 'success' });
      } else {
        await createCity.mutateAsync({
          name: values.name,
          nameAr: values.nameAr || undefined,
          governorate: values.governorate || undefined,
        });
        toast({ title: t('cityCreated'), variant: 'success' });
      }
      onSuccess();
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : tCommon('error'),
        variant: 'destructive',
      });
    }
  };

  const isPending = createCity.isPending || updateCity.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t('nameEn')}</Label>
          <Input id="name" {...register('name')} placeholder="Damascus" />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameAr">{t('nameAr')}</Label>
          <Input id="nameAr" dir="rtl" {...register('nameAr')} placeholder="دمشق" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="governorate">{t('governorate')}</Label>
        <Select
          value={selectedGovernorate ?? ''}
          onValueChange={(v) => setValue('governorate', v === 'NONE' ? '' : v, { shouldValidate: true })}
        >
          <SelectTrigger id="governorate">
            <SelectValue placeholder={t('selectGovernorate')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">{t('noGovernorate')}</SelectItem>
            {GOVERNORATES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || isSubmitting}>
          {isPending
            ? tCommon('loading')
            : isEditing
              ? t('updateCity')
              : t('createCity')}
        </Button>
      </div>
    </form>
  );
}
