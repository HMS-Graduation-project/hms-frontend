import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReportingPeriod } from '@/hooks/use-reporting';

interface PeriodSelectProps {
  value: ReportingPeriod;
  onChange: (value: ReportingPeriod) => void;
}

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  const { t } = useTranslation('reporting');
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ReportingPeriod)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">{t('period7d')}</SelectItem>
        <SelectItem value="30d">{t('period30d')}</SelectItem>
        <SelectItem value="90d">{t('period90d')}</SelectItem>
        <SelectItem value="365d">{t('period365d')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
