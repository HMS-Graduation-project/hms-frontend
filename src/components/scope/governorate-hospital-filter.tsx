import { useTranslation } from 'react-i18next';
import { useGroupedDepartments } from '@/hooks/use-departments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GovernorateHospitalFilterProps {
  governorate: string;
  hospitalId: string;
  /** Called with '' when cleared. Implementations should reset hospitalId. */
  onGovernorateChange: (governorate: string) => void;
  onHospitalChange: (hospitalId: string) => void;
  /** Only fetch/render when the caller is national-scope. */
  enabled?: boolean;
}

/**
 * Cascading Governorate → Hospital filter, reused across the national-scope
 * list pages (Emergency, Inpatient, Referrals, Appointments). Sources its
 * options from the grouped-departments tree so no extra endpoint is needed.
 */
export function GovernorateHospitalFilter({
  governorate,
  hospitalId,
  onGovernorateChange,
  onHospitalChange,
  enabled = true,
}: GovernorateHospitalFilterProps) {
  const { t, i18n } = useTranslation('common');
  const isArabic = (i18n.language || 'en').split('-')[0] === 'ar';

  const { data } = useGroupedDepartments(enabled);
  const govOptions = data?.governorates ?? [];
  const selectedGov = govOptions.find((g) => g.governorate === governorate);
  const hospitalOptions = selectedGov
    ? selectedGov.hospitals
    : govOptions.flatMap((g) => g.hospitals);

  if (!enabled) return null;

  return (
    <>
      <Select
        value={governorate}
        onValueChange={(v) => onGovernorateChange(v === 'ALL' ? '' : v)}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder={t('governorate')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t('allGovernorates')}</SelectItem>
          {govOptions.map((g) => (
            <SelectItem key={g.governorate} value={g.governorate}>
              {g.governorate}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={hospitalId}
        onValueChange={(v) => onHospitalChange(v === 'ALL' ? '' : v)}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder={t('hospital')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t('allHospitals')}</SelectItem>
          {hospitalOptions.map((h) => (
            <SelectItem key={h.id} value={h.id}>
              {isArabic && h.nameAr ? h.nameAr : h.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
