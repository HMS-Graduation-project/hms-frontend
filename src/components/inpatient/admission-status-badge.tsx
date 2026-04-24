import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { AdmissionStatus } from '@/hooks/use-inpatient';

const variantMap: Record<
  AdmissionStatus,
  'default' | 'success' | 'secondary' | 'destructive'
> = {
  ADMITTED: 'default',
  TRANSFERRED: 'secondary',
  DISCHARGED: 'success',
  DECEASED: 'destructive',
};

interface AdmissionStatusBadgeProps {
  status: AdmissionStatus;
  className?: string;
}

export function AdmissionStatusBadge({
  status,
  className,
}: AdmissionStatusBadgeProps) {
  const { t } = useTranslation('inpatient');
  return (
    <Badge variant={variantMap[status]} className={className}>
      {t(`admissionStatus.${status}`)}
    </Badge>
  );
}
